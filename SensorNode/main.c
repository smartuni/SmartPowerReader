/*
 * Copyright (c) 2015-2016 Ken Bannister. All rights reserved.
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @author      Ken Bannister <kb2ma@runbox.com>
 *              M Aiman Ismail<m.aimanismail@gmail.com>
 */

#include <stdio.h>

#include "msg.h"
#include "net/gcoap.h"
#include "kernel_types.h"
#include "shell.h"
#include "xtimer.h"

#include "features.h"

#include "lcd1602a.h"

#if FEATURE_USE_DISPLAY
    #if FEATURE_SHOW_IP_ON_START
    #include "net/ipv6/addr.h"
    #include "net/gnrc.h"
    #include "net/gnrc/netif.h"
    #endif
#endif

#define MAIN_QUEUE_SIZE (4)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

extern int lcd_write_cmd(int argc, char **argv);
extern int testcurrent_cmd(int argc, char **argv);
extern int testsend_cmd(int argc, char **argv);
extern int gcoap_cli_cmd(int argc, char **argv);
extern void spr_init(lcd1602a_dev_t * lcd);
extern int estop_cmd(int argc, char **argv);
extern int manual_cmd(int argc, char **argv);

static const shell_command_t shell_commands[] = {
    { "coap", "CoAP example", gcoap_cli_cmd },
    { "testsend", "test send data", testsend_cmd },
    { "testcurrent", "Dump's the current and apparent-power", testcurrent_cmd },
    { "lcdwrite", "Writes something to the LCD!", lcd_write_cmd },
    { "estop", "Turn the estop ON or OFF", estop_cmd },
    { "manual", "Turn the manual ON or OFF", manual_cmd },
    { NULL, NULL, NULL }
};

int main(void)
{
    lcd1602a_dev_t lcd;

#if FEATURE_USE_DISPLAY
    int PORT_A = 0;
    int PORT_C = 2;
    int PORT_E = 4;

    lcd.register_select_pin = GPIO_PIN(PORT_E, 4);
    lcd.read_write_pin = GPIO_PIN(PORT_A, 19);
    lcd.enable_pin = GPIO_PIN(PORT_A, 2);
    lcd.data_pins[0] = 0; // Not used. We use a 4-Bit interface here.
    lcd.data_pins[1] = 0; // Not used.
    lcd.data_pins[2] = 0; // Not used.
    lcd.data_pins[3] = 0; // Not used.
    lcd.data_pins[4] = GPIO_PIN(PORT_A, 1);
    lcd.data_pins[5] = GPIO_PIN(PORT_C, 4);
    lcd.data_pins[6] = GPIO_PIN(PORT_C, 7);
    lcd.data_pins[7] = GPIO_PIN(PORT_C, 5);
    lcd.iface = MODE_4BIT;
    lcd.dotsize = DOTSIZE_5x8;
    lcd.lines = 2;
    lcd.collumns = 16;

    lcd1602a_init(&lcd);

    lcd1602a_write_buf(&lcd, "SmartPowerReader");
    lcd1602a_cursor_set(&lcd, 0, 1);
    lcd1602a_write_buf(&lcd, "Initializing ...");

    xtimer_sleep(3);

    lcd1602a_display_clear(&lcd);

    #if FEATURE_SHOW_IP_ON_START

        // get interfaces and print their addresses
        gnrc_netif_t *netif = NULL;
        while ((netif = gnrc_netif_iter(netif))) {

            ipv6_addr_t ipv6_addrs[GNRC_NETIF_IPV6_ADDRS_NUMOF];
            int res = gnrc_netapi_get(netif->pid, NETOPT_IPV6_ADDR, 0, ipv6_addrs,
                                      sizeof(ipv6_addrs));

            if (res < 0) {
                continue;
            }

            for (unsigned i = 0; i < (unsigned)(res / sizeof(ipv6_addr_t)); i++) {
                char ipv6_addr[IPV6_ADDR_MAX_STR_LEN];

                ipv6_addr_to_str(ipv6_addr, &ipv6_addrs[i], IPV6_ADDR_MAX_STR_LEN);
                int len = (int)strlen(ipv6_addr);

                printf("My IPv6 address %s\n", ipv6_addr);
                for (int k = 0; k < 16; k++) {
                  lcd1602a_write(&lcd, ipv6_addr[k]);
                }

                lcd1602a_cursor_set(&lcd, 0, 1);

                for (int k = 16; k < len && k < 32; k++) {
                  lcd1602a_write(&lcd, ipv6_addr[k]);
                }
            }
        }
    #endif /* FEATURE_SHOW_IP_ON_START */
#endif /* FEATURE_USE_DISPLAY */

    /* for the thread running the shell */
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);
    spr_init(&lcd);

    puts("SmartPowerReader sensor node");

    /* start shell */
    puts("All up, running the shell now");
    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    /* should never be reached */
    return 0;
}
