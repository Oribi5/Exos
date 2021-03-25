import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandInterfaceComponent } from './command-interface.component';

describe('CommandInterfaceComponent', () => {
  let component: CommandInterfaceComponent;
  let fixture: ComponentFixture<CommandInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandInterfaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
