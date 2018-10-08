import {inject, TestBed} from '@angular/core/testing';

import {ModalService} from './modal.service';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

describe('ModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalService]
    });
  });

  it('should be created', inject([ModalService], (service: ModalService) => {
    expect(service).toBeTruthy();
  }));
});
