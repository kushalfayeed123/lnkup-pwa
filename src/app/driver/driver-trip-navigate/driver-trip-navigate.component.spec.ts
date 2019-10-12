import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverTripNavigateComponent } from './driver-trip-navigate.component';

describe('DriverTripNavigateComponent', () => {
  let component: DriverTripNavigateComponent;
  let fixture: ComponentFixture<DriverTripNavigateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverTripNavigateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverTripNavigateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
