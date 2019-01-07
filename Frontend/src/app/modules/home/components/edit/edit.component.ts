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
    isEmergencyAvailable: boolean;
    isManualAvailable: boolean;
    isPeriodAvailable: boolean;


    constructor(private sensorService: SensorService) {
    }

    ngOnInit() {
        this.form = new FormGroup({
            deviceId: new FormControl(''),
            deviceName: new FormControl(),
            period: new FormControl(0, [Validators.min(0)]),
            activated: new FormControl(true),
            manual: new FormControl(''),
            emergency: new FormControl('')
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
        if (this.selectedSensor.data.hasOwnProperty('pwr_period')) {
            editedSensor['data']['pwr_period'] = formValue.period;

            // editedSensor['data']['PWR_PERIOD'] = formValue.period;
        }
        if (this.isSwitchStateAvailable) {
            editedSensor['data']['switch_state'] = formValue.activated;

            // editedSensor['data']['SWITCH_STATE'] = formValue.activated;
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

        this.isPeriodAvailable = !!this.selectedSensor.data && this.selectedSensor.data.hasOwnProperty('pwr_period');

        this.isSwitchStateAvailable = !!this.selectedSensor.data && this.selectedSensor.data.hasOwnProperty('switch_state');
        this.isEmergencyAvailable = !!this.selectedSensor.data && this.selectedSensor.data.hasOwnProperty('estop');
        this.isManualAvailable = !!this.selectedSensor.data && this.selectedSensor.data.hasOwnProperty('manual');

        this.form.controls['deviceName'].setValue(this.selectedSensor.name ? this.selectedSensor.name : null);
        this.form.controls['period'].setValue(this.isPeriodAvailable ? this.selectedSensor.data.pwr_period : null);
        this.form.controls['activated'].setValue(this.isSwitchStateAvailable ? this.selectedSensor.data.switch_state : false);
        this.form.controls['emergency'].setValue(this.isEmergencyAvailable ? this.selectedSensor.data.estop : false);
        this.form.controls['manual'].setValue(this.isManualAvailable ? this.selectedSensor.data.manual : false);

    }

    close() {
        this.onClosed.emit();
    }
}
