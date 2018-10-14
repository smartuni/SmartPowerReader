import {AfterViewInit, Component, OnInit} from '@angular/core';
import {SensorService} from '../../../services/sensor.service';
import {Sensor} from '../../../../../core/interfaces/sensor.interface';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-graph-summary',
  templateUrl: './graph-summary.component.html',
  styleUrls: ['./graph-summary.component.scss']
})
export class GraphSummaryComponent implements OnInit, AfterViewInit {
  results: Sensor[];
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

  constructor(private sensorService: SensorService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.sensorService.getAllSensorsData().subscribe(data => {
      this.results = data;
      let count = 0;
      // for (let i = 0; i < data.length; i++) {
      data[0].series.forEach(val => {
        const date = formatDate(new Date(val.name), 'MMM dd', 'en');

        if (!this.ticks.includes(val.name)) {
          this.ticks.push(val.name);
        }

        if (!this.simpleTicks.includes(date)) {
          this.simpleTicks.push(JSON.parse(JSON.stringify(date)));
          this.indexTicks.push(+JSON.parse(JSON.stringify(count)));
        }

        count++;
      });
      // }

      this.isLoading = false;
    });
    this.indexTicks = JSON.parse(JSON.stringify( this.indexTicks));
    console.log('outside index', this.indexTicks);
    console.log('outside simple', this.simpleTicks);
    console.log('outside full', this.ticks);
  }

  xFormat = (e) => {
    // where e - value of tick by default
    // console.log(this);
    // now you have access to your component variables
    return formatDate(new Date(e), 'MMM dd HH:MM:ss', 'en');
  }


  ngAfterViewInit(): void {
    setTimeout(_ => {
      window.dispatchEvent(new Event('resize'));
    }); // BUGFIX:
  }


  dateTickFormatting = (e) => {
    return new Date(e).toLocaleString('de-DE');
  }

  axisFormat(val) {
    // console.log('index', this.indexTicks);
    // console.log('simple', this.simpleTicks);
    // console.log('ticks', this.ticks);

    // const index = this.ticks.indexOf(val);
    // const i = this.indexTicks.includes(index);
    // console.log(val, index, i);
    // if (this.indexTicks.includes(this.ticks.indexOf(val) )) {
      return formatDate(new Date(val), 'MMM dd', 'en');
    // } else {
    //   return '';
    // }
  }


}
