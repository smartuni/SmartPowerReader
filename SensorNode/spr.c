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

#define ENABLE_DEBUG (0)
#include "debug.h"

#define SENDDATA_QUEUE_SIZE     (8)

#define CON_THRESH      (300)

#define BACKEND_REG     "/new-device"           /**< Backend resource to register new devices */
#define BACKEND_SEND    "/measure"              /**< Backend resource to accept measurements */
#define BACKEND_PORT    "9900"                  /**< Port the backend listens to */
#define SPR_INTERVAL (15)                       /* Default 15 seconds*/

/* ADC pin parameters. */
#define LINE (0)
#define RES ADC_RES_12BIT /*< Use 'ADC_RES_10BIT' for arduino's. */

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
static msg_t senddata_queue[SENDDATA_QUEUE_SIZE];

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
    uint32_t interval;  /* Interval for measuring */
};

static struct spr_config cfg = { 0 };

static void *send_data(void *arg)
{
    (void)arg;

    msg_t msg;
    msg.content.value = 0;

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

    /* stop send if interval 0 */
    while (cfg.interval) {
        gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, COAP_METHOD_PUT, BACKEND_SEND);       // change server resource '/value' here

        /* measure current */
        ct_measure_current(&ct_param, &ct_i_data);
        ct_dump_current(&ct_i_data);
        apparent = ct_i_data.apparent;

        /* copy read value to packet payload */
        memcpy(pdu.payload, &apparent, sizeof (apparent));

        /* set packet CONFIRMABLE if interval >= 15 minutes */
        if (cfg.interval >= CON_THRESH) {
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

        msg_try_receive(&msg);
        cfg.interval = msg.content.value;
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
            gcoap_resp_init(pdu, buf, len, COAP_CODE_CONTENT);

            // TODO: change to cbor
            size_t payload_len = fmt_u16_dec((char *)pdu->payload, cfg.interval);

            return gcoap_finish(pdu, payload_len, COAP_FORMAT_TEXT);

        case COAP_PUT: {
            /* setup buffer to receive payload */
            uint8_t received[CONFIG_PAYLOAD_LEN];
            memset(received, 0, CONFIG_PAYLOAD_LEN);

            if (pdu->payload_len > CONFIG_PAYLOAD_LEN) {
                puts("error: payload overflow");
                return -1;
            }

            /* get payload from pdu */
            memcpy(received, (const void *)pdu->payload, pdu->payload_len);

            /* parse payload to CborValue it*/
            CborParser parser;
            CborValue it;
            CborError err = cbor_parser_init(received, CONFIG_PAYLOAD_LEN, 0, &parser, &it);
            if (!err)
                err = dumprecursive(&it, 0);

            if (err) {
                fprintf(stderr, "CBOR parsing failure at offset %d: %s\n",
                        it.ptr - received, cbor_error_string(err));
                return 1;
            }

            // TODO: check if cbor (map) valid
            uint64_t tmp;
            CborValue interval_cbor;
            /* find interval pair in map */
            cbor_value_map_find_value(&it, "interval", &interval_cbor);
            /* get value of interval */
            cbor_value_get_uint64(&interval_cbor, &tmp);
            /* downcast to uint32_t */
            cfg.interval = (uint32_t) tmp;

            if (cfg.interval != 0) {
                /* thread not started yet */
                if (senddata_pid == 0) {
                    /* start thread send_data */
                    puts("starting senddata thread");
                    senddata_pid = thread_create(senddata_stack, sizeof(senddata_stack),
                            THREAD_PRIORITY_MAIN - 1, 0, send_data, NULL, "senddata");
                    /* send interval */
                    msg_t msg;
                    msg.content.value = cfg.interval;
                    int ret = msg_try_send(&msg, senddata_pid);
                    if (ret == 0) {
                        puts("Receiver queue full");
                    }
                    else if (ret < 0) {
                        puts("ERROR: invalid PID; sendata thread not started");
                    }
                }
                else {
                    /* update interval */
                    msg_t msg;
                    msg.content.value = cfg.interval;
                    int ret = msg_try_send(&msg, senddata_pid);
                    if (ret == 0) {
                        puts("Receiver queue full");
                    }
                    else if (ret < 0) {
                        puts("ERROR: invalid PID; sendata thread not started");
                    }
                }
            }
            return gcoap_response(pdu, buf, len, COAP_CODE_CHANGED);
        }
    }

    return -1;
}

void _register(char *base_addr)
{
    /* prepare packet to send */
    uint8_t buf[GCOAP_PDU_BUF_SIZE];
    coap_pkt_t pdu;
    size_t len;

    /* send POST to /new-device */
    gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, COAP_METHOD_POST, BACKEND_REG);
    /* set confirmable */
    coap_hdr_set_type(pdu.hdr, COAP_TYPE_CON);
    /* we have no payload */
    len = gcoap_finish(&pdu, 0, COAP_FORMAT_NONE);
    if (!send(&buf[0], len, base_addr, BACKEND_PORT)) {
        puts("gcoap_cli: msg send failed");
    }
}

void spr_init(void)
{
    /* Initialize the adc on line 0 with 12 bit resolution. */
    init_adc(LINE, RES);

    /* Register CoAP resources */
    gcoap_register_listener(&_listener);

    /* Find RPI/Basisstation */
    strncpy(base_addr, "fd00:1:2:3:a02d:51f7:cdf4:a686", NANOCOAP_URI_MAX);

    /* Register Basisstation */
    _register(base_addr);
}
