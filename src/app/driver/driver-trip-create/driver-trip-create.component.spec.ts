import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverTripCreateComponent } from './driver-trip-create.component';

describe('DriverTripCreateComponent', () => {
  let component: DriverTripCreateComponent;
  let fixture: ComponentFixture<DriverTripCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverTripCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverTripCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
