/*
 * Copyright (c) 2015-2017 Ken Bannister. All rights reserved.
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @author      Ken Bannister <kb2ma@runbox.com>
 *              M Aiman Ismail <m.aimanismail@gmail.com>
 *
 */

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "periph/adc.h"
#include "ct_sensor.h"
#include "net/gcoap.h"
#include "od.h"
#include "fmt.h"
#include "xtimer.h"
#include "thread.h"
#include "saul_reg.h"
#include "cbor.h"
#include "net/gnrc/rpl/dodag.h"

#include "backend.h"

#include "features.h"

#include "button.h"
#include "periph/gpio.h"
#if FEATURE_USE_BUTTONS
    //button_t * estop_btn;
    //button_t * manual_btn;
    gpio_t estop_btn;
    gpio_t manual_btn;
    gpio_t estop_led = GPIO_PIN(PORT_D, 5);
    gpio_t manual_led = GPIO_PIN(PORT_E, 3);
    gpio_t switch_state_led = GPIO_PIN(PORT_D, 7);
#endif /* FEATURE_USE_BUTTONS */

#include "lcd1602a.h"
#if FEATURE_USE_DISPLAY
    lcd1602a_dev_t * spr_lcd;
    lcd1602a_iface_t spr_iface = MODE_4BIT;
    lcd1602a_dotsize_t spr_dotsize = DOTSIZE_5x8;
#endif /* FEATURE_USE_DISPLAY */

#define ENABLE_DEBUG            (0)
#include "debug.h"

#define SENDDATA_QUEUE_SIZE     (8)

#define CON_THRESH              (300)
#define DEBOUNCE_THRESHOLD      (500000)       /**< 0.5 second */

#define BACKEND_REG             "/new-device"  /**< Backend resource to register new devices */
#define BACKEND_SEND            "/measure"     /**< Backend resource to accept measurements */
#define BACKEND_PORT            "9900"         /**< Port the backend listens to */
#define SPR_INTERVAL            (15)           /* Default 15 seconds*/

#define LINE                    (0)
#define RES                     ADC_RES_12BIT

extern size_t send(uint8_t *buf, size_t len, char *addr_str, char *port_str);
extern void indent(int nestingLevel);
extern void dumpbytes(const uint8_t *buf, size_t len);
extern bool dumprecursive(CborValue *it, int nestingLevel);

static ssize_t _config_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);
/* test/debug */
static ssize_t _value_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);

static char base_addr[NANOCOAP_URI_MAX];

/* variables for senddata thread */
static kernel_pid_t senddata_pid;
static char senddata_stack[THREAD_STACKSIZE_DEFAULT + THREAD_EXTRA_STACKSIZE_PRINTF];

/* variables for button_listener_thread */
static kernel_pid_t button_listener_pid;
static char button_listener_stack[THREAD_STACKSIZE_DEFAULT + THREAD_EXTRA_STACKSIZE_PRINTF];

/* CoAP resources */
static const coap_resource_t _resources[] = {
    { "/config", COAP_GET | COAP_PUT, _config_handler, NULL },
    { "/value", COAP_PUT, _value_handler, NULL },
};

static gcoap_listener_t _listener = {
    (coap_resource_t *)&_resources[0],
    sizeof(_resources) / sizeof(_resources[0]),
    NULL
};

/* configs send to /config */
struct spr_config {
    uint64_t pwr_period;    /* pwr_period (interval) for measuring */
    bool switch_state;      /* current power state (ON/OFF) */
    bool estop;             /* estop mode flag */
    bool manual;            /* Manual control flag */
};

static struct spr_config cfg = { 0 };

