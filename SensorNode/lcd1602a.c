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

#define LOW             (0)          /*< Logical low-level */
#define HIGH            (1)          /*< Logical high-level */
#define PINS_SIZE       (8)          /*< Maximum available data pins. */

static uint8_t _functionality;       /*< Holds general functionality */
static uint8_t _display_control;     /*< Holds data to manipulate cursor etc */
static uint8_t _display_mode;        /*< How the data should be displayed */
static lcd1602a_iface_t _iface;           /*< To remember if 4-, or 8-bit is used */
static gpio_t _data_pins[PINS_SIZE]; /*< Array, which holds all data pins */
static gpio_t _rs;                   /*< Register-Select-Pin */
static gpio_t _rw;                   /*< Read-Write-Pin */
static gpio_t _e;                    /*< Enable-Pin */
static uint8_t _lines;               /*< Number of lines, the display has */
static uint8_t _row_offset[4];       /*< For cursor positions */

/**
 * @brief    Creates a single enable-impulse, whenever HIGH impulses happen.
 */
static inline void _pulse_enable(void)
{
    gpio_write(_e, LOW);
    xtimer_usleep(1);
    gpio_write(_e, HIGH);
    xtimer_usleep(1);
    gpio_write(_e, LOW);
    xtimer_usleep(100);
}

/**
 * @brief    Writes the given value to the lcd, by setting the corresponding
 *           interface data-bus-pins to high.
 *
 * @param[in] value    The value to write via gpio onto the lcd.
 */
static inline void _write(uint8_t value)
{
    int start = (_functionality & LCD1602A_8BIT_MODE) ? 0 : 4;

    for (int i = start; i < PINS_SIZE; i++) {
        gpio_write(_data_pins[i], (value >> (i - start)) & HIGH);
    }

    _pulse_enable();
}

/**
 * @brief   Prepares the LCD for sending some data to it.
 *
 * @param[value] The value, which should be sent.
 * @param[rs_mode] register select mode; LOW:commands; HIGH:Data
 */
static inline void _send(uint8_t value, uint8_t rs_mode)
{
    gpio_write(_rs, rs_mode);
    gpio_write(_rw, LOW);

    if (_functionality & LCD1602A_8BIT_MODE) {
        _write(value);
    } else {
        _write(value >> 4);
        _write(value);
    }
}

/**
 * @brief Invokes _send with a logical-low-level for commands.
 *
 * @param[cmd] The command to send.
 */
static inline void _command(uint8_t cmd)
{
    _send(cmd, LOW);
}

/**
 * @brief Power ups the lcd. Look at the datasheets for informations about the delays.
 */
static inline void _power_up(uint8_t collumns, uint8_t lines, uint8_t dot_size)
{
    _lines = lines;

    if (_lines > 1) {
        _functionality |= LCD1602A_2LINE;
        DEBUG("LCD: _power_up: Use 2 Lines\n");
    }

    /* Needed later for positioning the cursor. */
    _row_offset[0] = 0x00;
    _row_offset[1] = 0x40;
    _row_offset[2] = 0x00 + collumns;
    _row_offset[3] = 0x40 + collumns;

    /* If a 1 line display can have 10 pixel high font. */
    if ((dot_size != LCD1602A_5x8DOTS) && (_lines == 1)) {
        _functionality |= LCD1602A_5x10DOTS;
        DEBUG("LCD: _power_up: Use 5 x 10 Dots\n");
    }

    gpio_init(_rs, GPIO_OUT);
    gpio_init(_rw, GPIO_OUT);
    gpio_init(_e, GPIO_OUT);
    DEBUG("LCD: _power_up: rs-, rw-, e-Pin set as GPIO_OUT\n");

    for (int i = (!(_functionality & LCD1602A_8BIT_MODE) ? 4 : 0); i < PINS_SIZE; i++) {
        DEBUG("LCD: _power_up: D%i-Pin set as GPIO_OUT \n", i);
        gpio_init(_data_pins[i], GPIO_OUT);
    }

    /* Wait at least 40 ms to let the power rise above 2.7V */
    xtimer_usleep(50LU * US_PER_MS);

    gpio_write(_rs, LOW);
    gpio_write(_e, LOW);
    gpio_write(_rw, LOW);
    DEBUG("LCD: _power_up: rs-, rw-, e-Pin are LOW now\n");

    if (!(_functionality & LCD1602A_8BIT_MODE)) {
        _write(0x03);
        xtimer_usleep(4500);
        _write(0x03);
        xtimer_usleep(4500);
        _write(0x03);
        xtimer_usleep(150);
        _write(0x02);
        DEBUG("LCD: _power_up: 4-Bit mode\n");
    } else {
        _command(LCD1602A_FUNCTION_SET | _functionality);
        xtimer_usleep(4500);
        _command(LCD1602A_FUNCTION_SET | _functionality);
        xtimer_usleep(150);
        _command(LCD1602A_FUNCTION_SET | _functionality);
        DEBUG("LCD: _power_up: 8-Bit mode\n");
    }

    /* Set No. of lines, dot size, etc. */
    _command(LCD1602A_FUNCTION_SET | _functionality);

    /* Turn the dsiplay on with no cursor or blinking by default. */
    _display_control = LCD1602A_DISPLAY_ON | LCD1602A_CURSOR_OFF | LCD1602A_BLINK_OFF;
    lcd1602a_display_on();

    /* Clear the entire display. */
    lcd1602a_display_clear();

    /* Default text direction. */
    _display_mode = LCD1602A_ENTRY_LEFT | LCD1602A_ENTRY_SHIFT_DEC;
    _command(LCD1602A_ENTRY_MODE_SET | _display_mode);
}

