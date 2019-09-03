import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bookseatrequest',
  templateUrl: './bookseatrequest.component.html',
  styleUrls: ['./bookseatrequest.component.scss']
})
export class BookseatrequestComponent implements OnInit {

  public counter = 0;
  constructor() { }

  ngOnInit() {
  }

  increaseValue() {
    console.log('yes');
  }
  decreaseValue() {
    this.counter -= 1;
  }

}
