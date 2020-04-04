import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { AppReviewDataService } from 'src/app/services/data/app-review/app-review.data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { slideInAnimation } from 'src/app/services/misc/animation';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  // animations: [slideInAnimation],
  // host: { '[@slideInAnimation]': '' }
})
export class SupportComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('scroll', { static: true }) scroll: any;

  userName: any;
  private unsubscribe$ = new Subject<void>();
  userId: any;
  userRole: any;
  showReview: any;
  message: string;
  messageForm: FormGroup;
  currentDateTime: string;
  reviewType: string;
  showResponse: boolean;
  allMessages = [];
  groupMessage: any;
  isMeMessage = [];
  isOthersMessage: any[];
  sender: any;
  isMe: boolean;
  groupName: string;
  sent: any;
  loading: boolean;
  constructor(private _router: Router, private fb: FormBuilder,
    private reviewService: AppReviewDataService,
    private route: ActivatedRoute,
    private notifyService: NotificationsService) {
  }

  ngOnInit() {
    this.notifyService.intiateConnection();
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(param => {
        this.reviewType = param.reviewType;
      });
    this.messageForm = this.fb.group({
      userReview: ['', [Validators.required]],
      userId: ['', [Validators.required]],
      userRating: [0, [Validators.required]],
      reviewType: ['', [Validators.required]],
      reviewTime: ['', [Validators.required]],
    });
    this.getCurrentUser();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.addToGroup();
      this.receiveGroupMessage();
    }, 5000);
    // this.scroll.nativeElement.scrollTo(0, this.scroll.nativeElement.scrollHeight);
  }

  addToGroup() {
    this.loading = true;
    this.groupName = localStorage.getItem('groupName');
    this.notifyService.addUserToGroup(this.groupName);
    this.notifyService.sentFlag
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (!res) {
          this.loading = false;
          return;
        } else {
          this.loading = false;
          this.sent = res;
        }
      });
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      this.userName = user.userName;
      this.userId = user.id;
      this.userRole = user.role.toLowerCase();
    } else {
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        this.userName = user.userName;
        this.userId = user.id;
        this.userRole = user.role.toLowerCase();
      }, 5000);
      return;
    }
  }

  sendGroupMessage(message) {
    const messageObject = JSON.stringify({
      sender: this.userName,
      message,
    });
    this.notifyService.sendGroupMessage(this.groupName, messageObject);
    setTimeout(() => {
      this.scroll.nativeElement.scrollTo(0, this.scroll.nativeElement.scrollHeight);
      this.messageForm.reset();
    }, 1000);
  }
  receiveGroupMessage() {
    this.notifyService.groupMessage
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (!res) {
          return;
        } else {
          const messageObject = JSON.parse(res);
          this.groupMessage = messageObject.message;
          this.sender = messageObject.sender;
          this.allMessages = [...this.allMessages, messageObject];
          setTimeout(() => {
            this.scroll.nativeElement.scrollTo(0, this.scroll.nativeElement.scrollHeight);
          }, 1000);

        }
      });
  }

  navToHome() {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    this._router.onSameUrlNavigation = 'reload';
    this._router.navigate([`${this.userRole}/home/${this.userId}`]);
  }
  getCurrentTime() {
    const date = new Date();
    const format = 'MMMM d, y, hh:mm a';
    const locale = 'en-US';
    this.currentDateTime = formatDate(date, format, locale);
  }

  toggleReview() {
    this.showReview = !this.showReview;
  }
  sendMessage() {
    if (this.reviewType === 'comment') {
      this.getCurrentTime();
      this.message = this.messageForm.value.userReview;
      // this.allMessages = [...this.allMessages, this.message];
      this.messageForm.patchValue({ userId: this.userId, reviewTime: this.currentDateTime, reviewType: this.reviewType, userRating: 0 });
      if (this.messageForm.valid) {
        console.log(this.reviewType)
        this.reviewService.createReview(this.messageForm.value)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(res => {
            if (res) {
              this.messageForm.reset();
              this.notifyService.showSuccessMessage('Thank you for using LnkuP. Your review has been submitted, we will get back to you as soon as possible.')
            } else {
              return;
            }
          }, err => {
            this.notifyService.showErrorMessage('We could not submit your comment, this might be due to a network error please try again')
          });
      }
    } else {
      this.sendGroupMessage(this.messageForm.value.userReview);
    }

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
