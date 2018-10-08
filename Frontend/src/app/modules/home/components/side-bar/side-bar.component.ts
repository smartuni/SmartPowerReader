import { Component, OnInit } from '@angular/core';
import {ModalService} from '../../../../shared/services/modal.service';
import {AddingComponent} from './adding/adding.component';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  currentIndex = -1;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
  }

  addToSideBar () {
    this.modalService.init(AddingComponent, {}, {});
  }

}
