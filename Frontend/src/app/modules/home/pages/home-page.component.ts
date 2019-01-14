import {Component, OnInit, ViewChild} from '@angular/core';
import {GraphSummaryComponent} from '../components/graph-summary/graph-summary.component';
import {SensorService} from '../services/sensor.service';
import {select, Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {getAutoUpdate} from 'store/reducers';
import {SensorsLoadedFailAction, SensorsLoadedSuccessAction, SensorsLoadingAction} from 'store/actions/sensors';

import 'rxjs-compat/add/observable/interval';
import 'rxjs-compat/add/operator/takeWhile';
import * as moment from 'moment';

import 'moment/min/locales.min';
import {Observable, Subscription} from 'rxjs';

@Component({
    selector: 'app-homepage',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

    @ViewChild(GraphSummaryComponent) graphSummaryComponent: GraphSummaryComponent;
    subscription: Subscription;

    constructor(private sensorService: SensorService,
                private store: Store<fromRoot.State>) {

    }

    ngOnInit() {
        moment.locale('en');
        setTimeout(() => {
            this.getAllSensors();
        }, 500);
        this.store.pipe(select(getAutoUpdate)).subscribe(autoUpdate => {
            console.log(autoUpdate);
            if (autoUpdate) {
                setTimeout(() => {
                    this.getAllSensors();
                }, 500);
                this.subscription = Observable
                    .interval(1000)
                    .takeWhile(() => true)
                    .subscribe(() => {
                            console.log('123');
                            setTimeout(() => {
                                this.getAllSensors();
                            }, 500);
                        }
                    );

            } else {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                }
            }
        });
    }

    onChangedValue(data) {
        const from = this.convertToDate(data['startDate'], data['startTime']).valueOf();
        const to = this.convertToDate(data['endDate'], data['endTime']).valueOf();
        this.graphSummaryComponent.drawGraph(data.selectedDevices, from, to);
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
