/*
 * @file     lcd_1602a.c
 * @author   Rene Herthel <rene.herthel@haw-hamburg.de>
 * @brief    Driver implementation for 1602A LCD's.
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

#define ENABLE_DEBUG    (0)
#include "debug.h"

#define LOW             (0)
#define HIGH            (1)

/**
 * @brief    Creates a single enable-impulse, whenever HIGH impulses happen.
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
 *           interface data-bus-pins to high.
 *
 * @param[in] value    The value to write via gpio onto the lcd.
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

    /* Tell the LCD to write down the HIGH GPIO's. */
    _pulse_enable(dev);
}

/**
 * @brief   Prepares the LCD for sending some data to it.
 *
 * @param[value] The value, which should be sent.
 * @param[rs_mode] register select mode; LOW:commands; HIGH:Data
 */
static inline void _send(lcd1602a_dev_t * dev, uint8_t value, uint8_t rs_mode)
{
    /* rs_mode: LOW for commands; HIGH for text. */
    gpio_write(dev->register_select_pin, rs_mode);
    gpio_write(dev->read_write_pin, LOW);

    /* A 4-Bit interface needs to write its 8-Bit value two times. */
    if (dev->functions & LCD1602A_8BIT_MODE) {
        _write(dev, value);
    } else {
        _write(dev, value >> 4);
        _write(dev, value);
    }
}

/**
 * @brief Invokes _send with a logical-low-level for commands.
 *
 * @param[cmd] The command to send.
 */
static inline void _command(lcd1602a_dev_t * dev, uint8_t cmd)
{
    /* LOW means to send a command (NOT text) to the LCD. */
    _send(dev, cmd, LOW);
}

int lcd1602a_init(lcd1602a_dev_t * dev)
{
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
        DEBUG("lcd: _init: 4-Bit interface, 1-Line, 5x8Dots (per default)\n");
    } else {
        dev->functions = LCD1602A_8BIT_MODE | LCD1602A_1LINE | LCD1602A_5x8DOTS;
        DEBUG("lcd: _init: 8-Bit interface, 1-Line, 5x8Dots (per default)\n");
    }

    /* Assign functionality bit, when LCD should use 2 lines. */
    if (dev->lines > 1) {
        dev->functions |= LCD1602A_2LINE;
        DEBUG("LCD: _power_up: Use 2 Lines\n");
    }

    /* Needed for positioning the cursor. */
    dev->row_offset[0] = 0x00;
    dev->row_offset[1] = 0x40;
    dev->row_offset[2] = 0x00 + dev->collumns;
    dev->row_offset[3] = 0x40 + dev->collumns;

    /* If a 1 line display can have 10 pixel high font. */
    if ((dev->dotsize != LCD1602A_5x8DOTS) && (dev->lines == 1)) {
        dev->functions |= LCD1602A_5x10DOTS;
        DEBUG("LCD: _power_up: Use 5 x 10 Dots\n");
    }

    gpio_init(dev->register_select_pin, GPIO_OUT);
    gpio_init(dev->read_write_pin, GPIO_OUT);
    gpio_init(dev->enable_pin, GPIO_OUT);
    DEBUG("LCD: _power_up: rs-, rw-, e-Pin set as GPIO_OUT\n");

    /* Initialize the data pins; Make sure to use the right range. */
    for (int i = (!(dev->functions & LCD1602A_8BIT_MODE) ? 4 : 0); i < MAX_DATA_PINS; i++) {
        DEBUG("LCD: _power_up: D%i-Pin set as GPIO_OUT \n", i);
        gpio_init(dev->data_pins[i], GPIO_OUT);
    }

    /* Wait at least 40 ms to let the power rise above 2.7V */
    xtimer_usleep(50LU * US_PER_MS);

    gpio_write(dev->register_select_pin, LOW);
    gpio_write(dev->enable_pin, LOW);
    gpio_write(dev->read_write_pin, LOW);
    DEBUG("LCD: _power_up: rs-, rw-, e-Pin are LOW now\n");

    if (!(dev->functions & LCD1602A_8BIT_MODE)) {
        _write(dev, 0x03);
        xtimer_usleep(4500);
        _write(dev, 0x03);
        xtimer_usleep(4500);
        _write(dev, 0x03);
        xtimer_usleep(150);
        _write(dev, 0x02);
        DEBUG("LCD: _power_up: 4-Bit mode\n");
    } else {
        _command(dev, LCD1602A_FUNCTION_SET | dev->functions);
        xtimer_usleep(4500);
        _command(dev, LCD1602A_FUNCTION_SET | dev->functions);
        xtimer_usleep(150);
        _command(dev, LCD1602A_FUNCTION_SET | dev->functions);
        DEBUG("LCD: _power_up: 8-Bit mode\n");
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

    DEBUG("LCD: _init: init done\n");
    return 0;
}

