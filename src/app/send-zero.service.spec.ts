import { TestBed, inject } from '@angular/core/testing';

import { SendZeroService } from './send-zero.service';

describe('SendZeroService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SendZeroService]
    });
  });

  it('should be created', inject([SendZeroService], (service: SendZeroService) => {
    expect(service).toBeTruthy();
  }));
});
