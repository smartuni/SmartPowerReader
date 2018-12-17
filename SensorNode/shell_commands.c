/**
 * Holds different costum shell commands, mostly used for testing.
 */

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "periph_cpu.h"
#include "periph/gpio.h"
#include "od.h"
#include "fmt.h"
#include "xtimer.h"
#include "timex.h"

#include "ct_sensor.h"
#include "lcd1602a.h"

#include "features.h"

/* Enable/Disable in main */
#if FEATURE_USE_DISPLAY
    #define USE_PHYWAVE (1) /*< NOTE: 0 Means to use Nucleo board! */
#endif /* FEATURE_USE_DISPLAY */

/**
 * @brief Initialze the lcd display for nucleo or phywave board ONLY.
 */
#if FEATURE_USE_DISPLAY
static inline void _init_lcd(lcd1602a_dev_t * lcd)
{
    lcd1602a_iface_t iface = MODE_4BIT;
    lcd1602a_dotsize_t dotsize = DOTSIZE_5x8;
#if USE_PHYWAVE
    /* PhyWave configuration */
    int PORT_A = 0;
    int PORT_C = 2;
    int PORT_E = 4;
    lcd->register_select_pin = GPIO_PIN(PORT_E, 4);
    lcd->read_write_pin = GPIO_PIN(PORT_A, 19);
    lcd->enable_pin = GPIO_PIN(PORT_A, 2);
    lcd->data_pins[0] = 0; // Not used. We use a 4-Bit interface here.
    lcd->data_pins[1] = 0; // Not used.
    lcd->data_pins[2] = 0; // Not used.
    lcd->data_pins[3] = 0; // Not used.
    lcd->data_pins[4] = GPIO_PIN(PORT_A, 1);
    lcd->data_pins[5] = GPIO_PIN(PORT_C, 4);
    lcd->data_pins[6] = GPIO_PIN(PORT_C, 7);
    lcd->data_pins[7] =  GPIO_PIN(PORT_C, 5);
    lcd->iface = iface;
    lcd->dotsize = dotsize;
    lcd->lines = 2;
    lcd->collumns = 16;
#else
    /* Nucleo configuration */
    int PORT_A = 0;
    int PORT_B = 1;
    int PORT_C = 2;
    lcd.register_select_pin = GPIO_PIN(PORT_A, 9);
    lcd.read_write_pin = GPIO_PIN(PORT_A, 8);
    lcd.enable_pin = GPIO_PIN(PORT_C, 7);
    lcd.data_pins[0] = 0; // Not used. We use a 4-Bit interface here.
    lcd.data_pins[1] = 0; // Not used.
    lcd.data_pins[2] = 0; // Not used.
    lcd.data_pins[3] = 0; // Not used.
    lcd.data_pins[4] = GPIO_PIN(PORT_B, 3);
    lcd.data_pins[5] = GPIO_PIN(PORT_B, 5);
    lcd.data_pins[6] = GPIO_PIN(PORT_B, 4);
    lcd.data_pins[7] = GPIO_PIN(PORT_B, 10);
    lcd.iface = iface;
    lcd.dotsize = dotsize;
    lcd.lines = 2;
    lcd.collumns = 16;
#endif /* USE_PHYWAVE */
    lcd1602a_init(lcd);
}
#endif

/**
 * Writes the second and third argument on the lcd.
 */
int lcd_write_cmd(int argc, char **argv)
{
#if FEATURE_USE_DISPLAY
    /* Check if we have the right amount of arguments. */
    if (argc < 2) {
        printf("lcdwrite: to few arguments!\n");
        printf("\tusage: <1-line-text> <2-line-text>\n");
        return 1;
    } else if (argc > 3) {
        printf("lcdwrite: to much arguments!\n");
        printf("\tusage: <1-line-text> <2-line-text>\n");
    }

    /* This is our lcd device. */
    lcd1602a_dev_t lcd;

    /* First we need to initialize the display. */
    _init_lcd(&lcd);

    /* Use first argument of shell input to display. */
    lcd1602a_write_buf(&lcd, argv[1]);

    if (argc == 3) {
        /* Put the cursor onto the second line. */
        lcd1602a_cursor_set(&lcd, 0, 1);

        /* Write the same on again to the display. */
        lcd1602a_write_buf(&lcd, argv[2]);
    }
#else
  (void)argc;
  (void)argv;
  printf("Attention: Display feature is disabled!\n");
#endif /* FEATURE_USE_DISPLAY */
    return 0;
}

