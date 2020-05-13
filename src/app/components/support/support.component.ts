import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { AppReviewDataService } from 'src/app/services/data/app-review/app-review.data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { Select, Store } from '@ngxs/store';
import { AppState } from 'src/app/state/app/app.state';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';
import { ShowLeftNav, ShowLoader } from 'src/app/state/app/app.actions';
import { ChatState } from 'src/app/state/chat/chat.state';
import { GetChatMessages } from 'src/app/state/chat/chat.action';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  // animations: [slideInAnimation],
  // host: { '[@slideInAnimation]': '' }
})
export class SupportComponent implements OnInit, OnDestroy, AfterViewInit {

  @Select(AppState.getCurrentUser) currentUser$: Observable<Users>;
  @Select(ChatState.getChatObject) chatObject$: Observable<any>;
  @Select(ChatState.getChat) messages$: Observable<any>;
  @Select(AppState.getPreviousRoute) previousRoute$: Observable<any>;





  @ViewChild('scroll', { static: true }) scroll: any;
  private subs = new SubSink();

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
  sent = [];
  loading: boolean;
  groupMembers = [];
  currentUserMessage = [];
  chatObject: any;
  messages = [];
  previousRoute: any;
  container: HTMLElement;
  constructor(private _router: Router, private fb: FormBuilder,
    private reviewService: AppReviewDataService,
    private route: ActivatedRoute,
    private notifyService: NotificationsService,
    private store: Store) {
  }


  ngOnInit() {
    this.store.dispatch(new ShowLeftNav(true));
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(param => {
        this.reviewType = param.reviewType;

      });
    this.subs.add(
      this.currentUser$.subscribe(res => {
        this.getCurrentUser(res);
      }),

      this.chatObject$.subscribe(res => {
        this.chatObject = res;
      }),
      this.messages$.subscribe(res => {
        this.allMessages = res.filter(g => g.groupName === this.chatObject.groupName);
        // this.groupMessage = res.message;
        console.log(this.allMessages);
      }),
      this.previousRoute$.subscribe(res => {
        this.previousRoute = res;
      })
    );
    this.notifyService.intiateConnection();

    this.messageForm = this.fb.group({
      userReview: ['', [Validators.required]],
      userId: ['', [Validators.required]],
      userRating: [0, [Validators.required]],
      reviewType: ['', [Validators.required]],
      reviewTime: ['', [Validators.required]],
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.addToGroup();
      this.receiveGroupMessage();
    }, 5000);
    this.scrollChat();
  }

  addToGroup() {
    this.notifyService.addUserToGroup(this.chatObject.groupName);
  }

  getCurrentUser(user) {
    this.userName = user.userName;
    this.userId = user.userId;
    this.userRole = user.role.toLowerCase();
  }
  scrollChat() {
    this.container = document.getElementById('anchor');
    this.container.scrollIntoView({ behavior: 'smooth' });
  }
  sendGroupMessage(message) {
    this.store.dispatch(new ShowLoader(true));
    // this.currentUserMessage.push(message);
    const messageObject = JSON.stringify({
      sender: this.userName,
      message,
      senderId: this.chatObject.senderId,
      groupName: this.chatObject.groupName
    });

    const pushMessage = {
      title: `LnkuP message from ${this.chatObject.groupName}`,
      body: message,
      receiverName: this.chatObject.receiverName,
      click_action: `https://lnkupmob.azureedge.net/support/${this.userId}?reviewType=chat`
    };
    this.notifyService.sendGroupMessage(this.chatObject.groupName, messageObject);
    this.notifyService.sendNotification(this.chatObject.receiverId, pushMessage);
    setTimeout(() => {
      this.scrollChat();
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
          this.store.dispatch(new ShowLoader(false));
          this.allMessages = [...this.allMessages, messageObject];
          // this.allMessages = this.allMessages.filter(x => x.sender !== this.userName);
          this.sender = messageObject.sender;
          console.log('group members', this.allMessages);
          this.store.dispatch(new GetChatMessages(this.allMessages));
          this.scrollChat();
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
              // tslint:disable-next-line: max-line-length
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

  navTopreviousScreen() {
    console.log(this.previousRoute);
    this._router.navigateByUrl(this.previousRoute);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();
  }

}
