import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/state/app/app.state';
import { Observable } from 'rxjs/internal/Observable';
import { Select } from '@ngxs/store';
import { SubSink } from 'subsink/dist/subsink';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {

  @Select(AppState.showLoader) showLoader$: Observable<boolean>;

  private subs = new SubSink();
  showLoader: boolean;

  constructor() { }

  ngOnInit() {
    this.subs.add(
      this.showLoader$.subscribe(res => {
        this.showLoader = res;
      })
    );

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
