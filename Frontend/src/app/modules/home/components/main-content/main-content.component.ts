import {Component, OnInit, ViewChild} from '@angular/core';
import {GraphSummaryComponent} from './graph-summary/graph-summary.component';

@Component({
    selector: 'app-main-content',
    templateUrl: './main-content.component.html',
    styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {
    sensorId: string[];
    from: number;
    to: number;

    @ViewChild(GraphSummaryComponent) graphSummaryComponent: GraphSummaryComponent;

    constructor() {
    }

    ngOnInit() {

    }

    onChangedValue(data) {
        console.log('from', this.convertToDate(data['startDate'], data['startTime']));
        console.log('end', this.convertToDate(data['endDate'], data['endTime']));

        this.from = this.convertToDate(data['startDate'], data['startTime']).valueOf();
        this.to = this.convertToDate(data['endDate'], data['endTime']).valueOf();
        this.graphSummaryComponent.drawGraph(null, this.from, this.to);
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

}