/* Called everytime one of cfg values (estop, manual, switch_state) changed */
static void _eval_switch_state_led(void) {
    if (cfg.estop) {
        gpio_write(switch_state_led, 0);
        puts("DEBUG: switch_state_led turned OFF");
    }
    else if (cfg.manual || cfg.switch_state) {
        gpio_write(switch_state_led, 1);
        puts("DEBUG: switch_state_led turned ON");
    }
    else {
        gpio_write(switch_state_led, 0);
        puts("DEBUG: switch_state_led turned OFF");
    }
}

static inline void send_cbor(const char *key, bool val, char *addr, char *port)
{
    uint8_t key_buf[16];
    CborEncoder encoder;
    CborEncoder map;
    cbor_encoder_init(&encoder, key_buf, sizeof(key_buf), 0);
    CborError err = cbor_encoder_create_map(&encoder, &map, 1);
    if (err != 0)
        printf("error: create map %d\n", err);

    cbor_encode_text_stringz(&map, key);
    cbor_encode_boolean(&map, val);
    cbor_encoder_close_container(&encoder, &map);

    coap_pkt_t pdu;
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, COAP_METHOD_PUT, BACKEND_CONFIG);
    coap_hdr_set_type(pdu.hdr, COAP_TYPE_CON);

    memcpy(pdu.payload, &key_buf[0], sizeof(key_buf));
    size_t len = gcoap_finish(&pdu, sizeof(key_buf), COAP_FORMAT_CBOR);
    // printf("len: %u. ip: %s. port: %s\n", len, argv[2], argv[3]);
    if (send(&buf[0], len, addr, port) == 0)
    {
        puts("gcoap_cli: msg send failed");
    }
}

static void *button_cb_listener(void *arg)
{
    (void) arg;
    uint32_t manual_last_debounce = 0;
    uint32_t estop_last_debounce = 0;

    msg_t msg;

    while (1) {
        msg_receive(&msg);
        if (strcmp(msg.content.ptr, "ESTOP") == 0) {
            if ((xtimer_now_usec() - estop_last_debounce) > DEBOUNCE_THRESHOLD) {
                puts("estop pressed");

                cfg.estop = !cfg.estop;
                send_cbor("estop", cfg.estop, base_addr, BACKEND_PORT);
                _eval_switch_state_led();
                estop_last_debounce = xtimer_now_usec();
            }
        }
        else if (strcmp(msg.content.ptr, "MANUAL") == 0) {
            if ((xtimer_now_usec() - manual_last_debounce) > DEBOUNCE_THRESHOLD) {
                puts("manual pressed");

                cfg.manual = !cfg.manual;
                send_cbor("manual", cfg.manual, base_addr, BACKEND_PORT);
                _eval_switch_state_led();
                manual_last_debounce = xtimer_now_usec();
            }
        }
    }

    return NULL;
}

