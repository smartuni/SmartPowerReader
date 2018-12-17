import {SensorStatus} from '../enum/sensor-status.enum';

export interface Sensor {
    id: string;
    name: string;
    series?: any;
    status?: SensorStatus;
    data: SensorConfiguration;
}

interface SensorConfiguration {
    PWR_PERIOD?: number;
    SWITCH_STATE?: boolean;
    ESTOP?: boolean;
    MANUAL?: boolean;
}

