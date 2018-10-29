import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SensorService {

    constructor(private httpClient: HttpClient) {
    }


    getData(params: any) : Observable<Object[]>{
        return this.httpClient.get<Object[]>(`${environment.sensorUrl}/${params.id}`, {params: params});
    }

    getDataFromServer(server: string, params: any) {
    }

}
