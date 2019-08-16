import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { fadeInAnimation } from 'src/app/services/misc/animation';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})
export class RegisterUserComponent implements OnInit, OnDestroy {

  public registerForm : FormGroup;
  private unsubscribe$ = new Subject<void>();


  constructor( private formBuilder: FormBuilder,
     private authService: AuthenticateDataService,
     private route: Router,
     private broadcastService: BroadcastService) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', Validators.required],
      verificationCode : ['', Validators.required],
      phoneNumber: ['', Validators.required],
      termsAgree: ['', Validators.required],
      userStatus: [0, Validators.required]
    })
  }

  registerUser(){
    localStorage.removeItem('userVerification')
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const validateCode = randomCode.slice(0,3) + '-' + randomCode.slice(3,6);
    localStorage.setItem('userVerification', validateCode);
    this.registerForm.patchValue({verificationCode: validateCode});
    const registerValues = this.registerForm.value;
    this.authService.register(registerValues)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
       localStorage.setItem('registeredUser', JSON.stringify(registerValues))
        this.route.navigate(["verify"]);
    }, 
    error => {
      console.error('An error occured');
    });
  }
  navigateToAuthentication(){
    this.route.navigate(["auth"]) 
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
