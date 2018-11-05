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

#define ENABLE_DEBUG (0)
#include "debug.h"

#define SPR_INTERVAL (15)       /* Default 15 seconds*/

#define SPR_NOT_CONFIGURED      (0)
#define SPR_CONFIGURING         (1)
#define SPR_CONFIGURED          (2)

#define BLINK_QUEUE_SIZE        (8)
#define SENDDATA_QUEUE_SIZE     (8)

#define LED_NUM         (0)

#define SPR_SENDDATA_STOP           (0)
#define SPR_SENDDATA_START           (1)

#define COAP_METHOD_PUT         (3)

/* ADC pin parameters. */
#define LINE (0)
#define RES ADC_RES_12BIT /*< Use 'ADC_RES_10BIT' for arduino's. */

extern size_t send(uint8_t *buf, size_t len, char *addr_str, char *port_str);

static ssize_t _config_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);

/* test/debug */
static ssize_t _value_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);
static ssize_t _interval_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);
static ssize_t _start_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);

static uint32_t interval = SPR_INTERVAL;
static uint8_t config_status = 0;
static uint8_t start_status = 0;

static kernel_pid_t blink_pid;
static char blink_stack[THREAD_STACKSIZE_DEFAULT + THREAD_EXTRA_STACKSIZE_PRINTF];
static msg_t blink_queue[BLINK_QUEUE_SIZE];

static kernel_pid_t senddata_pid;
static char senddata_stack[THREAD_STACKSIZE_DEFAULT + THREAD_EXTRA_STACKSIZE_PRINTF];
static msg_t senddata_queue[SENDDATA_QUEUE_SIZE];

/* CoAP resources */
static const coap_resource_t _resources[] = {
    { "/config", COAP_GET | COAP_PUT, _config_handler, NULL },
    { "/interval", COAP_GET | COAP_PUT, _interval_handler, NULL },
    { "/start", COAP_GET, _start_handler, NULL },
    { "/value", COAP_PUT, _value_handler, NULL },
};

static gcoap_listener_t _listener = {
    (coap_resource_t *)&_resources[0],
    sizeof(_resources) / sizeof(_resources[0]),
    NULL
};

static void *blink_light(void *arg)
{
    (void)arg;

    msg_t msg;
    msg.content.value = 1;

    /* Value to turn LED on/off */
    phydat_t on, off;
    memset(&on, 0, sizeof(on));
    memset(&off, 0, sizeof(off));
    on.val[0] = 1;
    off.val[0] = 0;

    /* get LED from SAUL */
    saul_reg_t *led;
    led = saul_reg_find_nth(LED_NUM);

    msg_init_queue(blink_queue, BLINK_QUEUE_SIZE);

    int continue_loop = 1;
    while (continue_loop) {
        /* turn LED on and off */
        saul_reg_write(led, &on);
        xtimer_sleep(1);
        saul_reg_write(led, &off);
        xtimer_sleep(1);

        msg_try_receive(&msg);
        continue_loop = msg.content.value;
    }

    return NULL;
}

static void *send_data(void *arg)
{
    (void)arg;
    (void)interval;

    msg_t msg;
    msg.content.value = 1;

    msg_init_queue(senddata_queue, SENDDATA_QUEUE_SIZE);

    /* Current transformer parameters needed for current calculations. */
    ct_parameter_t ct_param;
    /* The measured data by the current transformer. */
    ct_i_data_t ct_i_data;

    float apparent;

    /* Parameters needed for accurate measurement */
    ct_param.adc_count = 1 << 12;              // e.g.: 1 << 12 = 4096
    ct_param.adc_offset = ct_param.adc_count >> 1; // e.g.: 4096 >> 1 = 2048
    ct_param.v_ref = 3.3;
    ct_param.r_burden = 110;
    ct_param.turns = 2000;
    ct_param.samples = 32; // The number of iterations of the for-loop.

    /* prepare packet to send */
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    coap_pkt_t pdu;
    size_t len;

    /* send data repeatedly */
    int continue_loop = 1;
    while (continue_loop) {
        gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, COAP_METHOD_PUT, "/value");       // change server resource '/value' here

        /* measure current */
        ct_measure_current(&ct_param, &ct_i_data);
        ct_dump_current(&ct_i_data);
        apparent = ct_i_data.apparent;

        /* copy read value to packet payload */
        memcpy(pdu.payload, &apparent, sizeof (apparent));

        /* explicitly set packet to NON-confirmable */
        coap_hdr_set_type(pdu.hdr, COAP_TYPE_NON);

        /* finish the packet */
        len = gcoap_finish(&pdu, sizeof (apparent), COAP_FORMAT_TEXT);

        /* send the packet */
        puts("Sending measurent to pi");
        if (!send(&buf[0], len, "fd00:1:2:3:a02d:51f7:cdf4:a686", "5683")) {  // FIXME: change address
                puts("gcoap_cli: msg send failed");
        }

        msg_try_receive(&msg);
        continue_loop = msg.content.value;
    }

    return NULL;
}