static void *send_data(void *arg)
{
    (void)arg;

    /* Current transformer parameters needed for current calculations. */
    ct_parameter_t ct_param;
    /* The measured data by the current transformer. */
    ct_i_data_t ct_i_data;

    /* Parameters needed for accurate measurement */
    ct_param.adc_count = 1 << 12;
    ct_param.adc_offset = ct_param.adc_count >> 1;
    ct_param.v_ref = 3.3;
    ct_param.r_burden = 110;
    ct_param.turns = 2000;
    ct_param.samples = 32;

    /* prepare packet to send */
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    coap_pkt_t pdu;
    size_t len;

    /* stop send if pwr_period 0 */
    uint32_t sleeptime = cfg.pwr_period;

    float apparent;

    /* Reset the cursor. */
    // NOTE: This function sleeps for about 2 seconds!
    //lcd1602a_cursor_reset(spr_lcd);

#if FEATURE_USE_DISPLAY
    /* Clear the entire display. */
    // NOTE: This takes about 2 seconds, but should not hurt here!
    lcd1602a_display_clear(spr_lcd);
    //xtimer_sleep(3);
#endif

    while (sleeptime) {
        puts("sending data to pi");
        gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, COAP_METHOD_PUT, BACKEND_SEND);       // change server resource '/value' here

        /* measure current */
        ct_measure_current(&ct_param, &ct_i_data);
        ct_dump_current(&ct_i_data);
        apparent = ct_i_data.apparent;

#if FEATURE_USE_DISPLAY
        /* Write the current and the apparent to the LCD. */
        // Convert the current into a char buffer.
        char current_str[8] = {' '};
        fmt_float(current_str, ct_i_data.current, 2);

        // Convert the apparent into a char buffer.
        char apparent_str[8] = {' '};
        fmt_float(apparent_str, ct_i_data.apparent, 2);

        lcd1602a_cursor_set(spr_lcd, 0, 0);

        lcd1602a_write_buf(spr_lcd, "Ampere: ");
        lcd1602a_write_buf(spr_lcd, current_str);

        // Reposition the cursor on the second line.
        lcd1602a_cursor_set(spr_lcd, 0, 1);

        lcd1602a_write_buf(spr_lcd, "Watt: ");
        lcd1602a_write_buf(spr_lcd, apparent_str);
#endif /* USE_DISPLAY */

        /* copy read value to packet payload */
        memcpy(pdu.payload, &apparent, sizeof (apparent));

        /* set packet CONFIRMABLE if pwr_period >= 15 minutes */
        if (cfg.pwr_period >= CON_THRESH) {
            coap_hdr_set_type(pdu.hdr, COAP_TYPE_CON);
        }
        else {
            coap_hdr_set_type(pdu.hdr, COAP_TYPE_NON);
        }

        /* finish the packet */
        len = gcoap_finish(&pdu, sizeof (apparent), COAP_FORMAT_TEXT);

        /* send the packet */
        puts("Sending measurent to pi");
        if (!send(&buf[0], len, base_addr, BACKEND_PORT)) {  // FIXME: change address
                puts("gcoap_cli: msg send failed");
        }

        xtimer_sleep(sleeptime);
        sleeptime = cfg.pwr_period;
    }

    /* reset pid to 0 if thread stopped */
    senddata_pid = 0;

    return NULL;
}

static ssize_t _value_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx)
{
  (void)ctx;

  printf("value handler");

  unsigned method_flag = coap_method2flag(coap_get_code_detail(pdu));

  switch (method_flag) {
      case COAP_PUT: {
          printf("coap put\n");
            if (pdu->content_type == COAP_FORMAT_TEXT
                    || pdu->content_type == COAP_FORMAT_LINK
                    || coap_get_code_class(pdu) == COAP_CLASS_CLIENT_FAILURE
                    || coap_get_code_class(pdu) == COAP_CLASS_SERVER_FAILURE) {
                /* Expecting diagnostic payload in failure cases */
                printf(", %u bytes\n%.*s\n", pdu->payload_len, pdu->payload_len,
                                                              (char *)pdu->payload);
            }
            else if (pdu->content_type == COAP_FORMAT_CBOR) {
                puts("value handler: got cbor!");
                dumpbytes(pdu->payload, pdu->payload_len);
            }

            return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
      }
  }
  return -1;
}

