import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { format } from 'url';
import { formatDate } from '@angular/common';
import { NotificationsService } from 'src/app/services/business/notificatons.service';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class RegisterUserComponent implements OnInit, OnDestroy {

  public registerForm: FormGroup;
  private unsubscribe$ = new Subject<void>();
  public loading: boolean;
  public durationInSeconds = 4;
  currentDate: string;
  currentTime: string;


  constructor(private formBuilder: FormBuilder,
    private authService: AuthenticateDataService,
    private route: Router,
    private _snackBar: MatSnackBar,
    private notifyService: NotificationsService
  ) { }

  ngOnInit() {
    this.getTime();
    this.registerForm = this.formBuilder.group({
      userName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      termsAgree: ['', Validators.required],
      userStatus: [0, Validators.required],
      signupDate: ['', Validators.required],
      signupTime: ['', Validators.required]
    });
  }

  getTime() {
    const currentDate = new Date();
    this.currentTime = formatDate(currentDate, 'hh:mm a', 'en-US');
    this.currentDate = formatDate(currentDate, 'MMMM d, y', 'en-US');
  }

  registerUser() {
    this.loading = true;
    const countryCode = '+234';
    let userPhone = this.registerForm.value.phoneNumber;
    const username = this.registerForm.value.userName.toLowerCase();
    const lastname = this.registerForm.value.lastName.toLowerCase();

    localStorage.removeItem('userVerification');
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const validateCode = randomCode.slice(0, 6);
    localStorage.setItem('userVerification', validateCode);

    if (JSON.stringify(this.registerForm.value.phoneNumber).substring(0, 4) === countryCode) {
      userPhone = this.registerForm.value.phoneNumber.toString();
    } else {
      userPhone = countryCode + this.registerForm.value.phoneNumber.toString();
    }
    this.registerForm.patchValue({
      verificationCode: validateCode, phoneNumber: userPhone,
      userName: username, lastName: lastname, signupDate: this.currentDate, signupTime: this.currentTime
    });

   

    if (this.registerForm.value.userName && this.registerForm.value.lastName
      && this.registerForm.value.phoneNumber && this.registerForm.value.password && this.registerForm.value.email
      && this.registerForm.value.role) {
      const registerValues = this.registerForm.value;
      this.authService.register(registerValues)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
            localStorage.setItem('registeredUser', JSON.stringify(registerValues));
            this.route.navigate(['verify']);
            this.loading = false;
            this.registerForm.reset();
        },
          error => {
            this.loading = false;
            this.openErrorMessage(error);
          });
    } else {
      this.openErrorMessage('All fields are required');
      this.loading = false;
    }

  }
  openErrorMessage(errorMessage) {
    // this._snackBar.openFromComponent(ErrorMessageComponent, {
    //   duration: this.durationInSeconds * 1000,
    //   panelClass: ['dark-snackbar-error'],
    //   data: errorMessage
    // });

    this.notifyService.showErrorMessage(errorMessage);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
