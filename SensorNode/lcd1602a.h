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
 * @brief    Available character font sizes
 */
typedef enum {
    DOTSIZE_5x8,
    DOTSIZE_5x10
} lcd1602a_dotsize_t;

/*
 * @brief The
 */
#define MAX_DATA_PINS       (8)

/**
 * @brief    The pins used to interface the lcd
 */
typedef struct {
    gpio_t register_select_pin;          /*< Register Select: LOW:command; HIGH:Character. */
    gpio_t read_write_pin;               /*< Read Write: LOW:Write to LCD; HIGH: Read from LCD. */
    gpio_t enable_pin;                   /*< Enable: Activated by a HIGH pulse. */
    gpio_t data_pins[MAX_DATA_PINS]; /*< The available data pins. */
    lcd1602a_iface_t iface;          /*< The used interface (4-, 8-Bit) */
    lcd1602a_dotsize_t dotsize;
    uint8_t functions;               /*< The active functionality. */
    uint8_t controls;                 /*< The controls */
    uint8_t modes;                    /*< The modes */
    uint8_t lines;                   /*< The number of lines available. */
    uint8_t collumns;
    uint8_t row_offset[4];          /*< Offset to place the cursor */
} lcd1602a_dev_t;

/**
 * @brief     Initialize and power up the lcd.
 *
 * @param[in] iface    The used interface of 4-, or 8-bit.
 * @param[in] pins     The pins connected to the display.
 *
 * @return    [int] < 0 on Error, else Success.
 */
int lcd1602a_init(lcd1602a_dev_t * dev);

/**
 * @brief    Writes a value to the the lcd display.
 *
 * @return [in] value  The value to write onto the display.
 */
void lcd1602a_write(lcd1602a_dev_t * dev, uint8_t value);

/**
 * @brief    Writes a buffer of chars to the lcd.
 *
 * @param[in] buf      A string as char-array to write onto the display.
 */
void lcd1602a_write_buf(lcd1602a_dev_t * dev, char * buf);

/**
 * @brief    Set the display on.
 */
void lcd1602a_display_on(lcd1602a_dev_t * dev);

/**
 * @brief    Set the display off.
 */
void lcd1602a_display_off(lcd1602a_dev_t * dev);

/**
 * @brief    Clears the entire display & sets the cursor position to zero.
 */
void lcd1602a_display_clear(lcd1602a_dev_t * dev);

/**
 * @brief    Turns the underlining cursor on.
 */
void lcd1602a_cursor_on(lcd1602a_dev_t * dev);

/**
 * @brief    Turns the underlining cursor off.
 */
void lcd1602a_cursor_off(lcd1602a_dev_t * dev);

/**
 * @brief    Set the cursor position to zero.
 */
void lcd1602a_cursor_reset(lcd1602a_dev_t * dev);

/**
 * @brief    Set the cursor at the given collumn and row.
 *
 * @note     Typically col is between 0 and 15. Row is between 0 and 1.
 *
 * @param[in] col    The collumn to set the cursor.
 * @param[in] row    The row to set the cursor.
 */
void lcd1602a_cursor_set(lcd1602a_dev_t * dev, uint8_t col, uint8_t row);

/**
 * @brief    Turns the blinking cursor on.
 */
void lcd1602a_blink_on(lcd1602a_dev_t * dev);

/**
 * @brief    Turns the blinking cursor off.
 */
void lcd1602a_blink_off(lcd1602a_dev_t * dev);

/**
 * @brief    Scroll the display to the left.
 */
void lcd1602a_scroll_left(lcd1602a_dev_t * dev);

/**
 * @brief    Scroll the display to the right.
 */
void lcd1602a_scroll_right(lcd1602a_dev_t * dev);

/**
 * @brief    Let the text flows from left to right.
 */
void lcd_left_to_right(lcd1602a_dev_t * dev);

/**
 * @brief    Let the text flows from right to left.
 */
void lcd1602a_right_to_left(lcd1602a_dev_t * dev);

/**
 * @brief    Right justify the text from the cursor.
 */
void lcd1602a_autoscroll_on(lcd1602a_dev_t * dev);

/**
 * @brief    Left justify the text from the cursor.
 */
void lcd1602a_autoscroll_off(lcd1602a_dev_t * dev);

#ifdef __cplusplus
}
#endif

#endif /* LCD1602A_H */
