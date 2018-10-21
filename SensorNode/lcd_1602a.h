/*
 * @file           lcd_1602a.h
 * @author         Rene Herthel <rene.herthel@haw-hamburg.de>
 * @description    Header file for a 1602A LCD implementation.
 */

#ifndef LCD_1602A_H
#define LCD_1602A_H

#include "periph/gpio.h"

#ifdef __cplusplus
extern "C" {
#endif

/*
 * @brief     Command codes as hex values.
 */
#define LCD_CLEAR_DISPLAY 0x01
#define LCD_RETURN_HOME 0x02
#define LCD_ENTRY_MODE_SET 0x04
#define LCD_DISPLAY_ON_OFF 0x08 // Also cursor
#define LCD_CURSOR_OR_DISPLAY_SHIFT 0x10
#define LCD_FUNCTION_SET 0x20
#define LCD_SET_CGRAM_ADDRESS 0x40
#define LCD_SET_DDRAM_ADDRESS 0x80

/*
 * @brief Flags for display entry mode.
 */
 #define LCD_ENTRY_RIGHT 0x00
 #define LCD_ENTRY_LEFT 0x02
 #define LCD_ENTRY_SHIFT_INC 0x01
 #define LCD_ENTRY_SHIFT_DEC 0x00

/*
 * @brief Flags for display on/off control.
 */
#define LCD_DISPLAY_ON 0x04
#define LCD_DISPLAY_OFF 0x00
#define LCD_CURSOR_ON 0x02
#define LCD_CURSOR_OFF 0x00
#define LCD_BLINK_ON 0x01
#define LCD_BLINK_OFF 0x00

/*
 * @brief Flags for display/cursor shift.
 */
 #define LCD_DISPLAY_MOVE 0x08
 #define LCD_CURSOR_MOVE 0x00
 #define LCD_MOVE_RIGHT 0x04
 #define LCD_MOVE_LEFT 0x00

/*
 * @brief Flags for function set
 */
#define LCD_8BIT_MODE 0x10
#define LCD_4BIT_MODE 0x00
#define LCD_2LINE 0x08
#define LCD_1LINE 0x00
//#define LCD_5x10DOTS 0x04
//#define LCD_5x8DOTS 0x00

/**
 * @brief    The indices of the data pins in the array.
 */
#define LCD_PIN_D0  (0)
#define LCD_PIN_D1  (1)
#define LCD_PIN_D2  (2)
#define LCD_PIN_D3  (3)
#define LCD_PIN_D4  (4)
#define LCD_PIN_D5  (5)
#define LCD_PIN_D6  (6)
#define LCD_PIN_D7 (7)

/**
 * @brief    available data bus interface modes
 */
typedef enum {
    MODE_4BIT,
    MODE_8BIT
} lcd_iface_t;

/**
 * @brief    The size of the characters on the lcd.
 */
typedef enum {
    LCD_5x8DOTS = 0, /*< 0x00 0b00000000 */
    LCD_5x10DOTS = 4 /*< 0x04 0b00000100 */
} lcd_1602a_dots_t;

/**
 * @brief    The pins used to interface the lcd
 */
typedef struct {
    gpio_t rs; /*< Register Select */
    gpio_t rw; /*< Read Write*/
    gpio_t e;  /*< Enable */
    gpio_t d0; /*< Data bus 0 */
    gpio_t d1; /*< Data bus 1 */
    gpio_t d2; /*< Data bus 2 */
    gpio_t d3; /*< Data bus 3 */
    gpio_t d4; /*< Data bus 4 */
    gpio_t d5; /*< Data bus 5 */
    gpio_t d6; /*< Data bus 6 */
    gpio_t d7; /*< Data bus 7 */
} lcd_pins_t;

/**
 * @brief     Initialize and power up the lcd.
 *
 * @return    [int] < 0 on Error, else Success.
 */
int lcd_init(lcd_iface_t iface, lcd_pins_t * pins);

/**
 * @brief    Writes a value to the the lcd display.
 */
void lcd_write(uint8_t value);

/**
 * @brief    Set the cursor position to zero.
 *           NOTE: This is very slow. It takes about 2 seconds!
 */
void lcd_home(void);

/**
 * @brief    Set the display on.
 */
void lcd_display_on(void);

/**
 * @brief    Set the display off.
 */
void lcd_display_off(void);

/**
 * @brief    Clears the entire display & sets the cursor position to zero.
 *           NOTE: This is very slow. It takes about 2 seconds!
 */
void lcd_display_clear(void);

/**
 * @brief    Turns the underlining cursor on.
 */
void lcd_cursor_on(void);

/**
 * @brief    Turns the underlining cursor off.
 */
void lcd_cursor_off(void);

/**
 * @brief    Turns the blinking cursor on.
 */
void lcd_blink_on(void);

/**
 * @brief    Turns the blinking cursor off.
 */
void lcd_blink_off(void);

/**
 * @brief    Scroll the display to the left.
 */
void lcd_scroll_left(void);

/**
 * @brief    Scroll the display to the right.
 */
void lcd_scroll_right(void);

/**
 * @brief    Let the text flows from left to right.
 */
void lcd_left_to_right(void);

/**
 * @brief    Let the text flows from right to left.
 */
void lcd_right_to_left(void);

/**
 * @brief    Right justify the text from the cursor.
 */
void lcd_autoscroll_on(void);

/**
 * @brief    Left justify the text from the cursor.
 */
void lcd_autoscroll_off(void);

#ifdef __cplusplus
}
#endif

#endif /* LCD_1602A_H */
