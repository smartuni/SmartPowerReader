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

#define LED_NUM         (0)

static void _resp_handler(unsigned req_state, coap_pkt_t* pdu,
                          sock_udp_ep_t *remote);
static ssize_t _interval_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);
static ssize_t _value_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx);

static uint32_t interval = SPR_INTERVAL;
static uint8_t config_status = 0;

static kernel_pid_t blink_pid;
static char blink_stack[THREAD_STACKSIZE_DEFAULT + THREAD_EXTRA_STACKSIZE_PRINTF];
static msg_t blink_queue[BLINK_QUEUE_SIZE];

/* CoAP resources */
static coap_resource_t _resources[] = {
    { "/interval", COAP_GET | COAP_PUT, _interval_handler, NULL },
    { "/start", COAP_GET, _start_handler, NULL },
    { "/config", COAP_GET | COAP_PUT, _config_handler, NULL },
};

static gcoap_listener_t _listener = {
    &_resources[0],
    sizeof(_resources) / sizeof(_resources[0]),
    NULL
};

/*
 * Response callback.
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

static size_t _send(uint8_t *buf, size_t len, char *addr_str, char *port_str)
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

    return NULL;
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

static ssize_t _value_handler(coap_pkt_t* pdu, uint8_t *buf, size_t len, void *ctx)
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
    (void)pdu;
    (void)buf;
    (void)len;
    (void)ctx;

    /* start thread to send values to RPI */

    /* send ACK response */

    return -1;
}

static void _register(void)
{
    (void)_send;
}

/*
 * This is only used for debugging through the shell.
 * It has nothing to do with the functionality of
 * SPR */
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
        if (!_send(&buf[0], len, argv[apos], argv[apos+1])) {
            puts("gcoap_cli: msg send failed");
        }
        else {
            /* send Observe notification for /cli/stats */
            switch (gcoap_obs_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE,
                    &_resources[0])) {
            case GCOAP_OBS_INIT_OK:
                DEBUG("gcoap_cli: creating /cli/stats notification\n");
                size_t payload_len = fmt_u16_dec((char *)pdu.payload, config_status);
                len = gcoap_finish(&pdu, payload_len, COAP_FORMAT_TEXT);
                gcoap_obs_send(&buf[0], len, &_resources[0]);
                break;
            case GCOAP_OBS_INIT_UNUSED:
                DEBUG("gcoap_cli: no observer for /cli/stats\n");
                break;
            case GCOAP_OBS_INIT_ERR:
                DEBUG("gcoap_cli: error initializing /cli/stats notification\n");
                break;
            }
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

void spr_init(void)
{
    /* Register CoAP resources */
    gcoap_register_listener(&_listener);

    /* Find RPI/Basisstation */
    //...

    /* Register Basisstation */
    (void)_register;
}
