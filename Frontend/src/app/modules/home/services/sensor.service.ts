import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Sensor} from '../../../core/interfaces/sensor.interface';
import {MockHttpApi} from '../../../core/mocks/mockHttpApi';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor() {
  }

  getAllSensorsData(): Observable<Sensor[]> {
    return of(MockHttpApi.getSensors());
  }
}
