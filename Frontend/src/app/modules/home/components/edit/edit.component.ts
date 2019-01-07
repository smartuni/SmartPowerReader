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
        if (!!this.selectedSensor.data.pwr_period) {
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
        // this.isSwitchStateAvailable = !!this.selectedSensor.data && this.selectedSensor.data.SWITCH_STATE !== null && this.selectedSensor.data.SWITCH_STATE !== undefined;
        // this.isEmergencyAvailable = !!this.selectedSensor.data && this.selectedSensor.data.ESTOP !== null && this.selectedSensor.data.ESTOP !== undefined;
        // this.isManualAvailable = !!this.selectedSensor.data && this.selectedSensor.data.MANUAL !== null && this.selectedSensor.data.MANUAL !== undefined;
        //
        // this.form.controls['deviceName'].setValue(this.selectedSensor.name ? this.selectedSensor.name : null);
        // this.form.controls['period'].setValue(!!this.selectedSensor.data && !!this.selectedSensor.data.PWR_PERIOD ? this.selectedSensor.data.PWR_PERIOD : null);
        // this.form.controls['activated'].setValue(this.isSwitchStateAvailable ? this.selectedSensor.data.SWITCH_STATE : false);
        // this.form.controls['emergency'].setValue(this.isEmergencyAvailable ? this.selectedSensor.data.ESTOP : false);
        // this.form.controls['manual'].setValue(this.isManualAvailable ? this.selectedSensor.data.MANUAL : false);

        this.isSwitchStateAvailable = !!this.selectedSensor.data && this.selectedSensor.data.switch_state !== null && this.selectedSensor.data.switch_state !== undefined;
        this.isEmergencyAvailable = !!this.selectedSensor.data && this.selectedSensor.data.estop !== null && this.selectedSensor.data.estop !== undefined;
        this.isManualAvailable = !!this.selectedSensor.data && this.selectedSensor.data.manual !== null && this.selectedSensor.data.manual !== undefined;

        this.form.controls['deviceName'].setValue(this.selectedSensor.name ? this.selectedSensor.name : null);
        this.form.controls['period'].setValue(!!this.selectedSensor.data && !!this.selectedSensor.data.pwr_period ? this.selectedSensor.data.pwr_period : null);
        this.form.controls['activated'].setValue(this.isSwitchStateAvailable ? this.selectedSensor.data.switch_state : false);
        this.form.controls['emergency'].setValue(this.isEmergencyAvailable ? this.selectedSensor.data.estop : false);
        this.form.controls['manual'].setValue(this.isManualAvailable ? this.selectedSensor.data.manual : false);

    }

    close() {
        this.onClosed.emit();
    }
}
