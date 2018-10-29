import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FooterComponent} from './core/footer/footer.component';
import {HeaderComponent} from './core/header/header.component';
import {AddingComponent} from './modules/home/components/side-bar/adding/adding.component';
import {AppRoutingModule} from './app-routing.module';
import {HomeModule} from './modules/home/home.module';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AddingComponent
  ]
})
export class AppModule {
}
