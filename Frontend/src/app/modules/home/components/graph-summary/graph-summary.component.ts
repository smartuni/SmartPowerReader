import {AfterViewInit, Component, OnInit} from '@angular/core';
import {SensorService} from '../../services/sensor.service';
import {Sensor} from 'core/interfaces/sensor.interface';
import {formatDate} from '@angular/common';
import {GET_MEASUREMENT} from '../../constants/constants';

@Component({
    selector: 'app-graph-summary',
    templateUrl: './graph-summary.component.html',
    styleUrls: ['./graph-summary.component.scss']
})
export class GraphSummaryComponent implements OnInit, AfterViewInit {
    results: Sensor[] = [];
    isLoading = true;
    isLoaded = false;

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
    isLessThan1Month = false;

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    };

    constructor(private sensorService: SensorService) {
    }

    ngOnInit() {
    }

    drawGraph(selectedDevices: any[], from: number, to: number) {
        this.isLoading = true;
        this.isLoaded = false;
        this.isLessThan3Days = false;
        this.results = [];
        for (let i = 0; i < selectedDevices.length; i++) {
            const params = {
                action: GET_MEASUREMENT,
                id: selectedDevices[i][0],
                from: from,
                to: to,
                count: 100
            };
            setTimeout(() => {
                this.sensorService.getData(params).subscribe((res) => {
                    const series = res.map(s => ({
                        name: s.timestamp,
                        value: s.value
                    }));

                    series.sort((a, b) => a.name < b.name ? 1 : (a.name > b.name ? 1 : 0));
                    const newSensor = {
                        id: params.id,
                        name: selectedDevices[i][1] ? selectedDevices[i][1] : params.id,
                        series: series
                    } as Sensor;
                    this.results.push(newSensor);
                    if (i === selectedDevices.length - 1) {
                        this.isLoading = false;
                    }
                });
            }, 2000);
        }
        this.isLessThan3Days = to - from <= 86340000 * 3;
        this.isLessThan1Month = to - from <= 86340000 * 28;


    }


    ngAfterViewInit(): void {
        setTimeout(_ => {
            window.dispatchEvent(new Event('resize'));
        }); // BUGFIX:
    }


    axisFormatMonth(val) {
        return formatDate(new Date(val), 'MMM  yyyy', 'en');
    }

    axisFormatTime(val) {
        return formatDate(new Date(val), 'MMM dd HH:mm', 'en');
    }

    axisFormatDate(val) {
        return formatDate(new Date(val), 'dd MMM', 'en');
    }

}