static ssize_t _value_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx)
{
  (void)ctx;

  printf("value handler");

  unsigned method_flag = coap_method2flag(coap_get_code_detail(pdu));

  switch (method_flag) {
      case COAP_PUT: {
          printf("coap put");
          /* Limit interval value only to 5 digit (e.g. 15000)
           * Reserve space for 5 digit interval value + \0 */
          char payload[16] = { 0 };
          memcpy(payload, (char *)pdu->payload, pdu->payload_len);
          //interval = (uint8_t)strtoul(payload, NULL, 10);

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

          if (pdu->payload_len <= 128) {
              return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
          }
          else {
              return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
          }
      }
  }
  return -1;
}

static ssize_t _interval_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx)
{
    (void)ctx;

    unsigned method_flag = coap_method2flag(coap_get_code_detail(pdu));

    switch (method_flag) {
        case COAP_GET:
            gcoap_resp_init(pdu, buf, len, COAP_CODE_CONTENT);

            /* write the response buffer with the request count value */
            size_t payload_len = fmt_u16_dec((char *)pdu->payload, interval);

            return gcoap_finish(pdu, payload_len, COAP_FORMAT_TEXT);

        case COAP_PUT: {
            /* Limit interval value only to 5 digit (e.g. 15000)
             * Reserve space for 5 digit interval value + \0 */
            char payload[6] = { 0 };
            memcpy(payload, (char *)pdu->payload, pdu->payload_len);
            interval = (uint8_t)strtoul(payload, NULL, 10);

            if (pdu->payload_len <= 5) {
                return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
            }
            else {
                return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
            }
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
            /* return configuration status
             * 0 - not configured, 1 - being configured
             * 2 - configured */

            gcoap_resp_init(pdu, buf, len, COAP_CODE_CONTENT);

            /* write the response buffer with the request count value */
            size_t payload_len = fmt_u16_dec((char *)pdu->payload, config_status);

            return gcoap_finish(pdu, payload_len, COAP_FORMAT_TEXT);

        case COAP_PUT: {
            char payload[3] = { 0 };
            memcpy(payload, (char *)pdu->payload, pdu->payload_len);
            config_status = (uint8_t)strtoul(payload, NULL, 10);

            if (config_status == SPR_NOT_CONFIGURED || config_status == SPR_CONFIGURED) {
                    /* stop thread blink_light */
                    msg_t msg;
                    msg.content.value = 0;
                    int ret = msg_try_send(&msg, blink_pid);
                    if (ret == 0) {
                        puts("Receiver queue full");
                    }
                    else if (ret < 0) {
                        puts("ERROR: invalid PID");
                    }
            }
            else if (config_status == SPR_CONFIGURING) {
                    /* start thread blink_ligth LED to signal which sensor node is being configured */
                    blink_pid = thread_create(blink_stack, sizeof(blink_stack),
                            THREAD_PRIORITY_MAIN - 1, 0, blink_light, NULL, "blink");
            }
            else {
                /* value not valid */
                return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
            }

            if (pdu->payload_len <= 2) {
                return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
            }
            else {
                return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
            }
        }
    }

    return -1;
}

static ssize_t _start_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx)
{
    (void)ctx;

    /* send ACK response */
    unsigned method_flag = coap_method2flag(coap_get_code_detail(pdu));

    switch (method_flag) {
        case COAP_GET:
            /* return start send status
             * 0 - not started , 1 - started */

            gcoap_resp_init(pdu, buf, len, COAP_CODE_CONTENT);

            /* write the response buffer with the request count value */
            size_t payload_len = fmt_u16_dec((char *)pdu->payload, start_status);

            return gcoap_finish(pdu, payload_len, COAP_FORMAT_TEXT);
        case COAP_PUT: {
            char payload[3] = { 0 };
            memcpy(payload, (char *)pdu->payload, pdu->payload_len);
            start_status = (uint8_t)strtoul(payload, NULL, 10);

            if (start_status == SPR_SENDDATA_STOP) {
                    /* stop thread senddata */
                    msg_t msg;
                    msg.content.value = 0;
                    puts("stopping thread senddata");
                    int ret = msg_try_send(&msg, senddata_pid);
                    if (ret == 0) {
                        puts("Receiver queue full");
                    }
                    else if (ret < 0) {
                        puts("ERROR: invalid PID; sendata thread not started");
                    }
            }
            else if (start_status == SPR_SENDDATA_START) {
                    /* start thread send_data */
                    puts("starting senddata thread");
                    senddata_pid = thread_create(senddata_stack, sizeof(senddata_stack),
                            THREAD_PRIORITY_MAIN - 1, 0, send_data, NULL, "senddata");
            }
            else {
                /* value not valid */
                return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
            }

            if (pdu->payload_len <= 2) {
                return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
            }
            else {
                return gcoap_response(pdu, buf, len, COAP_CODE_BAD_REQUEST);
            }
        }
    }

    return -1;
}

static void _register(void)
{
    (void)send;
}

void spr_init(void)
{
    /* Initialize the adc on line 0 with 12 bit resolution. */
    init_adc(LINE, RES);

    /* Register CoAP resources */
    gcoap_register_listener(&_listener);

    /* Find RPI/Basisstation */
    //...

    /* Register Basisstation */
    (void)_register;
}
