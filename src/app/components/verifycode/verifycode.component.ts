import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { slideInAnimation } from 'src/app/services/misc/animation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessMessageComponent } from '../success-message/success-message.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { takeUntil } from 'rxjs/operators';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';

@Component({
  selector: 'app-verifycode',
  templateUrl: './verifycode.component.html',
  styleUrls: ['./verifycode.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class VerifycodeComponent implements OnInit, OnDestroy {
  public verifyForm: FormGroup;
  private unsubscribe$ = new Subject<void>();
  public loading: boolean;
  public durationInSeconds = 4;
  message: string;
  public senderName: string;
  public senderEmail: string;
  public messageTitle: string;
  public messageBody: string;
  showForgotPasswordForm: boolean;
  recoveryForm: FormGroup;


  constructor(private formBuilder: FormBuilder,
              private route: Router,
              private router: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private broadcastService: BroadcastService,
              private toastService: NotificationsService,
              private authService: AuthenticateDataService) {
               this.getRecoveryStatus();
               }

  ngOnInit() {
    this.recoveryForm = this.formBuilder.group({
      recoveryEmail: ['', Validators.required]
    });

    this.verifyForm = this.formBuilder.group({
      verifycode: ['', Validators.required]
    });


  }

  getRecoveryStatus() {
    this.broadcastService.recovery
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.showForgotPasswordForm = res;
    });
  }
  verifyUser() {
    this.loading = true;
    const storedVerifyCode = localStorage.getItem('userVerification');
    const userVerifyCode = this.verifyForm.value;
    const usercode = userVerifyCode.verifycode;
    if (storedVerifyCode === usercode) {
      setTimeout(() => {
        this.sendVerificationEmail();
      }, 2000);
    } else {
      setTimeout(() => {
        this.loading = false;
        this.openErrorMessage();
      }, 4000);
    }
  }
  resendCode() {
    const userVerification = localStorage.getItem('userVerification');
    this.message = `Your verification code is ${userVerification}`;
    this.toastService.showInfoMessage(this.message);
  }

  sendVerificationEmail() {
    const user = JSON.parse(localStorage.getItem('registeredUser'));
    this.senderName = 'LnkuP';
    this.senderEmail = 'linkupsolutionsintl@gmail.com';
    this.messageTitle = 'Welcome to Lnkup';
    this.messageBody = `Dear ${user.userName}, thank you for signing up with LnkuP, please log in with your username ${user.userName}
     and your password ${user.password}. regards, the lnkup team.`;
    const registerMail = {
      toAddresses: [
        {
          name: user.userName,
          address: user.email
        }
      ],
      fromAddresses: [
        {
          name: this.senderName,
          address: this.senderEmail
        }
      ],
      subject: this.messageTitle,
      content: this.messageBody
    };

    this.authService.sendEmail(registerMail)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.loading = false;
        this.openSuccessMessage();
        setTimeout(() => {
          this.authenticateUser();
        }, 4000);
      }, err => {
        this.toastService.showErrorMessage(err);
      });
  }

  openSuccessMessage() {
    // this._snackBar.openFromComponent(SuccessMessageComponent, {
    //   duration: this.durationInSeconds * 1000,
    //   panelClass: ['dark-snackbar']
    // });

    this.toastService.showSuccessMessage('Verification Successful. Please check your email for your login details')
  }
  openErrorMessage() {
    this._snackBar.openFromComponent(ErrorMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-error']
    });
  }
  authenticateUser() {
    this.route.navigate(['login']);
  }



  recoverPassword() {
    this.loading = true;
    const userEmail = this.recoveryForm.value.recoveryEmail;

    this.authService.getByEmail(userEmail)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.loading = false;
        if (!res) {
          this.toastService.showErrorMessage('An error occured please try again');
        } else {
          console.log(res);
          this.sendPasswordEmail(res);
        }
      }, err => {
        this.loading = false;
        if (err === 'Not Found') {
          const message = 'This email does not exist. Please check the email and try again.'
          this.toastService.showErrorMessage(message);
        } else {
          this.toastService.showErrorMessage(err);
        }
      });
  }

  sendPasswordEmail(user) {
    this.senderName = 'LnkuP';
    this.senderEmail = 'linkupsolutionsintl@gmail.com';
    this.messageTitle = 'LnkuP password recovery';
    this.messageBody = `Dear ${user.userName}, your password request was received, you can log in with your username ${user.userName}
     and your password ${user.password}. Regards, the LnkuP team.`;
    const registerMail = {
      toAddresses: [
        {
          name: user.userName,
          address: user.email
        }
      ],
      fromAddresses: [
        {
          name: this.senderName,
          address: this.senderEmail
        }
      ],
      subject: this.messageTitle,
      content: this.messageBody
    };

    this.authService.sendEmail(registerMail)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.loading = false;
        this.toastService.showInfoMessage(`Your login detail has been sent to ${user.email}. Check your inbox to continue.`);
        setTimeout(() => {
          this.route.navigate(['login']);
        }, 7000);
      }, err => {
        this.toastService.showErrorMessage(err);
      });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
