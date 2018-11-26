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
    selectedSensor: Sensor;
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
        const editedSensor = {
            id: formValue.deviceId,
            period: formValue.period
        };

        if (formValue.deviceName) {
            editedSensor['name'] = formValue.deviceName;

        }
        // this.sensorService.updateSensors(editedSensor).subscribe(res => {
        this.onClosed.emit(editedSensor);
        // });
    }

    isFormValid() {
        return !this.form.invalid;
    }

    onChangeSensor(event) {
        const id = event.target.value;
        this.selectedSensor = this.sensors.find(sensor => sensor.id === id);
        console.log(this.selectedSensor);
    }

}
