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

#include "msg.h"
#include "net/ipv6/addr.h"
#include "net/gnrc.h"
#include "net/gnrc/netif.h"

#include "lcd1602a.h"

#define MAIN_QUEUE_SIZE (4)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

extern int lcd_write_cmd(int argc, char **argv);
extern int testcurrent_cmd(int argc, char **argv);
extern int testsend_cmd(int argc, char **argv);
extern int gcoap_cli_cmd(int argc, char **argv);
extern void spr_init(void);

lcd1602a_dev_t lcd;
lcd1602a_iface_t iface = MODE_4BIT;
lcd1602a_dotsize_t dotsize = DOTSIZE_5x8;

static const shell_command_t shell_commands[] = {
    { "coap", "CoAP example", gcoap_cli_cmd },
    { "testsend", "test send data", testsend_cmd },
    { "testcurrent", "Dump's the current and apparent-power", testcurrent_cmd },
    { "lcdwrite", "Writes something to the LCD!", lcd_write_cmd },
    { NULL, NULL, NULL }
};

static inline void _init_lcd(lcd1602a_dev_t * lcd)
{
    int PORT_A = 0;
    int PORT_B = 1;
    int PORT_C = 2;

    puts("Main: _init_lcd..\n");

    /* NOTE: Make sure the pins are working for your board! */
    lcd->register_select_pin = GPIO_PIN(PORT_A, 9);
    lcd->read_write_pin = GPIO_PIN(PORT_A, 8);
    lcd->enable_pin = GPIO_PIN(PORT_C, 7);
    lcd->data_pins[0] = 0; // Not used. We use a 4-Bit interface here.
    lcd->data_pins[1] = 0; // Not used.
    lcd->data_pins[2] = 0; // Not used.
    lcd->data_pins[3] = 0; // Not used.
    lcd->data_pins[4] = GPIO_PIN(PORT_B, 3);
    lcd->data_pins[5] = GPIO_PIN(PORT_B, 5);
    lcd->data_pins[6] = GPIO_PIN(PORT_B, 4);
    lcd->data_pins[7] = GPIO_PIN(PORT_B, 10);
    lcd->iface = iface;
    lcd->dotsize = dotsize;
    /* functions set in init */
    /* controls set in init */
    /* modes set in init */
    /* row_offset set in init */
    lcd->lines = 2;
    lcd->collumns = 16;

    lcd1602a_init(lcd);

    puts("Main: _init_lcd [ done ]\n");
}

static inline void _ip_to_lcd(void)
{
    puts("Main: _ip_to_lcd print IPv6..\n");

    /* get interfaces and print their addresses */
    gnrc_netif_t *netif = NULL;
    while ((netif = gnrc_netif_iter(netif))) {
        printf("netif while \n");
        ipv6_addr_t ipv6_addrs[GNRC_NETIF_IPV6_ADDRS_NUMOF];
        int res = gnrc_netapi_get(netif->pid, NETOPT_IPV6_ADDR, 0, ipv6_addrs,
                                  sizeof(ipv6_addrs));

        if (res < 0) {
            continue;
        }
        for (unsigned i = 0; i < (unsigned)(res / sizeof(ipv6_addr_t)); i++) {
            char ipv6_addr[IPV6_ADDR_MAX_STR_LEN];

            ipv6_addr_to_str(ipv6_addr, &ipv6_addrs[i], IPV6_ADDR_MAX_STR_LEN);
            printf("My address is %s\n", ipv6_addr);
            lcd1602a_write_buf(&lcd, ipv6_addr);
        }
    }
    puts("Main: _ip_to_lcd [ done ]\n");
}

int main(void)
{
    /* for the thread running the shell */
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);
    spr_init();
    puts("SmartPowerReader sensor node");
    _init_lcd(&lcd);
    _ip_to_lcd();

    /* start shell */
    puts("All up, running the shell now");
    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    /* should never be reached */
    return 0;
}
