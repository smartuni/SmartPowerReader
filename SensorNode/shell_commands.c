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

/**
 * Writes the first argument on the lcd.
 * Make sure to use the right pin configuration for your board!
 */
int lcd_write_cmd(int argc, char **argv)
{
    (void)argc;

    lcd1602a_dev_t lcd;
    lcd1602a_iface_t iface = MODE_4BIT;
    lcd1602a_dotsize_t dotsize = DOTSIZE_5x8;

    int PORT_A = 0;
    int PORT_B = 1;
    int PORT_C = 2;

    /* NOTE: Make sure the pins are working for your board! */
    /* Nucleo config */
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
    /* functions set in init */
    /* controls set in init */
    /* modes set in init */
    /* row_offset set in init */
    lcd.lines = 2;
    lcd.collumns = 16;

    lcd1602a_init(&lcd);

    printf("Try to write \"%s\" to the LCD\n", argv[1]);

    /* Use first argument of shell input to display. */
    lcd1602a_write_buf(&lcd, argv[1]);
    /* Put the cursor onto the second line. */
    lcd1602a_cursor_set(&lcd, 0, 1);
    /* Write the same on again to the display. */
    lcd1602a_write_buf(&lcd, argv[1]);

    return 0;
}

int testcurrent_cmd(int argc, char **argv)
{
    /* These parameters are not used in this method. */
    (void)argc;
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

    /* LCD 1602A initializations using a nucleo-f446re board. */
    /* NOTE: Make sure the pins are working for your board! */
    lcd1602a_dev_t lcd;
    lcd1602a_iface_t iface = MODE_4BIT;
    lcd1602a_dotsize_t dotsize = DOTSIZE_5x8;
    int PORT_A = 0;
    int PORT_B = 1;
    int PORT_C = 2;
    lcd.register_select_pin = GPIO_PIN(PORT_A, 9); // D8
    lcd.read_write_pin = GPIO_PIN(PORT_A, 8);      // D7
    lcd.enable_pin = GPIO_PIN(PORT_C, 7);          // D9
    lcd.data_pins[0] = 0; // Not used. We use a 4-Bit interface here.
    lcd.data_pins[1] = 0; // Not used.
    lcd.data_pins[2] = 0; // Not used.
    lcd.data_pins[3] = 0; // Not used.
    lcd.data_pins[4] = GPIO_PIN(PORT_B, 3); // D3
    lcd.data_pins[5] = GPIO_PIN(PORT_B, 5); //D4
    lcd.data_pins[6] = GPIO_PIN(PORT_B, 4); // D5
    lcd.data_pins[7] = GPIO_PIN(PORT_B, 10); // D6
    lcd.iface = iface;
    lcd.dotsize = dotsize;
    /* functions set in init */
    /* controls set in init */
    /* modes set in init */
    /* row_offset set in init */
    lcd.lines = 2;
    lcd.collumns = 16;

    lcd1602a_init(&lcd);

    /* Measures the current using the parameters and stores the measurements
     * inside the data reference. Then sleep for 'DELAY' and loop this forever.
     */
    for (int i = 0; i < 5; i++) {
        ct_measure_current(&param, &data);

        // Convert the current into a char buffer.
        char current[8] = {' '};
        fmt_float(current, data.current, 2);

        // Convert the apparent into a char buffer.
        char apparent[8] = {' '};
        fmt_float(apparent, data.apparent, 2);

        // Use the LCD-API to write onto the display.
        lcd1602a_cursor_reset(&lcd);
        lcd1602a_write_buf(&lcd, "Ampere: ");
        lcd1602a_write_buf(&lcd, current);
        lcd1602a_cursor_set(&lcd, 0, 1);
        lcd1602a_write_buf(&lcd, "Watt: ");
        lcd1602a_write_buf(&lcd, apparent);

        // Dump the current from the ct to the console.
        ct_dump_current(&data);

        // Sleep for a moment.
        xtimer_periodic_wakeup(&last, delay);
    }

    return 0;
}
