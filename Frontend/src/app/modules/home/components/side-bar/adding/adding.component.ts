import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ModalService} from '../../../../../shared/services/modal.service';

@Component({
  selector: 'app-components',
  templateUrl: './adding.component.html',
  styleUrls: ['./adding.component.scss']
})
export class AddingComponent implements OnInit {
  form: FormGroup;
  info: any = {};
  isLoadedLink = false;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
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
    console.log('loadServer');
    this.isLoadedLink = !this.isLoadedLink;
  }

}
