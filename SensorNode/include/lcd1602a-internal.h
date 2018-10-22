/*
 * Copyright (C) 2018 HAW Hamburg
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup     drivers_lcd1602a
 *
 * @{
 *
 * @brief       Definitions for the 1602a lcd
 *
 * @author      René Herthel <rene.herthel@haw-hamburg.de>
 */

#ifndef LCD1602A_INTERNAL_H
#define LCD1602A_INTERNAL_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief LCD1602A Registers.
 * @{
 */
#define LCD1602A_CLEAR_DISPLAY 0x01
#define LCD1602A_RETURN_HOME 0x02
#define LCD1602A_ENTRY_MODE_SET 0x04
#define LCD1602A_DISPLAY_ON_OFF 0x08 /*< Also cursor. */
#define LCD1602A_CURSOR_OR_DISPLAY_SHIFT 0x10
#define LCD1602A_FUNCTION_SET 0x20
#define LCD1602A_SET_CGRAM_ADDRESS 0x40
#define LCD1602A_SET_DDRAM_ADDRESS 0x80
/** }@ */

/**
 * @brief LCD1602A flags for display entry mode set
 * @{
 */
#define LCD1602A_ENTRY_RIGHT 0x00
#define LCD1602A_ENTRY_LEFT 0x02
#define LCD1602A_ENTRY_SHIFT_INC 0x01
#define LCD1602A_ENTRY_SHIFT_DEC 0x00
/** }@ */

/**
 * @brief LCD1602A flags for display controls
 * @{
 */
#define LCD1602A_DISPLAY_ON 0x04
#define LCD1602A_DISPLAY_OFF 0x00
#define LCD1602A_CURSOR_ON 0x02
#define LCD1602A_CURSOR_OFF 0x00
#define LCD1602A_BLINK_ON 0x01
#define LCD1602A_BLINK_OFF 0x00
/** }@ */

/**
 * @brief LCD1602A flags for moving the display/cursor
 * @{
 */
#define LCD1602A_DISPLAY_MOVE 0x08
#define LCD1602A_CURSOR_MOVE 0x00
#define LCD1602A_MOVE_RIGHT 0x04
#define LCD1602A_MOVE_LEFT 0x00
/** }@ */

/**
 * @brief LCD1602A flags for function set register
 * @{
 */
#define LCD1602A_8BIT_MODE 0x10
#define LCD1602A_4BIT_MODE 0x00
#define LCD1602A_2LINE 0x08
#define LCD1602A_1LINE 0x00
#define LCD1602A_5x10DOTS 0x04
#define LCD1602A_5x8DOTS 0x00
/** }@ */


#ifdef __cplusplus
}
#endif

#endif /* LCD1602A_INTERNAL_H */
/** @} */
