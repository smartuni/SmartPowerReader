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

#define SHOW_IP_ON_STARTUP (0)
#if SHOW_IP_ON_STARTUP
#include "lcd1602a.h"
#include "msg.h"
#include "net/ipv6/addr.h"
#include "net/gnrc.h"
#include "net/gnrc/netif.h"
#endif

#define MAIN_QUEUE_SIZE (4)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

extern int lcd_write_cmd(int argc, char **argv);
extern int testcurrent_cmd(int argc, char **argv);
extern int testsend_cmd(int argc, char **argv);
extern int gcoap_cli_cmd(int argc, char **argv);
extern void spr_init(void);

static const shell_command_t shell_commands[] = {
    { "coap", "CoAP example", gcoap_cli_cmd },
    { "testsend", "test send data", testsend_cmd },
    { "testcurrent", "Dump's the current and apparent-power", testcurrent_cmd },
    { "lcdwrite", "Writes something to the LCD!", lcd_write_cmd },
    { NULL, NULL, NULL }
};

int main(void)
{
    /* for the thread running the shell */
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);
    spr_init();

    puts("SmartPowerReader sensor node");

#if SHOW_IP_ON_STARTUP

    int PORT_A = 0;
    int PORT_C = 2;
    int PORT_E = 4;

    lcd1602a_dev_t main_lcd;

    main_lcd.register_select_pin = GPIO_PIN(PORT_E, 4);
    main_lcd.read_write_pin = GPIO_PIN(PORT_A, 19);
    main_lcd.enable_pin = GPIO_PIN(PORT_A, 2);
    main_lcd.data_pins[0] = 0; // Not used. We use a 4-Bit interface here.
    main_lcd.data_pins[1] = 0; // Not used.
    main_lcd.data_pins[2] = 0; // Not used.
    main_lcd.data_pins[3] = 0; // Not used.
    main_lcd.data_pins[4] = GPIO_PIN(PORT_A, 1);
    main_lcd.data_pins[5] = GPIO_PIN(PORT_C, 4);
    main_lcd.data_pins[6] = GPIO_PIN(PORT_C, 7);
    main_lcd.data_pins[7] = GPIO_PIN(PORT_C, 5);
    main_lcd.iface = MODE_4BIT;
    main_lcd.dotsize = DOTSIZE_5x8;
    main_lcd.lines = 2;
    main_lcd.collumns = 16;

    lcd1602a_init(&main_lcd);

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
              lcd1602a_write(&main_lcd, ipv6_addr[k]);
            }

            lcd1602a_cursor_set(&main_lcd, 0, 1);

            for (int k = 16; k < len && k < 32; k++) {
              lcd1602a_write(&main_lcd, ipv6_addr[k]);
            }
        }
    }
#endif /* SHOW_IP_ON_STARTUP */

    /* start shell */
    puts("All up, running the shell now");
    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    /* should never be reached */
    return 0;
}