void lcd1602a_write_buf(lcd1602a_dev_t * dev, char * buf)
{
    int len = (int)strlen(buf);

    for (int i = 0; i < len; i++) {
         lcd1602a_write(dev, buf[i]);
    }
}

void lcd1602a_write(lcd1602a_dev_t * dev, uint8_t value)
{
    DEBUG("LCD: write -> '%c'\n", (char)value);
    _send(dev, value, HIGH);
}

void lcd1602a_display_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Display -> Enable\n");
    dev->controls |= LCD1602A_DISPLAY_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_display_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Display -> Disable\n");
    dev->controls &= ~LCD1602A_DISPLAY_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_display_clear(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Display -> Clear\n");
    _command(dev, LCD1602A_CLEAR_DISPLAY);
    xtimer_usleep(2000);
}

void lcd1602a_cursor_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Cursor -> Enable\n");
    dev->controls |= LCD1602A_CURSOR_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_cursor_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Cursor -> Disable\n");
    dev->controls &= ~LCD1602A_CURSOR_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_cursor_reset(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Cursor -> Reset\n");
    _command(dev, LCD1602A_RETURN_HOME);
    xtimer_usleep(2000);
}

void lcd1602a_cursor_set(lcd1602a_dev_t * dev, uint8_t col, uint8_t row)
{
    DEBUG("LCD: Cursor -> Set col/row %i/%i\n", col, row);
    row = (row > 0) ? 1 : 0; // Lazy check if between 0 and 1.
    _command(dev, LCD1602A_SET_DDRAM_ADDRESS | (col + dev->row_offset[row]));
}

void lcd1602a_blink_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Blink -> Enable\n");
    dev->controls |= LCD1602A_BLINK_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_blink_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Blink -> Disable\n");
    dev->controls &= ~LCD1602A_BLINK_ON;
    _command(dev, LCD1602A_DISPLAY_ON_OFF | dev->controls);
}

void lcd1602a_scroll_left(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Scroll -> Left\n");
    _command(dev, LCD1602A_CURSOR_OR_DISPLAY_SHIFT | LCD1602A_DISPLAY_MOVE | LCD1602A_MOVE_LEFT);
}

void lcd1602a_scroll_right(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Scroll -> Right\n");
    _command(dev, LCD1602A_CURSOR_OR_DISPLAY_SHIFT | LCD1602A_DISPLAY_MOVE | LCD1602A_MOVE_RIGHT);
}

void lcd1602a_left_to_right(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Text -> LeftToRight\n");
    dev->modes |= LCD1602A_ENTRY_LEFT;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}

void lcd1602a_right_to_left(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Text -> RightToLeft\n");
    dev->modes &= ~LCD1602A_ENTRY_LEFT;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}

void lcd1602a_autoscroll_on(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Autoscroll -> Enable\n");
    dev->modes |= LCD1602A_ENTRY_SHIFT_INC;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}

void lcd1602a_autoscroll_off(lcd1602a_dev_t * dev)
{
    DEBUG("LCD: Autoscroll -> Disable\n");
    dev->modes &= ~LCD1602A_ENTRY_SHIFT_INC;
    _command(dev, LCD1602A_ENTRY_MODE_SET | dev->modes);
}
