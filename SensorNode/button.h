/*
 * @file      button.h
 * @author    Rene Herthel <rene.herthel@haw-hamburg.de>
 *
 * @brief     GPIO wrapper for buttons.
 */

#ifndef BUTTON_H
#define BUTTON_H

#ifdef __cplusplus
extern "C" {
#endif

#include "periph/gpio.h"

/**
 * @brief The different states of a button
 */
typedef enum {
    BUTTON_OFF = 0,
    BUTTON_ON
} button_opt_t;

typedef gpio_t button_t;

/**
 * @brief Initialize a button via GPIO.
 */
int button_init(button_t * button, int port, int pin, gpio_cb_t cb, void *arg);

/**
 * @brief Assign the given option to the button.
 */
int button_opt(button_t * button, button_opt_t opt);

/**
 * @brief Read a button and return a value based on the input.
 */
int button_read(button_t * button);

#ifdef __cplusplus
}
#endif

#endif /* BUTTON_H */
