import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Sensor} from '../../../core/interfaces/sensor.interface';
import {MockHttpApi} from '../../../core/mocks/mockHttpApi';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor(private httpClient: HttpClient) {
  }

  getAllSensorsData(server: string, params: any) {
    console.log('prams', params);
    return this.httpClient.get<Sensor[]>(server, params);
  }

  getAllSensors(server: string): Observable<Sensor[]> {
    return this.httpClient.get<Sensor[]>(server);
  }
}
