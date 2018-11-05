import {AfterViewInit, Component, OnInit} from '@angular/core';
import {SensorService} from '../../../services/sensor.service';
import {Sensor} from '../../../../../core/interfaces/sensor.interface';
import {formatDate} from '@angular/common';
import {actionGetMeasurement} from '../../../constants/constants';

@Component({
    selector: 'app-graph-summary',
    templateUrl: './graph-summary.component.html',
    styleUrls: ['./graph-summary.component.scss']
})
export class GraphSummaryComponent implements OnInit, AfterViewInit {
    results: Sensor[] = [];
    isLoading = true;

    showXAxis = true;
    showYAxis = true;
    showLegend = true;
    showXAxisLabel = true;
    xAxisLabel = 'Number';
    showYAxisLabel = true;
    yAxisLabel = 'Color Value';
    roundDomains = true;
    autoScale = true;
    ticks = [];
    indexTicks = [];
    simpleTicks = [];
    isLessThan3Days = false;

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    };
    constructor(private sensorService: SensorService) {
    }

    ngOnInit() {
    }

    drawGraph(selectedDeviceId, from: number, to: number) {
        this.isLoading = true;
        this.isLessThan3Days = false;
        // console.log('selectedDeviceId', selectedDeviceId, from, to);
        const params = {
            action: actionGetMeasurement,
            id: selectedDeviceId ? selectedDeviceId : 'test-123',
            from: from,
            to: to,
            count: 100
        };
        this.sensorService.getData(params).subscribe((res) => {
            this.results = [];
            // console.log('response from server', res);
            this.results.push({
                id: params.id,
                name: params.id,
                series: res
            });
            this.results.forEach(result => {
                result.series = result.series.map(s => ({
                    name: s.timestamp,
                    value: s.value
                }));
                result.series.sort((a, b) => a.name < b.name ? 1 : (a.name > b.name ? 1 : 0));
            });
            this.isLessThan3Days = to - from <= 86340000 * 3;


            let count = 0;
            // for (let i = 0; i < data.length; i++) {
            this.results.forEach(sensor => {
                sensor.series.forEach(val => {
                    count++;
                });
            });
            this.isLoading = false;
            this.indexTicks = JSON.parse(JSON.stringify(this.indexTicks));
        });
    }


    ngAfterViewInit(): void {
        setTimeout(_ => {
            window.dispatchEvent(new Event('resize'));
        }); // BUGFIX:
    }


    axisFormatDate(val) {
        return formatDate(new Date(val), 'MMM  yyyy', 'en');
    }

    axisFormatTime(val) {
        return formatDate(new Date(val), 'MMM dd HH:mm', 'en');
    }

}
