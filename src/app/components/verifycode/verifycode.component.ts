import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-verifycode',
  templateUrl: './verifycode.component.html',
  styleUrls: ['./verifycode.component.scss']
})
export class VerifycodeComponent implements OnInit, OnDestroy {
  public verifyForm: FormGroup;
  private unsubscribe$ = new Subject<void>();


  constructor(private formBuilder: FormBuilder,
    private route: Router) { }

  ngOnInit() {

    this.verifyForm = this.formBuilder.group({
      verifycode: ['', Validators.required]
    })
  }


  verifyUser() {
    const storedVerifyCode = localStorage.getItem('userVerification');
    const userVerifyCode = this.verifyForm.value;
    const usercode = userVerifyCode.verifycode;
    if (storedVerifyCode === usercode) {
      alert('We have successfully verified your phone. Click the Ok button to login.')
      this.authenticateUser();
    }
  }

  authenticateUser() {
    this.route.navigate(["auth"]);
  }
  

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
