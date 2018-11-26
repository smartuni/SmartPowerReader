import {Component, OnInit, ViewChild} from '@angular/core';
import {GraphSummaryComponent} from '../components/graph-summary/graph-summary.component';
import {SensorService} from '../services/sensor.service';
import {Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {SensorsLoadedFailAction, SensorsLoadedSuccessAction, SensorsLoadingAction} from 'store/actions/sensors';
import {interval} from 'rxjs';
import {flatMap} from 'tslint/lib/utils';
import {tap} from 'rxjs/internal/operators';
import {Router} from '@angular/router';
import { Location } from '@angular/common';

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
        // interval(60 * 60 * 1000)
        //     .pipe(
        //         tap(() => {
                    setTimeout(() => {
                        this.getAllSensors();
                    }, 500);
                // })
            // )
            // .subscribe();


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
        this.store.dispatch(new SensorsLoadingAction());
        this.sensorService.getAllSenors().subscribe(sensorList => {
            this.store.dispatch(new SensorsLoadedSuccessAction(sensorList));
        }, error1 => {
            this.store.dispatch(new SensorsLoadedFailAction());
        });

    }

}
