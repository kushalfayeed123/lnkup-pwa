import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bookseatrequest',
  templateUrl: './bookseatrequest.component.html',
  styleUrls: ['./bookseatrequest.component.scss']
})
export class BookseatrequestComponent implements OnInit {

  public counter = 1;
  constructor() { }

  ngOnInit() {
  }

  increaseValue() {
    this.counter = this.counter + 1;
  }
  decreaseValue() {
    this.counter -= 1;
  }

}
