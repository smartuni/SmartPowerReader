import {Component, OnInit, ViewChild} from '@angular/core';
import {GraphSummaryComponent} from '../components/graph-summary/graph-summary.component';
import {SensorService} from '../services/sensor.service';
import {Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {SensorsLoadedFailAction, SensorsLoadedSuccessAction, SensorsLoadingAction} from 'store/actions/sensors';

@Component({
    selector: 'app-homepage',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
    from: number;
    to: number;
    isLoading = true;

    @ViewChild(GraphSummaryComponent) graphSummaryComponent: GraphSummaryComponent;

    constructor(private sensorService: SensorService,
                private store: Store<fromRoot.State>) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.getAllSensors();
        }, 500);

    }

    onChangedValue(data) {
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
        // this.isLoading = true;
        this.store.dispatch(new SensorsLoadingAction());
        // const testData = [
        //     {
        //         id: 'test12',
        //         name: '345',
        //         period: 456,
        //         status: SensorStatus.CONNECTED
        //     },
        //     {
        //         id: 'thahah',
        //         name: 'hoho',
        //         period: 456,
        //         status: SensorStatus.DISCONNECTED
        //     }];
        // this.store.dispatch(new SensorsLoadedSuccessAction(testData));
        // this.isLoading = false;
        this.sensorService.getAllSenors().subscribe(sensorList => {
            this.store.dispatch(new SensorsLoadedSuccessAction(sensorList));
            // this.isLoading = false;
        }, error1 => {
            this.store.dispatch(new SensorsLoadedFailAction());
            // this.isLoading = false;
        });

    }

}
