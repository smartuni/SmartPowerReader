/*
 * Copyright (C) 2018 HAW Hamburg
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/*
 * @brief    Driver implementation for 1602A LCD's.
 *
 * @author   Rene Herthel <rene.herthel@haw-hamburg.de>
 */

#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "periph/gpio.h"
#include "timex.h"
#include "xtimer.h"
#include "fmt.h"
#include "lcd1602a.h"
#include "include/lcd1602a-internal.h"

#define ENABLE_DEBUG    (1)
#include "debug.h"

#define LOW             (0)
#define HIGH            (1)

/**
 * @brief    Creates a single enable-impulse, whenever HIGH impulses happen
 *
 * @param [in] dev    A pointer to the current lcd device
 */
static inline void _pulse_enable(lcd1602a_dev_t * dev)
{
    gpio_t enable = dev->enable_pin;

    /* A pulse enable sequence. */
    gpio_write(enable, LOW);
    xtimer_usleep(1);
    gpio_write(enable, HIGH);
    xtimer_usleep(1);
    gpio_write(enable, LOW);
    xtimer_usleep(100);
}

/**
 * @brief    Writes the given value to the lcd, by setting the corresponding
 *           interface data-bus-pins to high
 *
 * @param[in] dev      A pointer to the current lcd device
 * @param[in] value    The value to write via gpio onto the lcd
 */
static inline void _write(lcd1602a_dev_t * dev, uint8_t value)
{
    int start = 0;

    /* Make sure to use the upper 4 data pins. */
    if (!(dev->functions & LCD1602A_8BIT_MODE)) {
        start = 4;
    }

    /* Iterates over a 4-Bit or 8-Bit interface. */
    for (int i = start; i < MAX_DATA_PINS; i++) {
        gpio_write(dev->data_pins[i], (value >> (i - start)) & HIGH);
    }

    /* Tell the LCD to 'write down' the HIGH GPIO's. */
    _pulse_enable(dev);
}

/**
 * @brief   Prepares the LCD for sending some data to it
 *
 * @param[in] dev        A pointer to the current lcd device
 * @param[in] value      The value, which should be sent
 * @param[in] rs_mode    register select mode; LOW:commands; HIGH:Data
 */
static inline void _send(lcd1602a_dev_t * dev, uint8_t value, uint8_t rs_mode)
{
    /* rs_mode: LOW for commands; HIGH for text. */
    gpio_write(dev->register_select_pin, rs_mode);
    gpio_write(dev->read_write_pin, LOW);

    /* A 4-Bit interface needs to write a 8-Bit value a second time but shifted. */
    if (dev->functions & LCD1602A_8BIT_MODE) {
        _write(dev, value);
    } else {
        _write(dev, value >> 4);
        _write(dev, value);
    }
}

/**
 * @brief Uses _send to write a command to the lcd device
 *
 * @paran[in] dev    A pointer to the current lcd device
 * @param[in] cmd    The command to send
 */
static inline void _command(lcd1602a_dev_t * dev, uint8_t cmd)
{
    /* LOW means to send a command (NOT text) to the LCD. */
    _send(dev, cmd, LOW);
}

void lcd1602a_init(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Init -> Start\n");

    /* Initialize some values by default with zero. */
    dev->functions = 0x00;
    dev->controls = 0x00;
    dev->modes = 0x00;
    dev->row_offset[0] = 0x00;
    dev->row_offset[1] = 0x00;
    dev->row_offset[2] = 0x00;
    dev->row_offset[3] = 0x00;

    /* First make some default initializations. */
    if (!(dev->iface & LCD1602A_8BIT_MODE)) {
        dev->functions = LCD1602A_4BIT_MODE | LCD1602A_1LINE | LCD1602A_5x8DOTS;
        DEBUG("LCD1602A: Init -> Functions: Use 4-Bit Interface, 1-Line, 5x8Dots\n");
    } else {
        dev->functions = LCD1602A_8BIT_MODE | LCD1602A_1LINE | LCD1602A_5x8DOTS;
        DEBUG("LCD1602A: Init -> Functions: Use 8-Bit Interface, 1-Line, 5x8Dots\n");
    }

    /* Assign functionality bit, when LCD should use 2 lines. */
    if (dev->lines > 1) {
        dev->functions |= LCD1602A_2LINE;
        DEBUG("LCD1602A: Init -> Functions: Use 2 Lines instead\n");
    }

    /* Needed for positioning the cursor. */
    dev->row_offset[0] = 0x00;
    dev->row_offset[1] = 0x40;
    dev->row_offset[2] = 0x00 + dev->collumns;
    dev->row_offset[3] = 0x40 + dev->collumns;

    /* If a 1 line display can have 10 pixel high font. */
    if ((dev->dotsize != LCD1602A_5x8DOTS) && (dev->lines == 1)) {
        dev->functions |= LCD1602A_5x10DOTS;
        DEBUG("LCD1602A: Init -> Functions: Use 5x10Dots instead\n");
    }

    /* Initialize all used pins as output. */
    gpio_init(dev->register_select_pin, GPIO_OUT);
    DEBUG("LCD1602A: Init -> GPIO_INIT Register-Select-Pin as GPIO_OUT\n");
    gpio_init(dev->read_write_pin, GPIO_OUT);
    DEBUG("LCD1602A: Init -> GPIO_INIT Read-Write-Pin as GPIO_OUT\n");
    gpio_init(dev->enable_pin, GPIO_OUT);
    DEBUG("LCD1602A: Init -> GPIO_INIT Enable-Pin as GPIO_OUT\n");

    /* Initialize the data pins; Make sure to use the correct range. */
    int start = 0;

    /* Use D4 - D7 for 4 Bit interface. */
    if (!(dev->functions & LCD1602A_8BIT_MODE)) {
        start = 4;
    }

    for (int i = start; i < MAX_DATA_PINS; i++) {
        gpio_init(dev->data_pins[i], GPIO_OUT);
        DEBUG("LCD1602A: Init -> GPIO_INIT D%i-Pin as GPIO_OUT\n", i);
    }

    /* Wait at least 40 ms to let the power rise above 2.7V */
    xtimer_usleep(50LU * US_PER_MS);

    gpio_write(dev->register_select_pin, LOW);
    DEBUG("LCD1602A: Init -> GPIO_WRITE Register-Select-Pin: LOW\n");
    gpio_write(dev->enable_pin, LOW);
    DEBUG("LCD1602A: Init -> GPIO_WRITE Enable-Pin: LOW\n");
    gpio_write(dev->read_write_pin, LOW);
    DEBUG("LCD1602A: Init -> GPIO_WRITE Read-Write-Pin: LOW\n");

    if (!(dev->functions & LCD1602A_8BIT_MODE)) {
        _write(dev, 0x03);
        xtimer_usleep(4500);
        _write(dev, 0x03);
        xtimer_usleep(4500);
        _write(dev, 0x03);
        xtimer_usleep(150);
        _write(dev, 0x02);
        DEBUG("LCD1602A: Init -> 4-Bit mode\n");
    } else {
        _command(dev, LCD1602A_FUNCTION_SET | dev->functions);
        xtimer_usleep(4500);
        _command(dev, LCD1602A_FUNCTION_SET | dev->functions);
        xtimer_usleep(150);
        _command(dev, LCD1602A_FUNCTION_SET | dev->functions);
        DEBUG("LCD1602A: Init -> 8-Bit mode\n");
    }

    /* Set No. of lines, dot size, etc. */
    _command(dev, LCD1602A_FUNCTION_SET | dev->functions);

    /* Turn the dsiplay on with no cursor or blinking by default. */
    dev->controls = LCD1602A_DISPLAY_ON | LCD1602A_CURSOR_OFF | LCD1602A_BLINK_OFF;
    lcd1602a_display_on(dev);

    /* Clear the entire display. */
    lcd1602a_display_clear(dev);

    /* Default text direction. */
    dev->modes = LCD1602A_ENTRY_LEFT | LCD1602A_ENTRY_SHIFT_DEC;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);

    DEBUG("LCD1602A: Init -> Completed\n");
}

