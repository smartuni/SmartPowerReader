import {Injectable} from '@angular/core';
import {DomService} from './dom.service';

@Injectable(
  {providedIn: 'root'}
)
export class ModalService {
  private modalElementId = 'modal-container';
  private overlayElementId = 'modal-background';
  private wrapperElementId = 'modal-wrapper';

  constructor(private domService: DomService) {
  }

  init(component: any, inputs: object, outputs: object) {
    const config = {
      inputs: inputs,
      outputs: outputs
    };
    this.domService.appendComponentTo(this.modalElementId, component, config);
    document.getElementById(this.modalElementId).style.visibility = 'visible';
    document.getElementById(this.overlayElementId).style.visibility  = 'visible';
    document.getElementById(this.wrapperElementId).style.display  = 'block';
  }

  destroy() {
    this.domService.removeComponent();
    document.getElementById(this.modalElementId).style.visibility  = 'hidden';
    document.getElementById(this.overlayElementId).style.visibility  = 'hidden';
    document.getElementById(this.wrapperElementId).style.display  = 'none';
  }

}
