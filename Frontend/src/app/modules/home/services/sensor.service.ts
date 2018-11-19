import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {Sensor} from '../../../core/interfaces/sensor.interface';

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
        return this.httpClient.get<Sensor[]>(`${environment.sensorUrl}`);
    }

    updateSensors(body: any): Observable<Object> {
        return this.httpClient.put<Object>(`${environment.sensorUrl}`, body);
    }


}
