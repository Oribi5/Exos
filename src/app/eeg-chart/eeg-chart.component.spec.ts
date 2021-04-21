import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EegChartComponent } from './eeg-chart.component';

describe('EegChartComponent', () => {
  let component: EegChartComponent;
  let fixture: ComponentFixture<EegChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EegChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EegChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
