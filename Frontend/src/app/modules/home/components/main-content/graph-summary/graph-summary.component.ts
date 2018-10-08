import {Component, OnInit} from '@angular/core';
import {SensorService} from '../../../services/sensor.service';
import {Sensor} from '../../../../../core/interfaces/sensor.interface';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-graph-summary',
  templateUrl: './graph-summary.component.html',
  styleUrls: ['./graph-summary.component.scss']
})
export class GraphSummaryComponent implements OnInit {
  results: Sensor[];
  isLoading: boolean;

  view = [1200, 400];
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Number';
  showYAxisLabel = true;
  autoScale = true;
  yAxisLabel = 'Color Value';
  tooltipDisabled = true;
  monthName = new Intl.DateTimeFormat('en-us', {month: 'short'});
  weekdayName = new Intl.DateTimeFormat('en-us', {weekday: 'short'});

  constructor(private sensorService: SensorService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.sensorService.getAllSensorsData().subscribe(data => {
      this.results = data;
      this.isLoading = false;
    });
  }

  xFormat = (e) => {
    // where e - value of tick by default
    // console.log(this);
    // now you have access to your component variables
    return formatDate(new Date(e), 'MM-dd HH:MM:ss', 'en');
  }

}
