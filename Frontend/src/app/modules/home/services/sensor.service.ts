import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Sensor} from 'core/interfaces/sensor.interface';
import {GET_SENSORS, UPDATE_SENSORS} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class SensorService {

    constructor(private httpClient: HttpClient) {
    }

    getData(params: any): Observable<any> {
        return this.httpClient.get<Sensor[]>(`${environment.sensorUrl}/devices`, {params: params});
    }

    getAllSenors(): Observable<Sensor[]> {
        const params =  {
            action: GET_SENSORS
        };
        return this.httpClient.get<Sensor[]>(`${environment.sensorUrl}`, {params: params});
    }

    updateSensors(body: any): Observable<Object> {
        const params =  {
            action: UPDATE_SENSORS
        };
        return this.httpClient.put<Object>(`${environment.sensorUrl}`, body, {params: params});
    }


}
