import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss']
})
export class AuthenticateUserComponent implements OnInit, OnDestroy {

  public loginForm: FormGroup
  public returnUrl: any;
  private unsubscribe$ = new Subject<void>();
  public error: any;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private broadCastService: BroadcastService,
    private authenticate: AuthenticateDataService) { }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convinience getter for easy access to form fields
  get f() {return this.loginForm.controls; }

  onSubmit() {
    
    // // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    
    this.authenticate.login(this.f.username.value, this.f.password.value)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      data => {
        this.updateUserStatus();
        this.router.navigate(["onboarding"]);
        localStorage.removeItem('registeredUser');
      },
      error => {
        this.error = error;
      }
    );
  }
  updateUserStatus(){
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.id;
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
    
      const userData = registeredUser;
      userData['userId'] = userId;
      userData['userStatus'] = 1;
    //   this.authenticate.update( userData)
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(data => {
    //     console.log('status was updated', data);
    // });
    console.log('user data', userData);
  }
  navigateToRegister(){
    this.router.navigate(["register"]);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
