import {inject, TestBed} from '@angular/core/testing';

import {DomService} from './dom.service';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

describe('DomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DomService]
    });
  });

  it('should be created', inject([DomService], (service: DomService) => {
    expect(service).toBeTruthy();
  }));
});
