/**
 * Holds all functions copied from gcoap_cli.c in examples/gcoap
 */

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "periph_cpu.h"
#include "periph/gpio.h"
#include "net/gcoap.h"
#include "od.h"
#include "fmt.h"
#include "xtimer.h"
#include "timex.h"
#include "ct_sensor.h"
#include "lcd_1602a.h"

/* Current transformer parameters needed for current calculations. */
ct_parameter_t ct_param;
/* The measured data by the current transformer. */
ct_i_data_t ct_i_data;

static void _resp_handler(unsigned req_state, coap_pkt_t* pdu,
                          sock_udp_ep_t *remote);
/*
 * Response callback.
 * Handles response sent by server after sending the request
 */
static void _resp_handler(unsigned req_state, coap_pkt_t* pdu,
                          sock_udp_ep_t *remote)
{
    (void)remote;       /* not interested in the source currently */

    if (req_state == GCOAP_MEMO_TIMEOUT) {
        printf("gcoap: timeout for msg ID %02u\n", coap_get_id(pdu));
        return;
    }
    else if (req_state == GCOAP_MEMO_ERR) {
        printf("gcoap: error in response\n");
        return;
    }

    char *class_str = (coap_get_code_class(pdu) == COAP_CLASS_SUCCESS)
                            ? "Success" : "Error";
    printf("gcoap: response %s, code %1u.%02u", class_str,
                                                coap_get_code_class(pdu),
                                                coap_get_code_detail(pdu));
    if (pdu->payload_len) {
        if (pdu->content_type == COAP_FORMAT_TEXT
                || pdu->content_type == COAP_FORMAT_LINK
                || coap_get_code_class(pdu) == COAP_CLASS_CLIENT_FAILURE
                || coap_get_code_class(pdu) == COAP_CLASS_SERVER_FAILURE) {
            /* Expecting diagnostic payload in failure cases */
            printf(", %u bytes\n%.*s\n", pdu->payload_len, pdu->payload_len,
                                                          (char *)pdu->payload);
        }
        else {
            printf(", %u bytes\n", pdu->payload_len);
            od_hex_dump(pdu->payload, pdu->payload_len, OD_WIDTH_DEFAULT);
        }
    }
    else {
        printf(", empty payload\n");
    }
}

/* Use to send message to remote client/server using CoAP */
size_t send(uint8_t *buf, size_t len, char *addr_str, char *port_str)
{
    ipv6_addr_t addr;
    size_t bytes_sent;
    sock_udp_ep_t remote;
    remote.family = AF_INET6;
    /* parse for interface */
    int iface = ipv6_addr_split_iface(addr_str);
    if (iface == -1) {
        if (gnrc_netif_numof() == 1) {
            /* assign the single interface found in gnrc_netif_numof() */
            remote.netif = (uint16_t)gnrc_netif_iter(NULL)->pid;
        }
        else {
            remote.netif = SOCK_ADDR_ANY_NETIF;
        }
    }
    else {
        if (gnrc_netif_get_by_pid(iface) == NULL) {
            puts("gcoap_cli: interface not valid");
            return 0;
        }
        remote.netif = iface;
    }
    /* parse destination address */
    if (ipv6_addr_from_str(&addr, addr_str) == NULL) {
        puts("gcoap_cli: unable to parse destination address");
        return 0;
    }
    if ((remote.netif == SOCK_ADDR_ANY_NETIF) && ipv6_addr_is_link_local(&addr)) {
        puts("gcoap_cli: must specify interface for link local target");
        return 0;
    }
    memcpy(&remote.addr.ipv6[0], &addr.u8[0], sizeof(addr.u8));
    /* parse port */
    remote.port = atoi(port_str);
    if (remote.port == 0) {
        puts("gcoap_cli: unable to parse destination port");
        return 0;
    }
    bytes_sent = gcoap_req_send2(buf, len, &remote, _resp_handler);
    if (bytes_sent > 0) {
    }
    return bytes_sent;
}

