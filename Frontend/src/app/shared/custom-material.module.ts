import {NgModule} from '@angular/core';
import {
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule
} from '@angular/material';

@NgModule({
    imports: [
      MatFormFieldModule,
      MatSelectModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatIconModule,
      MatSlideToggleModule,
      MatButtonToggleModule,
      MatCheckboxModule,
      MatChipsModule
  ],
  exports: [
      MatFormFieldModule,
      MatSelectModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatIconModule,
      MatSlideToggleModule,
      MatButtonToggleModule,
      MatCheckboxModule,
      MatChipsModule
  ]
})
export class CustomMaterialModule { }
