import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import net from 'net-socket';

@Injectable({
    providedIn: 'root'
})
export class SensorService {
    socket: net.Socket;
    constructor(private httpClient: HttpClient) {
    }


    getDatada(host: string, port: number, params: any) {
        this.socket.connect(port, host, () => {
            this.socket.write(params);
        });
        // const headers = {
        //     'Content-Type': 'application/json',
        //     'Accept': '*.*'
        // };
        // return this.httpClient.post(server, params, {headers: headers});
    }


    // return this.httpClient.put(server, params;


}
