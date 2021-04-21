import { TestBed } from '@angular/core/testing';

import { CommandInterfaceService } from './command-interface.service';

describe('CommandInterfaceService', () => {
  let service: CommandInterfaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandInterfaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
