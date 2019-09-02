import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookseatrequestComponent } from './bookseatrequest.component';

describe('BookseatrequestComponent', () => {
  let component: BookseatrequestComponent;
  let fixture: ComponentFixture<BookseatrequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookseatrequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookseatrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
