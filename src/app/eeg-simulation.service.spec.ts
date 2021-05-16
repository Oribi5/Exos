import { TestBed } from '@angular/core/testing';

import { EegSimulationService } from './eeg-simulation.service';

describe('EegSimulationService', () => {
  let service: EegSimulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EegSimulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
