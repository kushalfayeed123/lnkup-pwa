import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderlandingComponent } from './riderlanding.component';

describe('RiderlandingComponent', () => {
  let component: RiderlandingComponent;
  let fixture: ComponentFixture<RiderlandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderlandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderlandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
