import {SensorStatus} from '../enum/sensor-status.enum';

export interface Sensor {
    id: string;
    name: string;
    series?: any;
    status?: SensorStatus;
    features: SensorConfiguration;
}

interface SensorConfiguration {
    pwr_period?: number;
    switch_state?: boolean;
    esstop?: boolean;
    manual?: boolean;
}

