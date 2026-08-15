import { TestBed } from '@angular/core/testing';

import { Co } from './co';

describe('Co', () => {
  let service: Co;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Co);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