void lcd1602a_write_buf(lcd1602a_dev_t * dev, char * buf)
{
    int len = (int)strlen(buf);
    DEBUG("LCD1602A: Write_buf -> Length: %d\n", len);

    /* Use write method for every character in the buffer. */
    for (int i = 0; i < len; i++) {
         lcd1602a_write(dev, buf[i]);
    }
}

void lcd1602a_write(lcd1602a_dev_t * dev, uint8_t value)
{
    DEBUG("LCD1602A: Write -> '%c'\n", (char)value);
    _send(dev, value, HIGH);
}

void lcd1602a_display_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Display -> Enable\n");
    dev->controls |= LCD1602A_DISPLAY_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_display_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Display -> Disable\n");
    dev->controls &= ~LCD1602A_DISPLAY_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_display_clear(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Display -> Clear\n");
    _command(dev, LCD1602A_CLEAR_DISPLAY);
    /* It needs about two seconds to settle. */
    xtimer_usleep(2000);
}

void lcd1602a_cursor_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Cursor -> Enable\n");
    dev->controls |= LCD1602A_CURSOR_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_cursor_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Cursor -> Disable\n");
    dev->controls &= ~LCD1602A_CURSOR_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_cursor_reset(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Cursor -> Reset\n");
    _command(dev, LCD1602A_RETURN_HOME);
    xtimer_usleep(2000);
}

void lcd1602a_cursor_set(lcd1602a_dev_t * dev, uint8_t col, uint8_t row)
{
    DEBUG("LCD1602A: Cursor -> Set col/row %i/%i\n", col, row);
    row = (row >= 1) ? 1 : 0; // Lazy check if between 0 and 1.
    _command(dev, LCD1602A_SET_DDRAM_ADDRESS | (col + dev->row_offset[row]));
}

void lcd1602a_blink_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Blink -> Enable\n");
    dev->controls |= LCD1602A_BLINK_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_blink_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Blink -> Disable\n");
    dev->controls &= ~LCD1602A_BLINK_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_scroll_left(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Scroll -> Left\n");
    _command(dev, LCD1602A_CURSOR_OR_DISPLAY_SHIFT | LCD1602A_DISPLAY_MOVE | LCD1602A_MOVE_LEFT);
}

void lcd1602a_scroll_right(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Scroll -> Right\n");
    _command(dev, LCD1602A_CURSOR_OR_DISPLAY_SHIFT | LCD1602A_DISPLAY_MOVE | LCD1602A_MOVE_RIGHT);
}

void lcd1602a_left_to_right(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Text -> LeftToRight\n");
    dev->modes |= LCD1602A_ENTRY_LEFT;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}

void lcd1602a_right_to_left(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Text -> RightToLeft\n");
    dev->modes &= ~LCD1602A_ENTRY_LEFT;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}

void lcd1602a_autoscroll_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Autoscroll -> Enable\n");
    dev->modes |= LCD1602A_ENTRY_SHIFT_INC;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}

void lcd1602a_autoscroll_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD1602A: Autoscroll -> Disable\n");
    dev->modes &= ~LCD1602A_ENTRY_SHIFT_INC;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}
