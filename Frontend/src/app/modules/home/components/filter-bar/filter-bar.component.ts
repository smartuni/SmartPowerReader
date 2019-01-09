import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {formatDate} from '@angular/common';
import {Sensor} from 'core/interfaces/sensor.interface';
import {ModalService} from '../../../../shared/services/modal.service';
import {EditComponent} from '../edit/edit.component';
import {select, Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {getAutoUpdate, isCurrentTime} from 'store/reducers';
import {SelectSensorsAction, UpdateSensorsAction} from 'store/actions/sensors';
import {TimeSelectorComponent} from '../time-selector/time-selector.component';
import * as moment from 'moment';
import {DurationInputArg2} from 'moment';
import {SelectCurrentPeriodAction} from 'store/actions/filter';
import {Observable, Subscription} from 'rxjs';
import {GraphPeriodAction} from 'store/actions/graph';


@Component({
    selector: 'app-filter-bar',
    templateUrl: './filter-bar.component.html',
    styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {
    form: FormGroup;
    sensors: Sensor[] = [];
    @Output() onChangedValue = new EventEmitter();
    isLoading: boolean;

    isFormValid: boolean;

    selectedDevices = [];
    supportedType = [
        {
            name: 'Second',
            type: 'seconds'
        },
        {
            name: 'Minute',
            type: 'minutes'
        },
        {
            name: 'Hour',
            type: 'hours'
        },
        {
            name: 'Day',
            type: 'days'
        },
        {
            name: 'Week',
            type: 'weeks'
        },
        {
            name: 'Month',
            type: 'months'
        },
        {
            name: 'Year',
            type: 'years'
        }
    ];
    subscriptionSelectCurrent: Subscription;
    subscriptionUpdateEndTime: Subscription;


    constructor(private modalService: ModalService,
                private store: Store<fromRoot.State>) {
    }

    ngOnInit() {

        this.isLoading = true;

        const now = moment().toDate();
        const today = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };

        this.form = new FormGroup({
                startDate: new FormControl(today),
                endDate: new FormControl(today),
                startTime: new FormControl('00:00:00'),
                endTime: new FormControl('23:59:59')
            }
        );
        this.updateEndTime();


        const raw = this.form.getRawValue();
        let startTime = this.combineToDate(raw.startDate, raw.startTime);
        let endTime = this.combineToDate(raw.endDate, raw.endTime);
        this.store.dispatch(new GraphPeriodAction(endTime.valueOf()));
        this.isFormValid = startTime.valueOf() < endTime.valueOf();

        this.checkCurrent(startTime, endTime);


        this.store.pipe(select(fromRoot.getSensors)).subscribe(sensors => {
            this.sensors = sensors;
            this.isLoading = false;
        });
        this.store.pipe(select(getAutoUpdate)).subscribe(autoUpdate => {
            if (autoUpdate) {

                this.subscriptionSelectCurrent = this.store.pipe(select(isCurrentTime)).subscribe(selectedCurrent => {
                    if (selectedCurrent) {
                        this.subscriptionUpdateEndTime = Observable
                            .interval(1000)
                            .takeWhile(() => true)
                            .subscribe(() => {
                                    this.updateEndTime();
                                }
                            );
                    } else {
                        if (this.subscriptionUpdateEndTime) {
                            this.subscriptionUpdateEndTime.unsubscribe();
                        }
                    }
                });
            } else {
                this.unsubscribeAll();
            }
        });

        this.form.valueChanges.subscribe(data => {
            const rawValue = this.form.getRawValue();
            startTime = this.combineToDate(rawValue.startDate, rawValue.startTime);
            endTime = this.combineToDate(rawValue.endDate, rawValue.endTime);
            this.store.dispatch(new GraphPeriodAction(endTime.valueOf()));

            this.checkCurrent(startTime, endTime);
        });

    }

    onSubmit() {
        const rawValue = this.form.getRawValue();
        rawValue['selectedDevices'] = this.selectedDevices;
        this.onChangedValue.emit(
            rawValue
        );
    }

    editDevice() {
        this.modalService.init(EditComponent, {sensors: this.sensors}, {
            onUpdated: (editedSensor: Sensor) => {
                const index = this.sensors.findIndex(sensor => sensor.id === editedSensor.id);
                this.sensors[index] = editedSensor;
                this.store.dispatch(new UpdateSensorsAction(this.sensors));
                this.modalService.destroy();
            },
            onClosed: () => {
                this.modalService.destroy();
            }
        });
    }

    private convertDateToHashMap(date) {
        const dateString = formatDate(date, 'yyyy-MM-dd', 'en');
        const dateArr = dateString.split('-');
        return {
            year: +dateArr[0],
            month: +dateArr[1],
            day: +dateArr[2]
        };
    }

    private combineToDate(dateHashMap: any, time: string) {
        return new Date(dateHashMap.year, dateHashMap.month - 1, dateHashMap.day,
            +time.substr(0, 2), +time.substr(3, 2), +time.substr(6, 2));
    }

    activeHover(className) {
    }


    change(event) {
        const device = event.source.value as Sensor;
        if (event.isUserInput) {
            if (event.source.selected) {
                this.selectedDevices.push([device.id, device.name]);

            } else {
                const index = this.selectedDevices.findIndex(item => device.id === item[0]);
                this.selectedDevices.splice(index, 1);
            }
        }
        this.store.dispatch(new SelectSensorsAction(this.selectedDevices));
    }

    selectLast() {
        this.modalService.init(TimeSelectorComponent, {supportedType: this.supportedType}, {
            onUpdated: (rawValue) => {
                this.analyseTime(rawValue.time, rawValue.type);
                this.modalService.destroy();
            },
            onClosed: () => {
                this.modalService.destroy();
            }
        });
    }

    private analyseTime(time: number, type: DurationInputArg2) {

        const fromDate = moment().subtract(time, type).startOf(type === 'weeks' ? 'isoWeeks' : type);
        let toDate = moment().subtract(1, type).endOf(type === 'weeks' ? 'isoWeeks' : type);
        if (time === 0) {
            this.store.dispatch(new SelectCurrentPeriodAction(true));
            toDate = moment();
        } else {
            this.store.dispatch(new SelectCurrentPeriodAction(false));
        }
        if (type !== 'seconds' && type !== 'minutes' && type !== 'hours') {
            const startDate = this.convertDateToHashMap(fromDate.toDate());
            const endDate = this.convertDateToHashMap(toDate.toDate());
            this.form.controls['startDate'].setValue(startDate);
            this.form.controls['endDate'].setValue(endDate);
            this.form.controls['startTime'].setValue('00:00:00');
            if (time !== 0) {
                this.form.controls['endTime'].setValue('23:59:59');
            } else {
                this.updateEndTime();
            }
        } else {
            toDate = fromDate.clone().add(time - 1, type).endOf(type);
            this.form.controls['startTime'].setValue(this.handleTime(fromDate.toDate()));
            this.form.controls['endTime'].setValue(this.handleTime(toDate.toDate()));

        }
    }

    private updateEndTime() {
        const toDate = moment();
        this.form.controls['endTime'].setValue(this.handleTime(toDate.toDate()));
    }

    private convertToTwoNumber(num: number) {
        return num < 10 ? '0' + num : num;
    }

    private handleTime(date: Date) {
        return this.convertToTwoNumber(date.getHours()) + ':' + this.convertToTwoNumber(date.getMinutes()) + ':' + this.convertToTwoNumber(date.getSeconds());
    }

    private unsubscribeAll() {
        if (this.subscriptionUpdateEndTime) {
            this.subscriptionUpdateEndTime.unsubscribe();
        }
        if (this.subscriptionSelectCurrent) {
            this.subscriptionSelectCurrent.unsubscribe();
        }

    }

    private checkCurrent(startTime: Date, endTime: Date) {
        this.isFormValid = startTime.valueOf() < endTime.valueOf();
        const now = new Date();
        if (this.isFormValid && now.valueOf() - endTime.valueOf() < 300000) {
            this.store.dispatch(new SelectCurrentPeriodAction(true));
        } else {
            this.store.dispatch(new SelectCurrentPeriodAction(false));
        }
    }

    compareFn(sensor1: Sensor, sensor2: Sensor) {
        return sensor1 && sensor2 ? sensor1.id === sensor2.id : sensor1 === sensor2;
    }


}
