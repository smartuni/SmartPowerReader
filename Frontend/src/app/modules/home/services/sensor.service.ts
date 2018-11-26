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
    host: string;
    url: string;

    constructor(private httpClient: HttpClient) {
        const url = window.location.href;
        this.host = url.split(/http:\/\/|:/)[1];
        this.url = 'http://' + this.host + ':3000';
    }

    getData(params: any): Observable<any> {
        return this.httpClient.get<Sensor[]>(`${this.url}/devices`, {params: params});
    }

    getAllSenors(): Observable<Sensor[]> {
        const params = {
            action: GET_SENSORS
        };
        return this.httpClient.get<Sensor[]>(`${this.url}`, {params: params});
    }

    updateSensors(body: any): Observable<Object> {
        const params = {
            action: UPDATE_SENSORS
        };
        return this.httpClient.put<Object>(`${this.url}`, body, {params: params});
    }


}
