/**
 * Holds all functions copied from gcoap_cli.c in examples/gcoap
 */

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "net/gcoap.h"
#include "od.h"
#include "fmt.h"

#include "measuring/ct_sensor.h"

ct_parameter_t ct_param;
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
