import { TestBed } from '@angular/core/testing';

import { SignalProcessingService } from './signal-processing.service';

describe('SignalProcessingService', () => {
  let service: SignalProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