static ssize_t _config_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx)
{
    (void)ctx;

    unsigned method_flag = coap_method2flag(coap_get_code_detail(pdu));

    switch (method_flag) {
        case COAP_GET:
            puts("Got GET at /config");

            if (pdu->content_type == COAP_FORMAT_CBOR) {
                puts("config handler: got cbor!");
            }
            gcoap_resp_init(pdu, buf, len, COAP_CODE_CONTENT);

            CborEncoder encoder;
            uint8_t encoder_buf[64];
            cbor_encoder_init(&encoder, encoder_buf, sizeof(encoder_buf), 0);

            CborEncoder map;
            CborError err = cbor_encoder_create_map(&encoder, &map, 4);   /* 4 == number of element in cfg struct */
            if (err != 0)
                printf("error: create map %d\n", err);

            /* encode pwr_period */
            cbor_encode_text_stringz(&map, "pwr_period");
            cbor_encode_uint(&map , (uint64_t)cfg.pwr_period);

            /* encode switch_state */
            cbor_encode_text_stringz(&map, "switch_state");
            cbor_encode_boolean(&map , cfg.switch_state);

            /* encode estop status */
            cbor_encode_text_stringz(&map, "estop");
            cbor_encode_boolean(&map , cfg.estop);

            /* encode manual status */
            cbor_encode_text_stringz(&map, "manual");
            cbor_encode_boolean(&map , cfg.manual);

            err = cbor_encoder_close_container(&encoder, &map);
            if (err != 0)
                printf("error: close map %d\n", err);

            puts("debug: sending this bytes:");
            dumpbytes((const uint8_t *)&encoder_buf, sizeof(encoder_buf));
            puts("");

            return gcoap_finish(pdu, sizeof(encoder_buf), COAP_FORMAT_CBOR);

        case COAP_PUT: {
            puts("got PUT at /config");
            if (pdu->content_type == COAP_FORMAT_CBOR) {
                dumpbytes(pdu->payload, pdu->payload_len);
                puts("");
            }
            /* parse payload to CborValue it*/
            CborParser parser;
            CborValue iterator;
            CborError err = cbor_parser_init(pdu->payload, pdu->payload_len, 0, &parser, &iterator);
            /* check if iterator is a map */
            if (!cbor_value_is_map(&iterator)) {
                puts("not map");
                return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
            }
            if (!err) {
                CborValue copy;
                memcpy(&copy, &iterator, sizeof(iterator));
                puts("dumping payload:");
                err = dumprecursive(&copy, 0);
            }
            else
                printf("error: cbor %d\n", err);

            /* find configs in map */

            CborValue pwr_period;
            cbor_value_map_find_value(&iterator, "pwr_period", &pwr_period);
            if (cbor_value_get_type(&pwr_period) != CborInvalidType) {
                cbor_value_get_uint64(&pwr_period, &cfg.pwr_period);
                printf("Got new pwr_period: %llu\n", cfg.pwr_period);

                /* we don't need to do anything here. senddata thread checks
                 * pwr_periods and stop when 0 */
            }

            /* device can be turned on/off from frontend ONLY when manual == false 
             * AND estop == false */
            CborValue switch_state;
            cbor_value_map_find_value(&iterator, "switch_state", &switch_state);
            if (cbor_value_get_type(&switch_state) != CborInvalidType) {
                cbor_value_get_boolean(&switch_state, &cfg.switch_state);
                printf("Got new switch_state: %s\n", cfg.switch_state ? "true" : "false");
                _eval_switch_state_led();
            }

            if (senddata_pid == 0) {
                /* start thread send_data */
                puts("starting senddata thread");
                senddata_pid = thread_create(senddata_stack, sizeof(senddata_stack),
                        THREAD_PRIORITY_MAIN - 1, 0, send_data, NULL, "senddata");
            }
            thread_wakeup(senddata_pid);
            return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
        }
    }

    return -1;
}

static void _register(char *base_addr)
{
    /* prepare packet to send */
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    coap_pkt_t pdu;
    size_t len;

    /* send POST to /new-device */
    gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, COAP_METHOD_POST, BACKEND_REG);
    /* set confirmable */
    coap_hdr_set_type(pdu.hdr, COAP_TYPE_CON);

    uint8_t features_buf[64];
    features_init(features_buf, sizeof(features_buf));

    /* copy features to payload */
    memcpy(pdu.payload, features_buf, sizeof(features_buf));
    len = gcoap_finish(&pdu, sizeof(features_buf), COAP_FORMAT_CBOR);
    if (!send(&buf[0], len, base_addr, BACKEND_PORT)) {
        puts("gcoap_cli: msg send failed");
    }
}

