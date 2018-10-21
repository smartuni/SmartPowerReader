/*
 * @file lcd_1602a.c
 * @author Rene Herthel <rene.herthel@haw-hamburg.de>
 * @description TODO
 */

#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "periph/gpio.h"
#include "timex.h"
#include "xtimer.h"
#include "fmt.h"
#include "lcd_1602a.h"

/* Just to debug from very low level to 'user'-like level */
#define ENABLE_DEBUG    (0)
#include "debug.h"

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
static gpio_t _rs;
static gpio_t _rw;
static gpio_t _e;
static uint8_t _lines;
static uint8_t _row_offset[4];

/**
 * @brief    Creates a single enable-impulse.
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
 */
static inline void _write(uint8_t value)
{
    /* XXX: This needs a bit polish! make sure:
     *      (value >> i) matches !(_functionality & LCD_8BIT_MODE) ? 4 : 0;!!!
     */
    int j = !(_functionality & LCD_8BIT_MODE) ? 4 : 0;
    //DEBUG("_write '%i' to d-pin's:   ", value);
    for (int i = j; i < PINS_SIZE; i++) {
        //DEBUG("value: %i   ", (value >> (i-j)));
        gpio_write(_data_pins[i], (value >> (i-j)) & HIGH);
    }
    //DEBUG("\n");

    _pulse_enable();
}

static inline void _send(uint8_t value, uint8_t mode)
{
    gpio_write(_rs, mode);
    gpio_write(_rw, LOW);

    if (_functionality & LCD_8BIT_MODE) {
        //DEBUG("_send: write as 8-bit\n");
        _write(value);
    } else {
        //DEBUG("_send: write as 4-Bit\n");
        _write(value >> 4);
        //DEBUG("_send: write a second time\n");
        _write(value);
    }
}

static inline void _command(uint8_t value)
{
    _send(value, LOW);
}

static inline void _power_up(uint8_t collumns, uint8_t lines, lcd_1602a_dots_t dot_size)
{
    DEBUG("LCD: Powering up start # # # # # # # # # #\n");

    if (_lines > 1) {
        _functionality |= LCD_2LINE;
        DEBUG("LCD: _power_up: Use 2 Lines\n");
    }

    _lines = lines;

    /* Needed later for positioning the cursor. */
    _row_offset[0] = 0x00;
    _row_offset[1] = 0x40;
    _row_offset[2] = 0x00 + collumns;
    _row_offset[3] = 0x40 + collumns;

    /* If a 1 line display can have 10 pixel high font. */
    if ((dot_size != LCD_5x8DOTS) && (_lines == 1)) {
        _functionality |= LCD_5x10DOTS;
        DEBUG("LCD: _power_up: Use 5 x 10 Dots\n");
    }

    gpio_init(_rs, GPIO_OUT);
    gpio_init(_rw, GPIO_OUT);
    gpio_init(_e, GPIO_OUT);
    DEBUG("LCD: _power_up: rs-, rw-, e-Pin set as GPIO_OUT\n");

    for (int i = (!(_functionality & LCD_8BIT_MODE) ? 4 : 0); i < PINS_SIZE; i++) {
        DEBUG("LCD: _power_up: (D%i)-Pin set as GPIO_OUT \n", i);
        gpio_init(_data_pins[i], GPIO_OUT);
    }

    /* Wait at least 40 ms to let the power rise above 2.7V */
    xtimer_usleep(50LU * US_PER_MS);

    gpio_write(_rs, LOW);
    gpio_write(_e, LOW);
    gpio_write(_rw, LOW);
    DEBUG("LCD: _power_up: rs-, rw-, e-Pin are LOW now\n");

    if (!(_functionality & LCD_8BIT_MODE)) {
        _write(0x03);
        xtimer_usleep(4500);
        _write(0x03);
        xtimer_usleep(4500);
        _write(0x03);
        xtimer_usleep(150);
        _write(0x02);
        DEBUG("LCD: _power_up: 4-Bit mode\n");
    } else {
        _command(LCD_FUNCTION_SET | _functionality);
        xtimer_usleep(4500);
        _command(LCD_FUNCTION_SET | _functionality);
        xtimer_usleep(150);
        _command(LCD_FUNCTION_SET | _functionality);
        DEBUG("LCD: _power_up: 8-Bit mode\n");
    }

    /*
    char buf[16];
    fmt_byte_hex(buf, _functionality);
    DEBUG("LCD: functionality: 0x%s\n", buf);
    */

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

    DEBUG("LCD: Powering up is done! # # # # # # # # # #\n");
}

int lcd_init(lcd_iface_t iface, lcd_pins_t * pins)
{
    _iface = iface;

    _rs = pins->rs;
    _rw = pins->rw;
    _e = pins->e;

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
        DEBUG("lcd: _init: 4-Bit interface, 1-Line, 5x8Dots\n");
    } else {
        _functionality = LCD_8BIT_MODE | LCD_1LINE | LCD_5x8DOTS;
        DEBUG("lcd: _init: 8-Bit interface, 1-Line, 5x8Dots\n");
    }

    _power_up(16, 2 , LCD_5x8DOTS); // Default settings.
    DEBUG("lcd: _init: init done\n");
    return 0;
}

void lcd_write_buf(char * buf)
{
    /* We need strlen, because the length of buf
     * cant be processed in compiler runtime. */
    int size = strlen(buf);

    for (int i = 0; i < size; i++) {
        char c = buf[i];
        lcd_write(c);
    }
}

void lcd_write(uint8_t value)
{
    DEBUG("LCD: write -> (%c)\n", (char)value);
    _send(value, HIGH);
}

void lcd_home(void)
{
    DEBUG("LCD: Home\n");
    _command(LCD_RETURN_HOME);
    xtimer_usleep(2000);
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
    xtimer_usleep(2000);
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

void lcd_cursor_set(uint8_t col, uint8_t row)
{
    size_t max_lines = sizeof(_row_offset) / sizeof(*_row_offset);

    if (row >= max_lines) {
        row = max_lines -1; // Start count rows with /0
    }

    if (row >= _lines) {
        row = _lines - 1;
    }

    _command(LCD_SET_DDRAM_ADDRESS | (col + _row_offset[row]));
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
