import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverdashboardComponent } from './driverdashboard.component';

describe('DashboardComponent', () => {
  let component: DriverdashboardComponent;
  let fixture: ComponentFixture<DriverdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
