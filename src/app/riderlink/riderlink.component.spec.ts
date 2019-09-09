import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderlinkComponent } from './riderlink.component';

describe('RiderlinkComponent', () => {
  let component: RiderlinkComponent;
  let fixture: ComponentFixture<RiderlinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderlinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
