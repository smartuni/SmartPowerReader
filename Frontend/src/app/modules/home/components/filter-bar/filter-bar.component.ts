import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {formatDate} from '@angular/common';
import {addDays, addMonths, Day, firstDayInWeek, firstDayOfMonth, lastDayOfMonth} from '@progress/kendo-date-math';
import {Sensor} from 'core/interfaces/sensor.interface';
import {ModalService} from '../../../../shared/services/modal.service';
import {EditComponent} from '../edit/edit.component';
import {select, Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {UpdateSensorsSAction} from 'store/actions/sensors';


@Component({
    selector: 'app-filter-bar',
    templateUrl: './filter-bar.component.html',
    styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {
    form: FormGroup;
    sensors: Sensor[];
    @Output() onChangedValue = new EventEmitter();
    isLoading: boolean;

    startTime: Date;
    endTime: Date;
    isFormValid: boolean;
    now: string;

    selectedDevices = [];

    constructor(private modalService: ModalService,
                private store: Store<fromRoot.State>) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.now = formatDate(new Date(), 'yyyy-MM-dd', 'en');
        const todayArr = this.now.split('-');
        const today = {
            year: +todayArr[0],
            month: +todayArr[1],
            day: +todayArr[2]
        };
        this.form = new FormGroup({
                startDate: new FormControl(today),
                endDate: new FormControl(today),
                startTime: new FormControl('00:00'),
                endTime: new FormControl('23:59')
            }
        );

        const raw = this.form.getRawValue();
        this.startTime = this.combineToDate(raw.startDate, raw.startTime);
        this.endTime = this.combineToDate(raw.endDate, raw.endTime);
        this.isFormValid = this.startTime < this.endTime;

        setTimeout(() => {
            this.store.pipe(select(fromRoot.getSensors)).subscribe(sensors => {
                this.sensors = sensors;
                this.isLoading = false;
            });
        }, 500);


        this.form.valueChanges.subscribe(data => {
            const rawValue = this.form.getRawValue();
            this.startTime = this.combineToDate(rawValue.startDate, rawValue.startTime);
            this.endTime = this.combineToDate(rawValue.endDate, rawValue.endTime);
            this.isFormValid = this.startTime < this.endTime;
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
            onClosed: (editedSensor: Sensor) => {
                const index = this.sensors.findIndex(sensor => sensor.id === editedSensor.id);
                this.sensors[index] = editedSensor;
                this.store.dispatch(new UpdateSensorsSAction(this.sensors));
                this.modalService.destroy();
            }
        });
    }

    selectDate(offset: number = 0) {
        const date = this.convertDateToHashMap(addDays(new Date(), offset));
        this.form.controls['startDate'].setValue(date);
        this.form.controls['endDate'].setValue(date);
    }

    selectWeek(from: number = 0, to: number = 0) {
        const fromWeek = firstDayInWeek(addDays(new Date(), from), Day.Monday);
        const toWeek = addDays(firstDayInWeek(addDays(new Date(), to), Day.Monday), 6);
        const startDate = this.convertDateToHashMap(fromWeek);
        const endDate = this.convertDateToHashMap(toWeek);
        this.form.controls['startDate'].setValue(startDate);
        this.form.controls['endDate'].setValue(endDate);
    }

    selectMonth(from: number = 0, to: number = 0) {
        const fromMonth = addMonths(new Date(), from);
        const toMonth = addMonths(new Date(), to);
        const startDate = this.convertDateToHashMap(firstDayOfMonth(fromMonth));
        const endDate = this.convertDateToHashMap(lastDayOfMonth(toMonth));
        this.form.controls['startDate'].setValue(startDate);
        this.form.controls['endDate'].setValue(endDate);
    }

    selectYear(num: number = 0) {
        const year = new Date().getFullYear() + num;
        const startYear = this.convertDateToHashMap(new Date(year, 0, 1));
        const endYear = this.convertDateToHashMap(new Date(year, 11, 31));
        this.form.controls['startDate'].setValue(startYear);
        this.form.controls['endDate'].setValue(endYear);
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
        const date = new Date(dateHashMap.year, dateHashMap.month - 1, dateHashMap.day,
            +time.substr(0, 2), +time.substr(3, 2));
        return date;
    }

    activeHover(className) {
        console.log(document.getElementsByClassName('input-group ' + className).item(0));
    }


    change(event) {
        const device = event.source.value as Sensor;
        if (event.isUserInput) {
            if (event.source.selected)
                this.selectedDevices.push([device.id, device.name]);
            else {
                const index = this.selectedDevices.findIndex(item => device.id === item[0]);
                this.selectedDevices.splice(index, 1);
            }
        }
    }

}
