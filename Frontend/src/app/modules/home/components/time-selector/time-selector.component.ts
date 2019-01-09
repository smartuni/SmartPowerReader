import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-time-selector',
    templateUrl: './time-selector.component.html',
    styleUrls: ['./time-selector.component.scss']
})
export class TimeSelectorComponent implements OnInit {
    form: FormGroup;
    supportedType: any[];

    @Output() onClosed = new EventEmitter();
    @Output() onUpdated = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
        this.form = new FormGroup({
            time: new FormControl(1, [Validators.min(1), Validators.required]),
            type: new FormControl('', [Validators.required])
        });
    }

    isFormValid() {
        console.log('valid', this.form.invalid)
        return !this.form.invalid;
    }

    close() {
        this.onClosed.emit();
    }

    submit() {
        const formValue = this.form.getRawValue();
        this.onUpdated.emit(formValue);
    }

}
