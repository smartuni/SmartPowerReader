import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SensorService {

    constructor(private httpClient: HttpClient) {
    }


    getData(params: any) {
        return this.httpClient.post(`${environment.serverUrl}`, params);
    }

    getDataFromServer(server: string, params: any) {
        return this.httpClient.get(`${server}`, {params: params});
    }

}
