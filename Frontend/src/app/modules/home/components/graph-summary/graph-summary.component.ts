import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SensorService} from '../../services/sensor.service';
import {Sensor} from 'core/interfaces/sensor.interface';
import {formatDate} from '@angular/common';
import {GET_MEASUREMENT} from '../../constants/constants';
import {select, Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {getAutoUpdate, isUpdatingGraph, period} from 'store/reducers';
import {GraphLoadedAction, GraphLoadingAction, GraphUpdatedAction} from 'store/actions/graph';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-graph-summary',
    templateUrl: './graph-summary.component.html',
    styleUrls: ['./graph-summary.component.scss']
})
export class GraphSummaryComponent implements OnInit, AfterViewInit {
    results: Sensor[] = [];
    isLoading = true;
    isLoaded = false;
    isLoadedAgain = false;
    showXAxis = true;
    showYAxis = true;
    showLegend = true;
    showXAxisLabel = true;
    showYAxisLabel = true;
    yAxisLabel = 'Power Meter';
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
    subscriptionPeriod: Subscription;
    subscriptionUpdatingGraph: Subscription;
    subscription: Subscription;
    oldEndTime: number;

    constructor(private sensorService: SensorService, private store: Store<fromRoot.State>, private cd: ChangeDetectorRef) {

    }

    ngOnInit() {
    }

    drawGraph(selectedDevices: Sensor[], from: number, to: number) {
        this.unsubscribeAll();
        this.isLoading = true;
        this.isLoaded = false;

        this.isLessThan3Days = false;
        this.results = [];
        this.store.dispatch(new GraphLoadingAction());
        this.loadGraph(selectedDevices, from, to);
        // if (!this.isLoadedAgain) {
        this.subscription = this.store.pipe(select(getAutoUpdate)).subscribe(autoUpdate => {
            if (autoUpdate) {
                this.subscriptionPeriod = this.store.pipe(select(period)).subscribe(endTime => {

                    this.subscriptionUpdatingGraph = this.store.pipe(select(isUpdatingGraph)).subscribe(isUpdating => {
                        if (this.oldEndTime < endTime) {

                            console.log('updateing');
                            this.updateGraph(selectedDevices, endTime);
                        }
                    });
                });
            } else {
                if (this.subscriptionPeriod) {
                    this.subscriptionPeriod.unsubscribe();
                }
                if (this.subscriptionUpdatingGraph) {
                    this.subscriptionUpdatingGraph.unsubscribe();
                }
            }
        });
        // } else {
        //     if (this.subscription) {
        //         this.subscription.unsubscribe();
        //         this.isLoadedAgain = false;
        //     }
        // }


        // this.subscription = this.store.pipe(select(isReloadingGraph)).subscribe(isReloading => {
        //     if (!isReloading) {
        //         this.subscriptionLoadedGraph = this.store.pipe(select(isLoadedGraph)).subscribe(isLoaded => {
        //             if (isLoaded) {
        //                 this.store.dispatch(new GraphUpdatingAction());
        //                 this.store.pipe(select(isUpdatingGraph)).subscribe(isUpdating => {
        //                     this.store.pipe(select(period)).subscribe(interval => {
        //                         if (!isUpdating) {
        //                             this.updateGraph(selectedDevices, interval[0], interval[1]);
        //                         }
        //                     });
        //                 });
        //             } else {
        //                 this.loadGraph(selectedDevices, from, to);
        //             }
        //         });
        //
        //     } else {
        //         this.loadGraph(selectedDevices, from, to);
        //     }
        // });

        this.isLessThan3Days = to - from <= 86340000 * 3;
        this.isLessThan1Month = to - from <= 86340000 * 38;


    }

    private loadGraph(selectedDevices: Sensor[], from: number, to: number) {
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
                        this.oldEndTime = +JSON.parse(JSON.stringify(to));
                        this.isLoaded = true;
                        this.isLoadedAgain = true;
                        this.store.dispatch(new GraphLoadedAction());
                    }
                });
            }, 2000);
        }
    }

    private updateGraph(selectedDevices: Sensor[], to: number) {
        // console.log('updateGraph', to, selectedDevices.length, this.results);

        for (let i = 0; i < selectedDevices.length; i++) {
            const params = {
                action: GET_MEASUREMENT,
                id: selectedDevices[i][0],
                from: +JSON.parse(JSON.stringify(this.oldEndTime)),
                to: to + 1,
                count: 1
            };
            setTimeout(() => {
                const index = this.results.findIndex(sensor => params.id === sensor.id);
                console.log(params.id, this.results);
                if (index >= 0) {
                    // console.log('123');
                    this.sensorService.getData(params).subscribe(res => {
                        const series = res.map(s => ({
                            name: s.timestamp,
                            value: s.value
                        }));
                        series.sort((a, b) => a.name < b.name ? 1 : (a.name > b.name ? 1 : 0));
                        // this.results[index].series.pop();

                        this.results[index].series.push(...series);

                        if (i === selectedDevices.length - 1) {
                            // this.isLoading = false;
                            this.oldEndTime = +JSON.parse(JSON.stringify(to));
                            this.results = [...this.results];
                            this.store.dispatch(new GraphUpdatedAction());
                            // this.cd.detectChanges();
                        }
                    });
                }

            }, 2000);
        }
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

    private unsubscribeAll() {
        if (this.subscriptionPeriod) {
            this.subscriptionPeriod.unsubscribe();
        }
        if (this.subscriptionUpdatingGraph) {
            this.subscriptionUpdatingGraph.unsubscribe();
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

    }

}
