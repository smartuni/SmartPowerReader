/*
 * @file      ct_sensor.h
 * @author    Rene Herthel <rene.herthel@haw-hamburg.de>
 */

#ifndef CT_SENSOR_H
#define CT_SENSOR_H

#ifdef __cplusplus
extern "C" {
#endif

/*
 * @brief     Contains all needed parameters for measuring current.
 */
typedef struct {
    unsigned adc_count;    /*< The maximum counts of the adc */
    unsigned adc_offset;   /*< The offset of the adc (default adc_counts >> 1)*/
    unsigned r_burden;     /*< The burden resistor [Ohm] */
    unsigned turns;        /*< The wire turns of the ct-sensor */
    unsigned samples;      /*< The number of samples for RMS */
    float v_ref;           /*< The reference voltage */
} ct_parameter_t;

/*
 * @brief     Contains all data filled with current measurement.
 */
typedef struct {
    float current;         /*< Root-Mean-Squared-Current or I_RMS [A]*/
    float apparent;        /*< Apparent-Power in Volt-Ampere [VA] */
} ct_i_data_t;

/*
 * @brief    Initialize an adc-pin using the riot abstractions.
 *
 * @param    [line]    The Analog input line
 * @param    [res]     The resolution of the adc
 */
void init_adc(int line, adc_res_t res);

/*
 * @brief    Dump the measured current data to the terminal.
 *
 * @param    [data]    The measured data
 */
void ct_dump_current(ct_i_data_t * data);

/*
 * @brief    Measures the current using parameters and a data reference.
 *
 * @param    [param]   The parameters used for measuring
 * @param    [data]    A reference to the current data structure
 */
void ct_measure_current(ct_parameter_t * param, ct_i_data_t * data);

#ifdef __cplusplus
}
#endif

#endif /* CT_SENSOR_H */
