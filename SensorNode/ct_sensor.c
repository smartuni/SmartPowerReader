/*
 * @file ct_sensor.c
 * @author Rene Herthel <rene.herthel@haw-hamburg.de>
 */

/*
 * @description    Example calculations:
 *
 *                 Primary (CT-Sensor):
 *                 - I_p = 0 - 30A
 *                 - Turns = 2000
 *
 *                 Secondary (Burden resistor):
 *                 - V_pp = 3.3V
 *                 - I_s = I_p / Turns = 30A / 2000 = 0.015A = 15mA
 *                 - V_s = V_pp / 2 = 3.3V / 2 = 1.65V
 *                 - R_s = V_s / I_s = 1.65V / 0.015A = 110Ohm
 *
 *                 ADC (STM32F446RE):
 *                 - adc_res = 12bit
 *                 - adc_count = 1 << adc_res = 4096
 *                 - adc_offset = adc_count >> 1 = 4096 >> 1 = 2048
 *
 *                 Secondary voltage:
 *                 - e.g.: adc_sample = 4096 or 2048 or 0
 *
 *                 - adc_sample = adc_sample - adc_offset
 *
 *                 - V_s = (V_pp / adc_count) * adc_sample
 *                   -> (3.3V / 4096) *  2048 =  1.65V
 *                   -> (3.3V / 4096) *     0 =  0.00V
 *                   -> (3.3V / 4096) * -2048 = -1.65V
 *
 *                 Secondary current:
 *                 - I_s = V_s / R_s
 *                   ->  1.65V / 110Ohm =  0.015A =  15mA
 *                   ->  0.00V / 110Ohm =  0.000A =  0mA
 *                   -> -1.65V / 110Ohm = -0.015A = -15mA
 *
 *                 Primary Current:
 *                 - I_p = I_s * turns
 *                   ->  0.015A * 2000 =  30A
 *                   ->  0.000A * 2000 =   0A
 *                   -> -0.015A * 2000 = -30A
 *
 *                 Root-Mean-Square:
 *                 - e.g. samples = 1000
 *                 - I_mean_square = (1 / samples) * sum_of_primary_current
 *                 - I_root_mean_square = sqrt(MS)
 *                 - I_RMS between 0A and 30A!
 *
 *                 Apparent-Power:
 *                 - Assumption: V_RMS = 230V
 *                 - apparent = V_RMS * I_RMS
 *                   -> 230V * 30A = 6900W = 6.90kW
 *                   -> 230V * 15A = 3450W = 3.45kW
 *                   -> 230V *  0A =    0W = 0.00kW
 *
 *                 V_RMS & Real-Power & Power-Factor are not supported atm!
 */

#include <stdio.h>
#include <math.h>

#include "periph/adc.h"
#include "measuring/ct_sensor.h"
#include "fmt.h"

#define DEBUG_SAMPLING          (0)
#define DEBUG_CURRENT_PRIMARY   (1)
#define DEBUG_CURRENT_SECONDARY (0)

#define FLOAT_PRECISION         (2)
#define FMT_BUF_SIZE            (16)

/* ADC Parameters */
adc_res_t adc_res = ADC_RES_10BIT;
unsigned adc_line = 0;

/* Used to counts measurements */
int counter = 0;

#define V_RMS 230

/*
 * @brief    Prints float numbers (some boards does not provide it..).
 */
static inline void _print_float(float f, unsigned precision, char * msg)
{
    char buf[FMT_BUF_SIZE] = {""};
    fmt_float(buf, f, precision);
    printf("%s", msg); /*< Splitting printf functions prevents 'grambling' */
    printf("%s", buf);
    printf("\n");
}

/*
 * @brief    Read the adc and calculate the voltage.
 */
static inline float _voltage(ct_parameter_t * param)
{
    float voltage = 0;
    int sample = 0;

    /* Read a sample from the initialized adc pin. */
    sample = adc_sample(ADC_LINE(adc_line), adc_res);

    /* Remove the offset from the sample, so can calc with negative numbers. */
    sample = sample - param->adc_offset;

    if (sample < 4 && sample > -4) {
        sample = 0;
    }

    /* Convert the sample (adc-counts) into a value of voltage. */
    voltage = (param->v_ref / param->adc_count) * sample;

#if DEBUG_SAMPLING
    printf("sample: %i\n", sample);
    _print_float(voltage, FLOAT_PRECISION, "voltage: ");
    printf("- - -\n\n");
#endif /* DEBUG_SAMPLING */

    return voltage;
}

void init_adc(int line, adc_res_t res)
{
    /* Just initialize and lazy check for errors. */
    if (adc_init(ADC_LINE(line)) < 0) {
        printf("adc init failed on line %i\n", adc_line);
    }

    /* Just read a test sample and lazy check for errors. */
    if (adc_sample(ADC_LINE(line), res) < 0) {
        printf("ADC test sample failed on line %i\n", adc_line);
    }

    adc_line = line;
    adc_res = res;
}

void ct_dump_current(ct_i_data_t * data)
{
    printf("\n------------------------\n"
           "Measurement No. %i\n"
           "------------------------\n", counter);
    _print_float(data->current, FLOAT_PRECISION, "Current:\t");
    _print_float(data->apparent, FLOAT_PRECISION, "Apparent:\t");
    printf("------------------------\n\n");
}

void ct_measure_current(ct_parameter_t * param, ct_i_data_t * data)
{
    float i_acc = 0;
    int resistance = param->r_burden;
    int turns = param->turns;
    int samples = param->samples;

    /* Calculate and sum up the square of the current over n-samples. */
    for (int i = 0; i < samples; i++) {

        /* Calculate the instaneous voltage. */
        float voltage = _voltage(param);

        /* Calculate the current of the burden resistor. */
        float i_secondary = voltage / resistance;

        /* Calculate the current of the consumer (load).
         * Multiply the current of the burden resistor with the turns of the ct.
         * Then we need to calculate the square to avoid negative numbers.
         * Then accumulate the result to calculate later the root-mean-square.
         */
        float i_primary = i_secondary * turns;
        float i_primary_square = i_primary * i_primary;
        i_acc += i_primary_square;

#if DEBUG_CURRENT_PRIMARY
        /* Needed to see the 'sinus-curve as values for primary current' */
        _print_float(i_primary, FLOAT_PRECISION, "f(i)/A = ");
#elif DEBUG_CURRENT_SECONDARY
        /* Needed to see the 'sinus-curve as values for secondary current' */
        _print_float(i_secondary, 5, "f(i)/mA = ");
#endif

    }

    /* For current calculations, we can only measure current and therefore
     * we have to assume that the root mean square of the voltage is 230 Volts.
     * Otherwise, we need something to measure voltage.
     */
    // V_RMS = 230 by default.

    /* Calculates first the mean-square value and then the root-mean-square of
     * the current. Then we can calculate the apparent-power.
     */
    float i_mean_square = i_acc / samples;
    float i_root_mean_square = sqrt(i_mean_square);
    data->current = i_root_mean_square;
    data->apparent = V_RMS * i_root_mean_square;

    /* Increments the measuring counter. */
    counter++;
}
