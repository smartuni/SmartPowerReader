import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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
    selectedSensor: Sensor;
    @Output() onClosed = new EventEmitter();
    @Output() onUpdated = new EventEmitter();


    constructor(private sensorService: SensorService) {
    }

    ngOnInit() {
        this.form = new FormGroup({
            deviceId: new FormControl(''),
            deviceName: new FormControl(),
            period: new FormControl(0, [Validators.min(0)]),
            activated: new FormControl(true),
        });
    }

    save() {
        const formValue = this.form.getRawValue();
        const editedSensor = {
            id: formValue.deviceId,
            // status: this.selectedSensor.status,
            name: !formValue.deviceName || (formValue.deviceName && formValue.deviceName.length === 0)
                ? null
                : formValue.deviceName,
        };
        if (this.selectedSensor.features.pwr_period) {
            editedSensor['features']['pwr_period'] = formValue.period;
        }
        if (this.selectedSensor.features.esstop) {
            editedSensor['features']['esstop'] = formValue.activated;
        }
        this.sensorService.updateSensors(editedSensor).subscribe(res => {
            this.onUpdated.emit(editedSensor);
        });
    }

    isFormValid() {
        return !this.form.invalid;
    }

    onChangeSensor(event) {
        const id = event.target.value;
        this.selectedSensor = this.sensors.find(sensor => sensor.id === id);
        this.form.controls['deviceName'].setValue(this.selectedSensor.name ? this.selectedSensor.name : null);
        this.form.controls['period'].setValue(this.selectedSensor.features.pwr_period ? this.selectedSensor.features.pwr_period : 1);
        this.form.controls['activated'].setValue(this.selectedSensor.features.esstop ? this.selectedSensor.features.esstop : true);
    }

    close() {
        this.onClosed.emit();
    }
}
