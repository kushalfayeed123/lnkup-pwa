import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  message: any;
  showMessage: boolean;
  closeMessage: boolean;
  isError: boolean;
  isSuccess: boolean;
  isInfo: boolean;

  constructor(private broadCastService: BroadcastService) {}

  ngOnInit() {
    this.displayMessage();
    this.getMessageType();
  }

  displayMessage() {
    this.broadCastService.notifMessage
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res) {
          this.showMessage = true;
          this.message = res;
          setTimeout(() => {
            this.closeMessage = true;
          }, 5000);
          setTimeout(() => {
            this.showMessage = false;
            this.closeMessage = false;
          }, 6000);
        } else {
          this.showMessage = false;
          return;
        }
      });

    this.showMessage = false;
  }

  getMessageType() {
    this.broadCastService.messageType
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        console.log(res);
        if (res === 'error') {
          this.isError = true;
          this.isSuccess = false;
          this.isInfo = false;
        } else if (res === 'success') {
          this.isSuccess = true;
          this.isError = false;
          this.isInfo = false;
        } else {
          this.isInfo = true;
          this.isSuccess = false;
          this.isError = false;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
