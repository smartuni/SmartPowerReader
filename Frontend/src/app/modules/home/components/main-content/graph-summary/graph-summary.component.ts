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
  isLoading: boolean;

  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Number';
  showYAxisLabel = true;
  yAxisLabel = 'Color Value';
  roundDomains = true;
  autoScale = true;
  xAxisTicks = [];

  constructor(private sensorService: SensorService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.sensorService.getAllSensorsData().subscribe(data => {
      this.results = data;
      for (let i = 0; i < data.length; i++) {
        data[i].series.forEach(val => {
          const date = formatDate(new Date(val.name), 'MMM dd', 'en');
          if (!this.xAxisTicks.includes(date))
            this.xAxisTicks.push(date);
        });
        console.log(this.xAxisTicks);
      }
      this.isLoading = false;
    });
  }

  xFormat = (e) => {
    // where e - value of tick by default
    // console.log(this);
    // now you have access to your component variables
    return formatDate(new Date(e), 'MMM dd HH:MM:ss', 'en');
  };


  ngAfterViewInit(): void {
    setTimeout(_ => {
      window.dispatchEvent(new Event('resize'));
    }); // BUGFIX:
  }


  dateTickFormatting = (e) => {
    return new Date(e).toLocaleString('de-DE');
  };

}
