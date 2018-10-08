import {Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';
import {Folder} from '../../../../../core/interfaces/folder.interface';
import {formatDate} from '@angular/common';
import {addDays, addMonths, Day, firstDayInWeek, firstDayOfMonth, lastDayOfMonth} from '@progress/kendo-date-math';


@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit {
  form: FormGroup;
  @Input() folder: Folder;
  isLoading: boolean;
  deviceList: string[] = [];

  startTime: Date;
  endTime: Date;
  isFormValid: boolean;
  now: string;

  constructor() {
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
    console.log('today', today);
    this.form = new FormGroup({
        startDate: new FormControl(today),
        endDate: new FormControl(today),
        selectedDevice: new FormControl(''),
        startTime: new FormControl('00:00'),
        endTime: new FormControl('23:59')
      }
    );
    this.deviceList.push('Parent');
    this.deviceList.push('child1');
    this.deviceList.push('child2');
    this.deviceList.push('child3');
    this.form.controls['selectedDevice'].setValue(this.deviceList[0], {onlySelf: true});

    const raw = this.form.getRawValue();
    this.startTime = this.combineToDate(raw.startDate, raw.startTime);
    this.endTime = this.combineToDate(raw.endDate, raw.endTime);
    this.isFormValid = this.startTime < this.endTime;

    this.isLoading = false;
    this.form.valueChanges.subscribe( data => {
      const rawValue = this.form.getRawValue();
      this.startTime = this.combineToDate(rawValue.startDate, rawValue.startTime);
      this.endTime = this.combineToDate(rawValue.endDate, rawValue.endTime);
      this.isFormValid = this.startTime < this.endTime;
    });
  }

  onSubmit() {

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

}
