/**
 * @brief Implementation of a button with useful functions.
 */

#include "button.h"
#include "periph/gpio.h"
#include "features.h"

#define ENABLE_DEBUG    (0)
#include "debug.h"

/**
 * @brief Turn the given button on via GPIO.
 */
static inline void _turn_on(button_t * button)
{
    DEBUG("Button: turn on\n");
    gpio_set(*button);
}

/**
 * @brief Turn the given button off via GPIO.
 */
static inline void _turn_off(button_t * button)
{
    DEBUG("Button: turn off\n");
    gpio_clear(*button);
}

int button_init(button_t * button, int port, int pin, gpio_cb_t cb, void *arg)
{
#if !(FEATURE_USE_BUTTONS)
    DEBUG("Features: Buttons are disabled!\n");
    return 2;
#endif
    DEBUG("Button: INIT -> port=%d pin=%d\n", port, pin);
    *button = GPIO_PIN(port, pin);
    /* Our buttons are always initalized as input. */
    // int ret_code = gpio_init(*button, GPIO_IN);
    int ret_code = 1;

    gpio_irq_enable(*button);
    if (gpio_init_int(*button, GPIO_IN_PU, GPIO_RISING, cb, arg) < 0) {
        printf("Button: INIT -> unable to init interrupt for port=%d, pin=%d\n", port, pin);
    }

    return ret_code;
}

int button_opt(button_t * button, button_opt_t opt)
{
#if !(FEATURE_USE_BUTTONS)
    DEBUG("Features: Buttons are disabled!\n");
    return 2;
#endif

    DEBUG("Button: OPT -> opt=%d\n", opt);
    switch (opt) {

        case BUTTON_OFF:
            _turn_off(button);
            break;

        case BUTTON_ON:
            _turn_on(button);
            break;

        default:
            DEBUG("BUTTON: INIT -> undefined option\n");
            return 1;
    }

    return 0;
}

int button_read(button_t * button)
{
#if !(FEATURE_USE_BUTTONS)
    DEBUG("Features: Buttons are disabled!\n");
    return 2;
#endif

    int ret_code = gpio_read(*button);
    DEBUG("Button: READ -> %s\n", ((ret_code == 1) ? "HIGH" : "LOW"));
    return ret_code;
}
