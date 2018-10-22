/*
 * Copyright (C) 2018 HAW Hamburg
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup       driver_1602a
 *
 * @{
 *
 * @brief          Header file for a 1602A LCD driver implementation.
 *
 * @author         Rene Herthel <rene.herthel@haw-hamburg.de>
 */

#ifndef LCD1602A_H
#define LCD1602A_H

#include "periph/gpio.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief    available data bus interface modes
 */
typedef enum {
    MODE_4BIT, /*< Use D4 - D7 as 4-Bit interface */
    MODE_8BIT  /*< Use D0 - D7 as 8-Bit interface */
} lcd1602a_iface_t;

/**
 * @brief    The pins used to interface the lcd
 */
typedef struct {
    gpio_t rs; /*< Register Select: LOW:command; HIGH:Character. */
    gpio_t rw; /*< Read Write: LOW:Write to LCD; HIGH: Read from LCD. */
    gpio_t e;  /*< Enable: Activated by a HIGH pulse. */
    gpio_t d0; /*< Data bus 0 */
    gpio_t d1; /*< Data bus 1 */
    gpio_t d2; /*< Data bus 2 */
    gpio_t d3; /*< Data bus 3 */
    gpio_t d4; /*< Data bus 4 */
    gpio_t d5; /*< Data bus 5 */
    gpio_t d6; /*< Data bus 6 */
    gpio_t d7; /*< Data bus 7 */
} lcd1602a_pins_t;

/**
 * @brief     Initialize and power up the lcd.
 *
 * @param[in] iface    The used interface of 4-, or 8-bit.
 * @param[in] pins     The pins connected to the display.
 *
 * @return    [int] < 0 on Error, else Success.
 */
int lcd1602a_init(lcd1602a_iface_t iface, lcd1602a_pins_t * pins);

/**
 * @brief    Writes a value to the the lcd display.
 *
 * @return [in] value  The value to write onto the display.
 */
void lcd1602a_write(uint8_t value);

/**
 * @brief    Writes a buffer of chars to the lcd.
 *
 * @param[in] buf      A string as char-array to write onto the display.
 */
void lcd1602a_write_buf(char * buf);

/**
 * @brief    Set the display on.
 */
void lcd1602a_display_on(void);

/**
 * @brief    Set the display off.
 */
void lcd1602a_display_off(void);

/**
 * @brief    Clears the entire display & sets the cursor position to zero.
 */
void lcd1602a_display_clear(void);

/**
 * @brief    Turns the underlining cursor on.
 */
void lcd1602a_cursor_on(void);

/**
 * @brief    Turns the underlining cursor off.
 */
void lcd1602a_cursor_off(void);

/**
 * @brief    Set the cursor position to zero.
 */
void lcd1602a_cursor_reset(void);

/**
 * @brief    Set the cursor at the given collumn and row.
 *
 * @note     Typically col is between 0 and 15. Row is between 0 and 1.
 *
 * @param[in] col    The collumn to set the cursor.
 * @param[in] row    The row to set the cursor.
 */
void lcd1602a_cursor_set(uint8_t col, uint8_t row);

/**
 * @brief    Turns the blinking cursor on.
 */
void lcd1602a_blink_on(void);

/**
 * @brief    Turns the blinking cursor off.
 */
void lcd1602a_blink_off(void);

/**
 * @brief    Scroll the display to the left.
 */
void lcd1602a_scroll_left(void);

/**
 * @brief    Scroll the display to the right.
 */
void lcd1602a_scroll_right(void);

/**
 * @brief    Let the text flows from left to right.
 */
void lcd_left_to_right(void);

/**
 * @brief    Let the text flows from right to left.
 */
void lcd1602a_right_to_left(void);

/**
 * @brief    Right justify the text from the cursor.
 */
void lcd1602a_autoscroll_on(void);

/**
 * @brief    Left justify the text from the cursor.
 */
void lcd1602a_autoscroll_off(void);

#ifdef __cplusplus
}
#endif

#endif /* LCD1602A_H */
