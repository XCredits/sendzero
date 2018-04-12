import { TestBed, inject } from '@angular/core/testing';

import { SendZeroConnectService } from './send-zero-connect.service';

describe('SendZeroConnectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SendZeroConnectService]
    });
  });

  it('should be created', inject([SendZeroConnectService], (service: SendZeroConnectService) => {
    expect(service).toBeTruthy();
  }));
});
