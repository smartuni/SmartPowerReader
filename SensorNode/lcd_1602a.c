/*
 * @file lcd_1602a.c
 * @author Rene Herthel <rene.herthel@haw-hamburg.de>
 * @description TODO
 */

#include <stdio.h>
#include <stdint.h>

#include "periph/gpio.h"
#include "timex.h"
#include "xtimer.h"
#include "fmt.h"
#include "lcd_1602a.h"

/* Just to debug from very low level to 'user'-like level */
#define ENABLE_DEBUG    (1)
#define LEVEL1_DEBUG    (1)
#define LEVEL2_DEBUG    (0)
#include "debug.h"
#ifdef LEVEL1_DEBUG
    #define DEBUG_LEVEL1 DEBUG
#endif
#ifdef LEVEL2_DEBUG
    #define DEBUG_LEVEL2 DEBUG
#endif

/* Logic Level's */
#define LOW             (0)
#define HIGH            (1)

/* The maximum used data bus pins. */
#define PINS_SIZE       (8)

/* Parameters which are hold between functions. */
static uint8_t _functionality;
static uint8_t _display_control;
static uint8_t _display_mode;
static lcd_iface_t _iface;
static gpio_t _data_pins[PINS_SIZE];
static gpio_t _register_select;
static gpio_t _read_write;
static gpio_t _enable;
static uint8_t _lines;
static uint8_t _row_offset[4];

/**
 * @brief    Creates a single enable-impulse.
 */
static inline void _pulse_enable(void)
{
    gpio_write(_enable, LOW);
    xtimer_usleep(1LU);
    gpio_write(_enable, HIGH);
    xtimer_usleep(1LU);
    gpio_write(_enable, LOW);
    xtimer_usleep(100LU);
}

/**
 * @brief    Writes the given value to the lcd, by setting the corresponding
 *           interface data-bus-pins to high.
 */
static inline void _write(uint8_t value)
{
    DEBUG_LEVEL1("_write '%c' to d-pin's:   ", (char)value);
    for (int i = (!(_functionality & LCD_8BIT_MODE) ? 4 : 0); i < PINS_SIZE; i++) {
        DEBUG_LEVEL1("%i   ", i);
        gpio_write(_data_pins[i], (value >> i) & HIGH);
    }
    DEBUG_LEVEL1("\n");

    _pulse_enable();
}

static inline void _send(uint8_t value, uint8_t mode)
{
    gpio_write(_register_select, mode);
    gpio_write(_read_write, LOW);

    if (_functionality & LCD_8BIT_MODE) {
        DEBUG("_send: write as 8-bit\n");
        _write(value);
    } else {
        DEBUG("_send: write as 4-Bit\n");
        _write(value >> 4);
        DEBUG("_send: write a second time\n");
        _write(value);
    }
}

static inline void _command(uint8_t value)
{
    _send(value, LOW);
}

static inline void _power_up(uint8_t collumns, uint8_t lines, lcd_1602a_dots_t dot_size)
{
    _lines = lines;

    if (_lines > 1) {
        _functionality |= LCD_2LINE;
        DEBUG("lcd: _power_up: _lines > 1\n");
    }

    /* Needed later for positioning the cursor. */
    _row_offset[0] = 0x00;
    _row_offset[1] = 0x40;
    _row_offset[2] = 0x00 + collumns;
    _row_offset[3] = 0x40 + collumns;

    if ((dot_size != LCD_5x8DOTS) && (_lines == 1)) {
        _functionality |= LCD_5x10DOTS;
        DEBUG("lcd: _power_up: LCD_5x10DOTS\n");
    }

    DEBUG("lcd: _power_up: rs-, rw-, e-pins before gpio_init\n");
    gpio_init(_register_select, GPIO_OUT);
    gpio_init(_read_write, GPIO_OUT);
    gpio_init(_enable, GPIO_OUT);
    DEBUG("lcd: _power_up: rs-, rw-, e-pins as GPIO_OUT now\n");

    for (int i = (!(_functionality & LCD_8BIT_MODE) ? 4 : 0); i < 8; i++) {
        DEBUG("lcd: _power_up: data pin (%i) as out \n", i);
        gpio_init(_data_pins[i], GPIO_OUT);
    }

    /* Wait at least 40 ms to let the power rise above 2.7V */
    xtimer_usleep(50LU * US_PER_MS);

    gpio_write(_register_select, LOW);
    gpio_write(_enable, LOW);
    gpio_write(_read_write, LOW);
    DEBUG("lcd: _power_up: rs, e, rw are low now\n");

    if (!(_functionality & LCD_8BIT_MODE)) {
        _write(0x03);
        xtimer_usleep(5LU * US_PER_MS);
        _write(0x03);
        xtimer_usleep(5LU * US_PER_MS);
        _write(0x03);
        xtimer_usleep(5LU * US_PER_MS);
        _write(0x02);
        DEBUG("lcd: _power_up: 4-Bit mode\n");
    } else {
      _command(LCD_FUNCTION_SET | _functionality);
      xtimer_usleep(5LU * US_PER_MS);
      _command(LCD_FUNCTION_SET | _functionality);
      xtimer_usleep(5LU * US_PER_MS);
      _command(LCD_FUNCTION_SET | _functionality);
    }

    char buf[16];
    fmt_byte_hex(buf, _functionality);
    DEBUG("lcd: functionality: 0x%s\n", buf);

    /* Set No. of lines, dot size, etc. */
    _command(LCD_FUNCTION_SET | _functionality);

    /* Turn the dsiplay on with no cursor or blinking by default. */
    _display_control = LCD_DISPLAY_ON | LCD_CURSOR_OFF | LCD_BLINK_OFF;
    lcd_display_on();

    /* Clear the entire display. */
    lcd_display_clear();

    /* Default text direction. */
    _display_mode = LCD_ENTRY_LEFT | LCD_ENTRY_SHIFT_DEC;
    _command(LCD_ENTRY_MODE_SET | _display_mode);
}

