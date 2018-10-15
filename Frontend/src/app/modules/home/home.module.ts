import {NgModule} from '@angular/core';

import {HomeRoutingModule} from './home-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {HomePageComponent} from './pages/home-page.component';
import {SideBarComponent} from './components/side-bar/side-bar.component';
import {MainContentComponent} from './components/main-content/main-content.component';
import {AddingComponent} from './components/side-bar/adding/adding.component';
import {FilterBarComponent} from './components/main-content/filter-bar/filter-bar.component';
import {GraphSummaryComponent} from './components/main-content/graph-summary/graph-summary.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AmazingTimePickerModule} from 'amazing-time-picker';
import { NgxChartsModule } from '@swimlane/ngx-charts';
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
    SideBarComponent,
    MainContentComponent,
    AddingComponent,
    FilterBarComponent,
    GraphSummaryComponent
  ],
  providers: [
    SensorService
  ]
})
export class HomeModule {
}