int lcd1602a_init(lcd1602a_iface_t iface, lcd1602a_pins_t * pins)
{
    _iface = iface;

    _rs = pins->rs;
    _rw = pins->rw;
    _e = pins->e;

    _data_pins[0] = pins->d0;
    _data_pins[1] = pins->d1;
    _data_pins[2] = pins->d2;
    _data_pins[3] = pins->d3;
    _data_pins[4] = pins->d4;
    _data_pins[5] = pins->d5;
    _data_pins[6] = pins->d6;
    _data_pins[7] = pins->d7;

    if (!(_iface & LCD1602A_8BIT_MODE)) {
        _functionality = LCD1602A_4BIT_MODE | LCD1602A_1LINE | LCD1602A_5x8DOTS;
        DEBUG("lcd: _init: 4-Bit interface, 1-Line, 5x8Dots (per default)\n");
    } else {
        _functionality = LCD1602A_8BIT_MODE | LCD1602A_1LINE | LCD1602A_5x8DOTS;
        DEBUG("lcd: _init: 8-Bit interface, 1-Line, 5x8Dots (per default)\n");
    }

    /* 16 collumns, 2 lines, 5x8 font size. */
    _power_up(16, 2 , LCD1602A_5x8DOTS); // Default settings.
    DEBUG("LCD: _init: init done\n");
    return 0;
}

void lcd1602a_write_buf(char * buf)
{
    for (int i = 0; i < (int)strlen(buf); i++) lcd1602a_write(buf[i]);
}

void lcd1602a_write(uint8_t value)
{
    DEBUG("LCD: write -> '%c'\n", (char)value);
    _send(value, HIGH);
}

void lcd1602a_display_on(void)
{
    DEBUG("LCD: Display -> Enable\n");
    _display_control |= LCD1602A_DISPLAY_ON;
    _command(LCD1602A_DISPLAY_ON_OFF | _display_control);
}

void lcd1602a_display_off(void)
{
    DEBUG("LCD: Display -> Disable\n");
    _display_control &= ~LCD1602A_DISPLAY_ON;
    _command(LCD1602A_DISPLAY_ON_OFF | _display_control);
}

void lcd1602a_display_clear(void)
{
    DEBUG("LCD: Display -> Clear\n");
    _command(LCD1602A_CLEAR_DISPLAY);
    xtimer_usleep(2000);
}

void lcd1602a_cursor_on(void)
{
    DEBUG("LCD: Cursor -> Enable\n");
    _display_control |= LCD1602A_CURSOR_ON;
    _command(LCD1602A_DISPLAY_ON_OFF | _display_control);
}

void lcd1602a_cursor_off(void)
{
    DEBUG("LCD: Cursor -> Disable\n");
    _display_control &= ~LCD1602A_CURSOR_ON;
    _command(LCD1602A_DISPLAY_ON_OFF | _display_control);
}

void lcd1602a_cursor_reset(void)
{
    DEBUG("LCD: Cursor -> Reset\n");
    _command(LCD1602A_RETURN_HOME);
    xtimer_usleep(2000);
}

void lcd1602a_cursor_set(uint8_t col, uint8_t row)
{
    DEBUG("LCD: Cursor -> Set col/row %i/%i\n", col, row);
    row = (row > 0) ? 1 : 0; // Lazy check if between 0 and 1.
    _command(LCD1602A_SET_DDRAM_ADDRESS | (col + _row_offset[row]));
}

void lcd1602a_blink_on(void)
{
    DEBUG("LCD: Blink -> Enable\n");
    _display_control |= LCD1602A_BLINK_ON;
    _command(LCD1602A_DISPLAY_ON_OFF | _display_control);
}

void lcd1602a_blink_off(void)
{
    DEBUG("LCD: Blink -> Disable\n");
    _display_control &= ~LCD1602A_BLINK_ON;
    _command(LCD1602A_DISPLAY_ON_OFF | _display_control);
}

void lcd1602a_scroll_left(void)
{
    DEBUG("LCD: Scroll -> Left\n");
    _command(LCD1602A_CURSOR_OR_DISPLAY_SHIFT | LCD1602A_DISPLAY_MOVE | LCD1602A_MOVE_LEFT);
}

void lcd1602a_scroll_right(void)
{
    DEBUG("LCD: Scroll -> Right\n");
    _command(LCD1602A_CURSOR_OR_DISPLAY_SHIFT | LCD1602A_DISPLAY_MOVE | LCD1602A_MOVE_RIGHT);
}

void lcd1602a_left_to_right(void)
{
    DEBUG("LCD: Text -> LeftToRight\n");
    _display_mode |= LCD1602A_ENTRY_LEFT;
    _command(LCD1602A_ENTRY_MODE_SET | _display_mode);
}

void lcd1602a_right_to_left(void)
{
    DEBUG("LCD: Text -> RightToLeft\n");
    _display_mode &= ~LCD1602A_ENTRY_LEFT;
    _command(LCD1602A_ENTRY_MODE_SET | _display_mode);
}

void lcd1602a_autoscroll_on(void)
{
    DEBUG("LCD: Autoscroll -> Enable\n");
    _display_mode |= LCD1602A_ENTRY_SHIFT_INC;
    _command(LCD1602A_ENTRY_MODE_SET | _display_mode);
}

void lcd1602a_autoscroll_off(void)
{
    DEBUG("LCD: Autoscroll -> Disable\n");
    _display_mode &= ~LCD1602A_ENTRY_SHIFT_INC;
    _command(LCD1602A_ENTRY_MODE_SET | _display_mode);
}