int dump_current_cmd(int argc, char **argv)
{
    /* These parameters are not used in this method. */
    (void)argc;
    (void)argv;

    /* Stores the data and parameters used for measuring current. */
    ct_i_data_t data;
    ct_parameter_t param;

    /* Parameters used for analog-input-pin (adc). */
    // NOTE: This is already done in the main.
    //int line = 0;
    //adc_res_t res = ADC_RES_12BIT;
    int bit = 12;

    /* Timer parameters. */
    xtimer_ticks32_t last = xtimer_now();
    int delay = (3000LU * US_PER_MS); /*< 1 second. */

    /* Parameters based on a nucleo-f446re. */
    param.adc_count = 1 << bit;              /*< 4096 */
    param.adc_offset = param.adc_count >> 1; /*< 2048 */
    param.v_ref = 3.3;                       /*< 3.3V */
    param.r_burden = 110;                    /*< 110Ohm */
    param.turns = 2000;                      /*< turns on the magnet */
    param.samples = 32;                      /*< number of samples */

    /* LCD 1602A initializations using a nucleo-f446re board. */
    lcd_iface_t iface = MODE_4BIT;
    lcd_pins_t pins;
    pins.rs = GPIO_PIN(PORT_A, 9);
    pins.rw = GPIO_PIN(PORT_A, 8);
    pins.e = GPIO_PIN(PORT_C, 7);
    pins.d0 = 0;
    pins.d1 = 0;
    pins.d2 = 0;
    pins.d3 = 0;
    pins.d4 = GPIO_PIN(PORT_B, 3);
    pins.d5 = GPIO_PIN(PORT_B, 5);
    pins.d6 = GPIO_PIN(PORT_B, 4);
    pins.d7 = GPIO_PIN(PORT_B, 10);

    lcd_init(iface, &pins);
    /* Init the adc using riot abstraction layer. */
    // NOTE: This is already done in the main.
    // init_adc(line, res);

    /* Measures the current using the parameters and stores the measurements
     * inside the data reference. Then sleep for 'DELAY' and loop this forever.
     */
    while (1) {
        ct_measure_current(&param, &data);

        /* This could be a place to access the data */
        // ...

        ct_dump_current(&data);
        xtimer_periodic_wakeup(&last, delay);
        lcd_write('A');
    }

    /* Should never be reached. */
    return 0;
}

