import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { fadeInAnimation } from 'src/app/services/misc/animation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessMessageComponent } from '../success-message/success-message.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'app-verifycode',
  templateUrl: './verifycode.component.html',
  styleUrls: ['./verifycode.component.scss'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})
export class VerifycodeComponent implements OnInit, OnDestroy {
  public verifyForm: FormGroup;
  private unsubscribe$ = new Subject<void>();
  public loading: boolean;
  public durationInSeconds = 4;


  constructor(private formBuilder: FormBuilder,
    private route: Router,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {

    this.verifyForm = this.formBuilder.group({
      verifycode: ['', Validators.required]
    })
  }


  verifyUser() {
    this.loading =  true;
    const storedVerifyCode = localStorage.getItem('userVerification');
    const userVerifyCode = this.verifyForm.value;
    const usercode = userVerifyCode.verifycode;
    if (storedVerifyCode === usercode) {
     setTimeout(() => {
       this.loading = false;
       this.openSuccessMessage();
     }, 2000);
     setTimeout(() => {
      this.authenticateUser();
    }, 4000);
     
    } else {
      setTimeout(() => {
        this.loading = false;
        this.openErrorMessage();
      }, 4000);      
    }
   
  }
  openSuccessMessage() {
    this._snackBar.openFromComponent(SuccessMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar']
    });
  }
  openErrorMessage() {
    this._snackBar.openFromComponent(ErrorMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-error']
    });
  }
  authenticateUser() {
    this.route.navigate(["auth"]);
  }
  

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
