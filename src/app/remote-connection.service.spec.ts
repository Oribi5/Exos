import { TestBed } from '@angular/core/testing';

import { RemoteConnectionService } from './remote-connection.service';

describe('RemoteConnectionService', () => {
  let service: RemoteConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
