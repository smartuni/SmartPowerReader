import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FooterComponent} from './core/footer/footer.component';
import {HeaderComponent} from './core/header/header.component';
import {EditComponent} from './modules/home/components/edit/edit.component';
import {AppRoutingModule} from './app-routing.module';
import {HomeModule} from './modules/home/home.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        FooterComponent,
        HeaderComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HomeModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [
        EditComponent
    ]
})
export class AppModule {
}
