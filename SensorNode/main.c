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

#include "periph/adc.h"
#include "measuring/ct_sensor.h"

#include "msg.h"
#include "net/gcoap.h"
#include "kernel_types.h"
#include "shell.h"

#define MAIN_QUEUE_SIZE (4)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

extern int testsend_cmd(int argc, char **argv);
extern int gcoap_cli_cmd(int argc, char **argv);
extern void spr_init(void);

static const shell_command_t shell_commands[] = {
    { "coap", "CoAP example", gcoap_cli_cmd },
    { "testsend", "test send data", testsend_cmd },
    { NULL, NULL, NULL }
};

int main(void)
{
    /* Initialize the adc on line 0 with 12 bit resolution. */
    init_adc(0, ADC_RES_12BIT);

    /* for the thread running the shell */
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);
    spr_init();
    puts("SmartPowerReader sensor node");

    /* start shell */
    puts("All up, running the shell now");
    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    /* should never be reached */
    return 0;
}