static void find_base_station(char * base_addr)
{
    gnrc_rpl_dodag_t dodag = gnrc_rpl_instances[0].dodag;
    ipv6_addr_t dodag_id = dodag.dodag_id;
    ipv6_addr_to_str(base_addr, &dodag_id, IPV6_ADDR_MAX_STR_LEN);
}

#if FEATURE_USE_BUTTONS
/* Callback function for the estop pin */
static void cb_estop(void *arg)
{
    (void)arg;

    msg_t msg = { .content = { .ptr = "ESTOP" } };
    msg_send(&msg, button_listener_pid);
}

/* Callback function for the manual pin */
static void cb_manual(void *arg)
{
    (void)arg;

    msg_t msg = { .content = { .ptr = "MANUAL" } };
    msg_send(&msg, button_listener_pid);
}

#endif /* FEATURE_USE_BUTTONS */

void spr_init(lcd1602a_dev_t * lcd)
{
#if FEATURE_USE_BUTTONS

    /* Initializing the pin for the estop button.
     * NOTE: Try to use another pin configuration for port and pin number!
     */
    int estop_pin = 18;
    int estop_port = 4; /*< PORT_A = 0; B = 1; C = 2; D = 3; E = 4 */

    estop_btn = GPIO_PIN(estop_port, estop_pin);

    gpio_irq_enable(estop_btn);

    if (gpio_init_int(estop_btn, GPIO_IN_PU, GPIO_RISING, cb_estop, (void *)estop_pin) < 0) {
        printf(">>> ERROR: init_int of GPIO_PIN(%i, %i) failed\n", estop_port, estop_pin);
    } else {
        printf(">>> GPIO_PIN(%i, %i) successfully initialized as ext int\n", estop_port, estop_pin);
    }

    /* Initializing the pin for the manual button.
     * NOTE: Try to use another pin configuration for port and pin number!
     */

    // NOTE: First try one button at the time!! Try the manual button, when
    // The estop button works!
    int manual_pin = 19;
    int manual_port = 4;
    manual_btn = GPIO_PIN(manual_port, manual_pin);

    gpio_irq_enable(manual_btn);

    if (gpio_init_int(manual_btn, GPIO_IN_PU, GPIO_RISING, cb_manual, (void *)manual_pin) < 0) {
        printf(">>> ERROR: init_int of GPIO_PIN(%i, %i) failed\n", manual_port, manual_pin);
    } else {
        printf(">>> GPIO_PIN(%i, %i) successfully initialized as ext int\n", manual_port, manual_pin);
    }

    gpio_init(manual_led, GPIO_OUT);
    gpio_init(estop_led, GPIO_OUT);
    gpio_init(switch_state_led, GPIO_OUT);
    gpio_clear(switch_state_led);
    /*
    // We not use button.c for the moment. Instead we just use directly
    // The RIOT GPIO abstraction layer to initialize the pins for the Buttons
    // and the interrupts. Just in case the button-wrapper does not work atm.
    int port_e = 4;
    int ret_code = 0;

    ret_code = button_init(estop_btn, port_e, 2, cb_estop, "test-estop");

    if (ret_code < 0) {
        printf("SPR: INIT -> failed to initialze estop button\n");
    }

    ret_code = button_init(manual_btn, port_e, 3, cb_manual, "test-manual");

    if (ret_code < 0) {
        printf("SPR: INIT -> failed to initialize manual button\n");
    }
    */
#else
    printf("SPR: Buttons not enabled!\n");
#endif /* FEATURE_USE_BUTTONS */


    /* Initialize the adc on line 0 with 12 bit resolution. */
    init_adc(LINE, RES);

#if FEATURE_USE_DISPLAY
    spr_lcd = lcd;
#else
    printf("SPR: LCD not enabled!\n");
    (void)lcd;
#endif /* FEATURE_USE_DISPLAY */

    /* Register CoAP resources */
    gcoap_register_listener(&_listener);

    /* Find RPI/Basisstation */
    find_base_station(base_addr);
    // hardcode the base address for test
    strncpy(base_addr, "fe80::e47d:265e:b0a0:1a01", NANOCOAP_URI_MAX);

    xtimer_sleep(2);
    /* Register Basisstation */
    _register(base_addr);

    /* Start button callback listener */
    button_listener_pid = thread_create(button_listener_stack, sizeof(button_listener_stack),
                                        THREAD_PRIORITY_MAIN - 1, 0, button_cb_listener,
                                        NULL, "butrcv");
}

