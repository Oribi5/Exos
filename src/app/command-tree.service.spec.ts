import { TestBed } from '@angular/core/testing';

import { CommandTreeService } from './command-tree.service';

describe('CommandTreeService', () => {
  let service: CommandTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
