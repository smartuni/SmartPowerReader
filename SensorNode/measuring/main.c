/*
 * @file      main.c
 * @author    René Herthel <rene.herthel@haw-hamburg.de>
 * @brief     Example application to print measured data to the console.
 */

#include <stdio.h>

#include "xtimer.h"
#include "timex.h"
#include "periph/adc.h"
#include "ct_sensor.h"

/* e.g.: 1000 == 1 second */
#define DELAY (1000LU * US_PER_MS)

int main(void)
{
    /* Data structures holding data & parameters needed for measurement */
    ct_i_data_t data;
    ct_parameter_t param;
    xtimer_ticks32_t last = xtimer_now();

    /* Some ADC parameters */
    int line = 0;
    int bit = 12;
    adc_res_t res = ADC_RES_12BIT; // Arduino uses 10 Bit.

    /* Parameters needed for accurate measurement */
    param.adc_count = 1 << bit;              // e.g.: 1 << 12 = 4096
    param.adc_offset = param.adc_count >> 1; // e.g.: 4096 >> 1 = 2048
    param.v_ref = 3.3;
    param.r_burden = 110;
    param.turns = 2000;
    param.samples = 20; // The number of iterations of the for-loop.

    /* Init the adc using riot abstraction layer. */
    init_adc(line, res);

    /* Measures the current using the parameters and stores the measurements
     * inside the data reference. Then sleep for 'DELAY' and loop this forever.
     */
    while (1) {
        ct_measure_current(&param, &data);

        /* This could be a place to access the data */
        // ...

        ct_dump_current(&data);
        xtimer_periodic_wakeup(&last, DELAY);
    }

    /* Should never be reached. */
    return 0;
}
