import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ModalService} from '../../../../../shared/services/modal.service';
import {SensorService} from '../../../services/sensor.service';
import {Sensor} from '../../../../../core/interfaces/sensor.interface';

@Component({
    selector: 'app-components',
    templateUrl: './adding.component.html',
    styleUrls: ['./adding.component.scss']
})
export class AddingComponent implements OnInit {
    form: FormGroup;
    isLoadedLink = false;
    sensorsInfo: Sensor[] = [];

    constructor(private modalService: ModalService, private sensorService: SensorService) {
    }

    ngOnInit() {
        this.isLoadedLink = false;
        this.form = new FormGroup({
            server: new FormControl(''),
            serverName: new FormControl(''),
            deviceId: new FormControl(''),
            deviceName: new FormControl(''),
            folderName: new FormControl(''),
            period: new FormControl(1, [Validators.min(1)])
        });
    }

    close() {
        this.modalService.destroy();
    }

    loadServer() {
        this.isLoadedLink = false;
        this.sensorService.getAllSenors().subscribe(res => {
            console.log('getAllSensors response from serve', res);
            this.sensorsInfo = res;
            this.isLoadedLink = true;
        });
    }

    save() {
        const formValue = this.form.getRawValue();
        const newValues = {
            id: formValue.deviceId,
            name: formValue.deviceName,
            period: formValue.period
        };
        this.sensorService.updateSensors(newValues).subscribe( res => {
            console.log('updateSensors response from server', res);
        });
    }

    isFormValid() {
        return !this.form.invalid;
    }

}
