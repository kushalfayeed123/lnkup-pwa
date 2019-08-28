import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabledriversComponent } from './availabledrivers.component';

describe('AvailabledriversComponent', () => {
  let component: AvailabledriversComponent;
  let fixture: ComponentFixture<AvailabledriversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailabledriversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabledriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