int lcd_init(lcd_iface_t iface, lcd_pins_t * pins)
{
    _iface = iface;

    _register_select = pins->rs;
    _read_write = pins->rw;
    _enable = pins->e;

    _data_pins[LCD_PIN_D0] = pins->d0;
    _data_pins[LCD_PIN_D1] = pins->d1;
    _data_pins[LCD_PIN_D2] = pins->d2;
    _data_pins[LCD_PIN_D3] = pins->d3;
    _data_pins[LCD_PIN_D4] = pins->d4;
    _data_pins[LCD_PIN_D5] = pins->d5;
    _data_pins[LCD_PIN_D6] = pins->d6;
    _data_pins[LCD_PIN_D7] = pins->d7;

    if (!(_iface & LCD_8BIT_MODE)) {
        _functionality = LCD_4BIT_MODE | LCD_1LINE | LCD_5x8DOTS;
        DEBUG("lcd: _init: 4-Bit mode\n");
    } else {
        _functionality = LCD_8BIT_MODE | LCD_1LINE | LCD_5x8DOTS;
        DEBUG("lcd: _init: 8-Bit mode\n");
    }

    char buf[10];
    fmt_byte_hex(buf, _iface);
    DEBUG("lcd: _init: _functionality: 0x%s\n", buf);

    _power_up(16, 1 , LCD_5x8DOTS); // Default settings.
    DEBUG("lcd: _init: init done\n");
    return 1;
}

void lcd_write(uint8_t value)
{
    _send(value, HIGH);
}

void lcd_home(void)
{
    DEBUG("LCD: Home\n");
    _command(LCD_RETURN_HOME);
    xtimer_usleep(2000LU * US_PER_MS);
}

void lcd_display_on(void)
{
    DEBUG("LCD: Display -> Enable\n");
    _display_control |= LCD_DISPLAY_ON;
    _command(LCD_DISPLAY_ON_OFF | _display_control);
}

void lcd_display_off(void)
{
    DEBUG("LCD: Display -> Disable\n");
    _display_control &= ~LCD_DISPLAY_ON;
    _command(LCD_DISPLAY_ON_OFF | _display_control);
}

void lcd_display_clear(void)
{
    DEBUG("LCD: Display -> Clear\n");
    _command(LCD_CLEAR_DISPLAY);
    xtimer_usleep(2000LU * US_PER_MS);
}

void lcd_cursor_on(void)
{
    DEBUG("LCD: Cursor -> Enable\n");
    _display_control |= LCD_CURSOR_ON;
    _command(LCD_DISPLAY_ON_OFF | _display_control);
}

void lcd_cursor_off(void)
{
    DEBUG("LCD: Cursor -> Disable\n");
    _display_control &= ~LCD_CURSOR_ON;
    _command(LCD_DISPLAY_ON_OFF | _display_control);
}

void lcd_blink_on(void)
{
    DEBUG("LCD: Blink -> Enable\n");
    _display_control |= LCD_BLINK_ON;
    _command(LCD_DISPLAY_ON_OFF | _display_control);
}

void lcd_blink_off(void)
{
    DEBUG("LCD: Blink -> Disable\n");
    _display_control &= ~LCD_BLINK_ON;
    _command(LCD_DISPLAY_ON_OFF | _display_control);
}

void lcd_scroll_left(void)
{
    DEBUG("LCD: Scroll -> Left\n");
    _command(LCD_CURSOR_OR_DISPLAY_SHIFT | LCD_DISPLAY_MOVE | LCD_MOVE_LEFT);
}

void lcd_scroll_right(void)
{
    DEBUG("LCD: Scroll -> Right\n");
    _command(LCD_CURSOR_OR_DISPLAY_SHIFT | LCD_DISPLAY_MOVE | LCD_MOVE_RIGHT);
}

void lcd_left_to_right(void)
{
    DEBUG("LCD: Text -> LeftToRight\n");
    _display_mode |= LCD_ENTRY_LEFT;
    _command(LCD_ENTRY_MODE_SET | _display_mode);
}

void lcd_right_to_left(void)
{
    DEBUG("LCD: Text -> RightToLeft\n");
    _display_mode &= ~LCD_ENTRY_LEFT;
    _command(LCD_ENTRY_MODE_SET | _display_mode);
}

void lcd_autoscroll_on(void)
{
    DEBUG("LCD: Autoscroll -> Enable\n");
    _display_mode |= LCD_ENTRY_SHIFT_INC;
    _command(LCD_ENTRY_MODE_SET | _display_mode);
}

void lcd_autoscroll_off(void)
{
    DEBUG("LCD: Autoscroll -> Disable\n");
    _display_mode &= ~LCD_ENTRY_SHIFT_INC;
    _command(LCD_ENTRY_MODE_SET | _display_mode);
}
