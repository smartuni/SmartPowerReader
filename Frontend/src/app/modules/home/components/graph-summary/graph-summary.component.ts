import {AfterViewInit, Component, OnInit} from '@angular/core';
import {SensorService} from '../../services/sensor.service';
import {Sensor} from '../../../../core/interfaces/sensor.interface';
import {formatDate} from '@angular/common';
import {actionGetMeasurement} from '../../constants/constants';

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

    drawGraph(selectedDeviceIds: string[], from: number, to: number) {
        this.isLoading = true;
        this.isLoaded = false;
        this.isLessThan3Days = false;
        this.results = [];
        console.log('selectedDeviceIds', selectedDeviceIds, from, to);
        for (let i = 0; i < selectedDeviceIds.length; i++) {
            const params = {
                action: actionGetMeasurement,
                id: selectedDeviceIds[i],
                from: from,
                to: to,
                count: 100
            };
            this.sensorService.getData(params).subscribe((res) => {
                const series = res.map(s => ({
                    name: s.timestamp,
                    value: s.value
                }));

                series.sort((a, b) => a.name < b.name ? 1 : (a.name > b.name ? 1 : 0));
                const newSensor = {
                    id: params.id,
                    name: params.id,
                    series: series
                } as Sensor;
                this.results.push(newSensor);
                if (i === selectedDeviceIds.length - 1) {
                    console.log('in if', this.results);
                    // this.indexTicks = JSON.parse(JSON.stringify(this.indexTicks));
                    this.isLoading = false;
                }
            });
        }
        this.isLessThan3Days = to - from <= 86340000 * 3;
        console.log('to - from', to, from, to - from, 86340000 * 28, to - from <= 86340000 * 28);
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
