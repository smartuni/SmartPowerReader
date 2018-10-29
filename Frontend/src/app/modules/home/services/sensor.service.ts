import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SensorService {

    constructor(private httpClient: HttpClient) {
    }


    getDatada(params: any) {
        return this.httpClient.post(`${environment.serverUrl}`, params);
    }

}
