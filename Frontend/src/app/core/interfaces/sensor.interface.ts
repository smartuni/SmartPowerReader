import {SensorStatus} from '../enum/sensor-status.enum';

export interface Sensor {
    id: string;
    name: string;
    series?: any[];
    status?: SensorStatus;
    data: any;
}

// interface SensorConfiguration {
//     PWR_PERIOD?: number;
//     SWITCH_STATE?: boolean;
//     ESTOP?: boolean;
//     MANUAL?: boolean;
// }

interface SensorConfiguration {
    pwr_period?: number;
    switch_state?: boolean;
    estop?: boolean;
    manual?: boolean;
}