/**
* Ein 'true' signalisiert, dass der Nutzen den "E-Stop"
* Button auf dem Messknoten gedrueckt hat und der
* Messknoten die Stromzufuhr gekappt hat.
 */
int estop_cmd(int argc, char **argv)
{
    /* Check if we use the right amount of argmunets. */
    if (argc < 2 || argc > 4) {
        printf("estop usage: estop [ on | off | status ]\n");
        return 1;
    }

    /* Compare the first argument and turn it on or off. */
    if (strcmp(argv[1], "on") == 0) {
        send_cbor("estop", true, base_addr, BACKEND_PORT);
        cfg.estop = true;
        _eval_switch_state_led();
    } else if (strcmp(argv[1], "off") == 0) {
        send_cbor("estop", false, base_addr, BACKEND_PORT);
        cfg.estop = false;
        _eval_switch_state_led();
    } else if (strcmp(argv[1], "status") == 0) {
        printf("Current estop status: %s\n", cfg.estop ? "true" : "false");
    } else {
        printf("Usage: estop [ on | off | status]\n");
        return 1;
    }

    return 0;
}

/**
* Signalisiert, dass der Nutzer den 'Manual-Modus am
* Messknoten aktiviert hat: d.h., dass der 'switch_state'
* keinen Einfluss mehr hat; Strom ist dauerhaft an.
* Dieser Manual-Mode kann vom Endnutzer genutzt werden um
* den switch_state zu ueberschreiben.
 */
int manual_cmd(int argc, char **argv)
{
    /* Check if we use the right amount of argmunets. */
    if (argc < 2 || argc > 4) {
        printf("Usage: manual [ on | off | status ]\n");
        return 1;
    }

    /* Compare the first argument and turn it on or off. */
    if (strcmp(argv[1], "on") == 0) {
        send_cbor("manual", true, base_addr, BACKEND_PORT);
        cfg.manual = true;
        _eval_switch_state_led();
    } else if (strcmp(argv[1], "off") == 0) {
        send_cbor("manual", false, base_addr, BACKEND_PORT);
        cfg.manual = false;
        _eval_switch_state_led();
    } else if (strcmp(argv[1], "status") == 0) {
        printf("Current manual status: %s\n", cfg.manual ? "true" : "false");
    } else {
        printf("Usage: manual [ on | off | status ]\n");
        return 1;
    }

    return 0;
}

int switch_cmd(int argc, char **argv)
{
    /* Check if we use the right amount of argmunets. */
    if (argc < 2 || argc > 4) {
        printf("Usage: switch [ on | off | status ]\n");
        return 1;
    }

    /* Compare the first argument and turn it on or off. */
    if (strcmp(argv[1], "on") == 0) {
        send_cbor("switch", true, base_addr, BACKEND_PORT);
        cfg.switch_state = true;
        // TODO: Update the spr_config parameters
        _eval_switch_state_led();
    } else if (strcmp(argv[1], "off") == 0) {
        send_cbor("switch", false, base_addr, BACKEND_PORT);
        cfg.switch_state = false;
        _eval_switch_state_led();
    } else if (strcmp(argv[1], "status") == 0) {
        printf("Current switch_state: %s\n", cfg.switch_state ? "true" : "false");
    } else {
        printf("Usage: switch [ on | off | status]\n");
        return 1;
    }


    return 0;
}
