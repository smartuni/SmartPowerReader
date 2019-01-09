import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoadingSpinnerComponent} from './components/loading-spinner/loading-spinner.component';
import {HttpClientModule} from '@angular/common/http';
import {CustomMaterialModule} from './custom-material.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        CustomMaterialModule
    ],
    declarations: [
        LoadingSpinnerComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LoadingSpinnerComponent,
        HttpClientModule,
        CustomMaterialModule
    ]
})
export class SharedModule {
}
