import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-riderlanding',
  templateUrl: './riderlanding.component.html',
  styleUrls: ['./riderlanding.component.scss']
})
export class RiderlandingComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  public userId: string;

  constructor(private route: ActivatedRoute,
    private authService: AuthenticateDataService) { }

  ngOnInit() {
    this.route.params.subscribe(p => {
      const userId = p['id'];
      this.getUserById(userId);
    });
   
  }

  getUserById(userId) {
      this.authService.getById(userId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(user => {
          const currentUser = user;
          console.log('user viewing this screen', currentUser);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
