import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { MatSnackBar } from '@angular/material';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { UserPaymentToken } from 'src/app/models/payment';

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss'],
  animations: [slideInAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInAnimation]': '' }
})
export class AuthenticateUserComponent implements OnInit, OnDestroy {

  public loginForm: FormGroup;
  public returnUrl: any;
  private unsubscribe$ = new Subject<void>();
  public error: any;
  public loggedInUser: any;
  public userRole = {} as any;
  public loading: boolean;
  public durationInSeconds = 4;
  message: string;
  userPaymentData: UserPaymentToken;


  constructor(private router: Router,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              // tslint:disable-next-line: variable-name
              private _snackBar: MatSnackBar,
              private authenticate: AuthenticateDataService,
              private toastService: NotificationsService) { }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    // get return url from route or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convinience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.loading = true;
    this.message = 'Please check your username or password and try again.';
    // // stop here if form is invalid
    if (this.loginForm.invalid) {
      setTimeout(() => {
        this.loading = false;
        this.toastService.showErrorMessage(this.message);
      }, 3000);
      return;
    }
    const userName = this.f.username.value.toLowerCase();
    this.authenticate.login(userName, this.f.password.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        data => {
          this.updateUserStatus();
          this.redirectUser();
          localStorage.removeItem('registeredUser');
          this.loading = false;
        },
        error => {
          this.error = error;
          setTimeout(() => {
            this.loading = false;
            this.toastService.showErrorMessage(this.message);
          }, 3000);
        }
      );
  }
  openErrorMessage() {
    this._snackBar.openFromComponent(ErrorMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-error']
    });
  }
  updateUserStatus() {
    this.loading = true;
    const registeredUser = JSON.parse(localStorage.getItem('currentUser'));
    const userPass = this.f.password.value;
    if (registeredUser == null) {
      setTimeout(() => {
        this.loading = false;
        this.openErrorMessage();
      }, 3000);
      return;
    } else {
      const userData = registeredUser;
      const userRole = this.authenticate.decode();

      const userStatusData = {id: userData.id,
        email: userData.email,
        username: userData.userName,
        phoneNumber: userData.phoneNumber,
        password: userPass.password,
        token: userData.token,
        userStatus: 1,
        role: userRole.role
        };
      this.authenticate.update(userStatusData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(data => {
        });
    }
  }
  redirectUser() {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userRole = this.authenticate.decode();
    const userId = loggedInUser.id;
    if (this.userRole.role === 'Rider') {
      this.router.navigate(['rider/home', userId]);
    } else if (this.userRole.role ===  'Driver') {
      this.router.navigate(['driver/home', userId]);
    } else if (this.userRole.role === 'Admin') {
      this.router.navigate(['admin/dashboard', userId]);
    } else {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
