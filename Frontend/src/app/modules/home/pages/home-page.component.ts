import {Component, OnInit, ViewChild} from '@angular/core';
import {Sensor} from '../../../core/interfaces/sensor.interface';
import {GraphSummaryComponent} from '../components/graph-summary/graph-summary.component';
import {SensorService} from '../services/sensor.service';

@Component({
    selector: 'app-homepage',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
    sensors: Sensor[];
    from: number;
    to: number;
    isLoading = true;

    @ViewChild(GraphSummaryComponent) graphSummaryComponent: GraphSummaryComponent;

    constructor(private sensorService: SensorService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.getAllSensors();

    }

    onChangedValue(data) {
        console.log(data);
        this.from = this.convertToDate(data['startDate'], data['startTime']).valueOf();
        this.to = this.convertToDate(data['endDate'], data['endTime']).valueOf();
        this.graphSummaryComponent.drawGraph(data.selectedDevices, this.from, this.to);
    }

    private convertToDate(date, time) {
        const year = date.year;
        const month = date.month;
        const day = date.day;
        const timeArr = time.split(':');
        const hour = +timeArr[0];
        const minute = +timeArr[1];
        return new Date(year, month - 1, day, hour, minute);
    }

    private getAllSensors() {
        this.sensorService.getAllSenors().subscribe(res => {
            this.sensors = res;
        });
        this.isLoading = false;

    }

}