int testcurrent_cmd(int argc, char **argv)
{
    /* We do not use any arguments here. */
    if (argc > 1) {
        printf("testcurrent: Note: arguments are not used in this command.\n");
    }

    /* These parameters are not used in this method. */
    //(void)argc;
    (void)argv;

    /* Stores the data and parameters used for measuring current. */
    ct_i_data_t data;
    ct_parameter_t param;

    /* Parameters used for analog-input-pin (adc). */
    // NOTE: This is already done in the main.
    //int line = 0;
    //adc_res_t res = ADC_RES_12BIT;
    int bit = 12;

    /* Timer parameters. */
    xtimer_ticks32_t last = xtimer_now();
    int delay = (1000LU * US_PER_MS); /*< 1 second. */

    /* Parameters based on a nucleo-f446re. */
    param.adc_count = 1 << bit;              /*< 4096 */
    param.adc_offset = param.adc_count >> 1; /*< 2048 */
    param.v_ref = 3.3;                       /*< 3.3V */
    param.r_burden = 110;                    /*< 110Ohm */
    param.turns = 2000;                      /*< turns on the magnet */
    param.samples = 32;                      /*< number of samples */

    /* Init the adc using riot abstraction layer. */
    // NOTE: This is already done in the main.
    // init_adc(line, res);

#if FEATURE_USE_DISPLAY
    /* LCD 1602A initializations using a nucleo-f446re board. */
    /* NOTE: Make sure the pins are working for your board! */
    lcd1602a_dev_t lcd;

    _init_lcd(&lcd);
#else
    printf("Attention: Display feature is disabled!\n");
#endif
    /* Measures the current using the parameters and stores the measurements
     * inside the data reference. Then sleep for 'DELAY' and loop this forever.
     */
    for (int i = 0; i < 5; i++) {
        ct_measure_current(&param, &data);

#if FEATURE_USE_DISPLAY
        // Convert the current into a char buffer.
        char current[8] = {' '};
        fmt_float(current, data.current, 2);

        // Convert the apparent into a char buffer.
        char apparent[8] = {' '};
        fmt_float(apparent, data.apparent, 2);

        // Use the LCD-API to write onto the display.
        //lcd1602a_cursor_reset(&lcd);
        lcd1602a_cursor_set(&lcd, 0, 0);
        lcd1602a_write_buf(&lcd, "Ampere: ");
        lcd1602a_write_buf(&lcd, current);
        lcd1602a_cursor_set(&lcd, 0, 1);
        lcd1602a_write_buf(&lcd, "Watt: ");
        lcd1602a_write_buf(&lcd, apparent);
#endif /* FEATURE_USE_DISPLAY */

        // Dump the current from the ct to the console.
        ct_dump_current(&data);

        // Sleep for a moment.
        xtimer_periodic_wakeup(&last, delay);
    }

    return 0;
}

/**
* Ein 'true' signalisiert, dass der Nutzen den "E-Stop"
* Button auf dem Messknoten gedrueckt hat und der
* Messknoten die Stromzufuhr gekappt hat.
 */
int estop_cmd(int argc, char **argv)
{
    if (argc < 2 || argc > 2) {
        printf("estop usage: estop [ on | off ]\n");
    }

    if (strcmp(argv[1], "on") == 0) {

    } else if (strcmp(argv[1], "off") == 0) {

    } else {
        printf("Usage: estop [ on | off ]\n");
        return 1;
    }

    return 0;
}

/**
* Signalisiert, dass der Nutzer den 'Manual-Modus am
* Messknoten aktiviert hat: d.h., dass der 'switch_state'
* keinen Einfluss mehr hat; Strom ist dauerhaft an.
* Dieser Manual-Mode kann vom Endnutzer genutzt werden um
* den switch_state zu ueberschreiben.
 */
int manual_cmd(int argc, char **argv)
{
    if (argc < 2 || argc > 2) {
        printf("Usage: manual [ on | off ]\n");
        return 1;
    }

    if (strcmp(argv[1], "on") == 0) {

    } else if (strcmp(argv[1], "off") == 0) {

    } else {
        printf("Usage: manual [ on | off ]\n");
        return 1;
    }

    return 0;
}
