import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ModalService} from '../../../../../shared/services/modal.service';
import {SensorService} from '../../../services/sensor.service';

@Component({
  selector: 'app-components',
  templateUrl: './adding.component.html',
  styleUrls: ['./adding.component.scss']
})
export class AddingComponent implements OnInit {
  form: FormGroup;
  info: any = {};
  isLoadedLink = false;

  constructor(private modalService: ModalService, private sensorService: SensorService) { }

  ngOnInit() {
    this.isLoadedLink = false;
    this.form = new FormGroup({
      server: new FormControl(''),
      serverName: new FormControl(''),
      deviceID: new FormControl(''),
      deviceName: new FormControl(''),
      folderName: new FormControl('')
    });
  }

  close() {
    this.modalService.destroy();
  }

  loadServer() {
    // this.sensorService.getAllSensors(this.form.getRawValue().server).subscribe( res => {
    //   console.log('res', res);
    //   this.isLoadedLink = true;
    // });
  }

}
