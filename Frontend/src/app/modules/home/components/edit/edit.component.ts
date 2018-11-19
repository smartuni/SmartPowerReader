import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ModalService} from '../../../../shared/services/modal.service';
import {SensorService} from '../../services/sensor.service';
import {Sensor} from '../../../../core/interfaces/sensor.interface';

@Component({
    selector: 'app-components',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
    form: FormGroup;
    sensors: Sensor[];
    @Output() onClosed = new EventEmitter();

    constructor(private sensorService: SensorService) {
    }

    ngOnInit() {
        this.form = new FormGroup({
            deviceId: new FormControl(''),
            deviceName: new FormControl(),
            period: new FormControl(1, [Validators.min(1)])
        });
    }

    save() {
        const formValue = this.form.getRawValue();
        const newValues = {
            id: formValue.deviceId,
            period: formValue.period
        };

        if (formValue.deviceName)
            newValues['name'] = formValue.deviceName;
        this.sensorService.updateSensors(newValues).subscribe(res => {
            this.onClosed.emit(null);
        });
    }

    isFormValid() {
        return !this.form.invalid;
    }

}
