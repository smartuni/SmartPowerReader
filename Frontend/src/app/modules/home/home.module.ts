import {NgModule} from '@angular/core';

import {HomeRoutingModule} from './home-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {HomePageComponent} from './pages/home-page.component';
import {EditComponent} from './components/edit/edit.component';
import {FilterBarComponent} from './components/filter-bar/filter-bar.component';
import {GraphSummaryComponent} from './components/graph-summary/graph-summary.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AmazingTimePickerModule} from 'amazing-time-picker';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {SensorService} from './services/sensor.service';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';


@NgModule({
  imports: [
    SharedModule,
    HomeRoutingModule,
    NgbModule,
    AmazingTimePickerModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    NoopAnimationsModule
  ],
  declarations: [
    HomePageComponent,
    EditComponent,
    FilterBarComponent,
    GraphSummaryComponent
  ],
  providers: [
    SensorService
  ]
})
export class HomeModule {
}
