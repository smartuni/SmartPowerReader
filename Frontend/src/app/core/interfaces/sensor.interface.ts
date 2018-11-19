import {SensorStatus} from '../enum/sensor-status.enum';

export interface Sensor {
  id: string;
  name: string;
  period?: number;
  series?: any;
  status?: SensorStatus;
}

