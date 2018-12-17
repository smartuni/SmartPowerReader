import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SensorService} from '../../services/sensor.service';
import {Sensor} from 'core/interfaces/sensor.interface';

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
    isSwitchStateAvailable: boolean;


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
            name: !formValue.deviceName || (formValue.deviceName && formValue.deviceName.length === 0)
                ? null
                : formValue.deviceName,
        };
        if (!!this.selectedSensor.data) {
            editedSensor['data'] = {};
        }
        if (!!this.selectedSensor.data.PWR_PERIOD) {
            editedSensor['data']['PWR_PERIOD'] = formValue.period;
        }
        if (this.isSwitchStateAvailable) {
            editedSensor['data']['SWITCH_STATE'] = formValue.activated;
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
        this.isSwitchStateAvailable = !!this.selectedSensor.data && this.selectedSensor.data.SWITCH_STATE !== null && this.selectedSensor.data.SWITCH_STATE !== undefined;
        this.form.controls['deviceName'].setValue(this.selectedSensor.name ? this.selectedSensor.name : null);
        this.form.controls['period'].setValue(!!this.selectedSensor.data && !!this.selectedSensor.data.PWR_PERIOD ? this.selectedSensor.data.PWR_PERIOD : null);
        this.form.controls['activated'].setValue(this.isSwitchStateAvailable ? this.selectedSensor.data.SWITCH_STATE : false);
    }

    close() {
        this.onClosed.emit();
    }
}