int testsend_cmd(int argc, char **argv)
{
    /* Parameters needed for accurate measurement */
    ct_param.adc_count = 1 << 12;              // e.g.: 1 << 12 = 4096
    ct_param.adc_offset = ct_param.adc_count >> 1; // e.g.: 4096 >> 1 = 2048
    ct_param.v_ref = 3.3;
    ct_param.r_burden = 110;
    ct_param.turns = 2000;
    ct_param.samples = 32; // The number of iterations of the for-loop.

    ct_measure_current(&ct_param, &ct_i_data);
    ct_dump_current(&ct_i_data);

    float current = ct_i_data.current;

    /* Ordered like the RFC method code numbers, but off by 1. GET is code 0. */
    char *method_codes[] = {"get", "post", "put"};
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    coap_pkt_t pdu;
    size_t len;

    char fmt_buf[10] = {""};
    fmt_float(fmt_buf, current, 2);
    len = strlen(fmt_buf);

    if (argc == 1) {
        /* show help for main commands */
        goto end;
    }

    if (strcmp(argv[1], "info") == 0) {
        printf("CoAP server is listening on port %u\n", GCOAP_PORT);
        return 0;
    }

    /* if not 'info', must be a method code */
    int code_pos = -1;
    for (size_t i = 0; i < sizeof(method_codes) / sizeof(char*); i++) {
        if (strcmp(argv[1], method_codes[i]) == 0) {
            code_pos = i;
        }
    }
    if (code_pos == -1) {
        goto end;
    }

    /* parse options */
    int apos          = 2;               /* position of address argument */
    unsigned msg_type = COAP_TYPE_NON;
    if (argc > apos && strcmp(argv[apos], "-c") == 0) {
        msg_type = COAP_TYPE_CON;
        apos++;
    }

    if (argc == apos + 3 || argc == apos + 4) {
        gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, code_pos+1, argv[apos+2]);
        if (argc == apos + 4) {
            memcpy(pdu.payload, fmt_buf, strlen(fmt_buf));
        }
        coap_hdr_set_type(pdu.hdr, msg_type);

        if (argc == apos + 4) {
            len = gcoap_finish(&pdu, strlen(fmt_buf), COAP_FORMAT_TEXT);
        }
        else {
            len = gcoap_finish(&pdu, 0, COAP_FORMAT_NONE);
        }

        printf("gcoap_cli: sending msg ID %u, %u bytes\n", coap_get_id(&pdu),
               (unsigned) len);
        if (!send(&buf[0], len, argv[apos], argv[apos+1])) {
            puts("gcoap_cli: msg send failed");
        }
        return 0;
    }
    else {
        printf("usage: %s <get|post|put> [-c] <addr>[%%iface] <port> <path> [data]\n",
               argv[0]);
        printf("Options\n");
        printf("    -c  Send confirmably (defaults to non-confirmable)\n");
        return 1;
    }

    end:
    printf("usage: %s <get|post|put|info>\n", argv[0]);
    return 1;
}
/*
 * This is only used for debugging through the shell.*/
int gcoap_cli_cmd(int argc, char **argv)
{
    /* Ordered like the RFC method code numbers, but off by 1. GET is code 0. */
    char *method_codes[] = {"get", "post", "put"};
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    coap_pkt_t pdu;
    size_t len;

    if (argc == 1) {
        /* show help for main commands */
        goto end;
    }

    if (strcmp(argv[1], "info") == 0) {
        printf("CoAP server is listening on port %u\n", GCOAP_PORT);
        return 0;
    }

    /* if not 'info', must be a method code */
    int code_pos = -1;
    for (size_t i = 0; i < sizeof(method_codes) / sizeof(char*); i++) {
        if (strcmp(argv[1], method_codes[i]) == 0) {
            code_pos = i;
        }
    }
    if (code_pos == -1) {
        goto end;
    }

    /* parse options */
    int apos          = 2;               /* position of address argument */
    unsigned msg_type = COAP_TYPE_NON;
    if (argc > apos && strcmp(argv[apos], "-c") == 0) {
        msg_type = COAP_TYPE_CON;
        apos++;
    }

    if (argc == apos + 3 || argc == apos + 4) {
        gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, code_pos+1, argv[apos+2]);
        if (argc == apos + 4) {
            memcpy(pdu.payload, argv[apos+3], strlen(argv[apos+3]));
        }
        coap_hdr_set_type(pdu.hdr, msg_type);

        if (argc == apos + 4) {
            len = gcoap_finish(&pdu, strlen(argv[apos+3]), COAP_FORMAT_TEXT);
        }
        else {
            len = gcoap_finish(&pdu, 0, COAP_FORMAT_NONE);
        }

        printf("gcoap_cli: sending msg ID %u, %u bytes\n", coap_get_id(&pdu),
               (unsigned) len);
        if (!send(&buf[0], len, argv[apos], argv[apos+1])) {
            puts("gcoap_cli: msg send failed");
        }
        return 0;
    }
    else {
        printf("usage: %s <get|post|put> [-c] <addr>[%%iface] <port> <path> [data]\n",
               argv[0]);
        printf("Options\n");
        printf("    -c  Send confirmably (defaults to non-confirmable)\n");
        return 1;
    }

    end:
    printf("usage: %s <get|post|put|info>\n", argv[0]);
    return 1;
}
