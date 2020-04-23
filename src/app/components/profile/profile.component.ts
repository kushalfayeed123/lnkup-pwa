import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverDataDataService } from 'src/app/services/data/driver-data/driver-data.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { Bank } from 'src/app/models/Bank';
import { PaymentDataService } from 'src/app/services/data/payment/payment.data.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { AngularFireStorageReference, AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { Select, Store } from '@ngxs/store';
import { AppState } from 'src/app/state/app.state';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';
import { GetCurrentUser } from 'src/app/state/app.actions';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class ProfileComponent implements OnInit, OnDestroy {

  @Select(AppState.getCurrentUser) currentUser$: Observable<Users>;
  @Select(AppState.getLoggedInUser) loggedInUser$: Observable<Users>;



  image = '';
  routeId: any;
  user: any;
  ref: any;
  openDialogue: boolean;
  loading: boolean;
  private unsubscribe$ = new Subject<void>();
  imageId: any;
  userImage: { file: string; };
  showBackupImg: boolean;
  registerCarDetails: FormGroup;
  carLicenseForm: FormGroup;
  userId: any;
  userRole: any;
  license: { image: string; };
  licenseImage: any;
  licenseLoad: boolean;
  driverDataId: any;
  driverData: any;
  isDriver: boolean;
  isImage: boolean;
  banks: Bank;
  userName: any;
  userPhone: any;
  email: any;
  secKey: any;
  driverAccountId: any;
  uploadProgress: Observable<number>;
  downloadURL: Observable<string>;

  uploadRef: AngularFireStorageReference;
  task: AngularFireUploadTask;
  private subs = new SubSink();
  currentUser: Users;
  loggedInUser: Users;



  constructor(private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private formBuilder: FormBuilder,
    private driverDataService: DriverDataDataService,
    private notifyService: NotificationsService,
    private paymentService: PaymentDataService,
    private afStorage: AngularFireStorage,
    private store: Store
  ) { }

  ngOnInit() {
    this.subs.add(
      this.currentUser$.subscribe(user => {
        this.currentUser = user;
      }),
      this.loggedInUser$.subscribe(res => {
        this.loggedInUser = res;
      })
    );
    this.isImage = false;
    this.registerCarDetails = this.formBuilder.group({
      carType: ['', Validators.required],
      carDocument2: ['', Validators.required],
      driverId: ['', Validators.required],
      rating: [0, Validators.required],
      rideDeclineCount: [0, Validators.required],
      driverSeatCapacity: [4, Validators.required],
      maxCarSeatNumber: [4, Validators.required],
      workAddress: ['', Validators.required],
      driverBank: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      PaymentAccountId: ['', [Validators.required]],
      licenseUrl: ['', [Validators.required]]

    });
    this.carLicenseForm = this.formBuilder.group({
      driverId: ['', Validators.required],
      carLicense: ['', Validators.required],
    });
    this.route.params.subscribe(p => {
      this.routeId = p.id;
      this.getDriverData();

    });
    this.getUserData();
    this.getBanksLookup();
    this.getSecKey();
  }

  getUserData() {
    this.userRole = this.currentUser.role;
    const referral = this.currentUser.token;
    this.ref = referral.slice(0, 6).toUpperCase();
    if (this.userRole === 'Driver') {
      this.isDriver = true;
    } else {
      this.isDriver = false;
    }
  }

  getDriverData() {
    this.driverDataService.getDriverByDriverId(this.routeId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (!res) {
          return;
        } else {
          this.driverData = res;
          this.driverDataId = res.driverDataId;
        }
      }, error => {
        console.log(error);
      });
  }


  openUploadDialogue() {
    this.openDialogue = !this.openDialogue;
  }



  upload(event, type) {
    const id = Math.random().toString(36).substring(2);
    this.uploadRef = this.afStorage.ref(id);
    this.task = this.uploadRef.put(event.target.files[0]);
    this.uploadProgress = this.task.percentageChanges();
    this.task.snapshotChanges().pipe(
      finalize(() => {
        const downloadURL = this.uploadRef.getDownloadURL();
        if (downloadURL) {
          downloadURL.subscribe(res => {
            if (type === 'profile') {
              this.uploadProfileImage(res);
            } else {
              this.licenseImage = res;
            }
          });
        }
      })
    ).subscribe();
  }

  uploadProfileImage(url) {
    const userStatusData = {
      userId: this.currentUser.userId,
      email: this.currentUser.email,
      userName: this.currentUser.userName,
      lastName: this.currentUser.lastName,
      phoneNumber: this.currentUser.phoneNumber,
      token: this.currentUser.token,
      userStatus: this.currentUser.userStatus,
      role: this.loggedInUser.role,
      signupDate: this.currentUser.signupDate,
      signupTime: this.currentUser.signupTime,
      verificationCode: this.currentUser.verificationCode,
      imageUrl: url
    };
    this.authService.update(userStatusData).pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        const message = 'Your profile picture uploaded successfully.';
        this.notifyService.showSuccessMessage(message);
        this.store.dispatch(new GetCurrentUser(this.currentUser.userId));
      }, err => {
        const message = 'Your profile image failed to upload, please try uploading again.';
        this.notifyService.showErrorMessage(message);
      });
  }

  // uploadImage(event) {
  //   this.loading = true;
  //   if (!this.isImage) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = async () => {
  //       const file = reader.result.toString().split(',')[1];
  //       const model = { File: file };
  //       const image = { image: model.File, userId: this.routeId };
  //       this.authService.uploadUserImage(image).subscribe(
  //         data => {
  //           this.loading = false;
  //           this.openDialogue = false;
  //           const message = 'Your profile picture uploaded successfully.';
  //           this.notifyService.showSuccessMessage(message);
  //           this.openDialogue = false;
  //         },
  //         error => {
  //           this.loading = false;
  //           const message = 'Your profile image failed to upload, please try uploading again.';
  //           this.notifyService.showErrorMessage(message);
  //         }
  //       );
  //     };
  //   } else {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = async () => {
  //       this.loading = true;
  //       const file = reader.result.toString().split(',')[1];
  //       const model = { File: file };
  //       const image = { image: model.File };
  //       this.authService
  //         .updateUserImage(this.routeId, image)
  //         .subscribe(
  //           img => {
  //             const message = 'Your profile picture uploaded successfully';
  //             this.notifyService.showSuccessMessage(message);
  //             this.loading = false;
  //             this.openDialogue = false;
  //           },
  //           error => {
  //             const message = 'Your profile image failed to upload, please try uploading again shortly.';
  //             this.notifyService.showErrorMessage(message);
  //             this.loading = false;
  //           }
  //         );
  //     };
  //   }
  // }

  registerCar() {
    this.licenseLoad = true;
    const message = 'Your information is being uploaded.';
    const successMessage = 'Thank you! Our team will review and get back to you when your submission has been approved.';
    const errorMessage = 'We were unable to update your profile due to some errors, please try again shortly.';
    if (this.driverData === undefined) {
      this.notifyService.showInfoMessage(message);
      this.registerCarDetails.patchValue({ driverId: this.userId, PaymentAccountId: this.driverAccountId, licenseUrl: this.licenseImage });
      const registerCar = this.registerCarDetails.value;
      this.driverDataService.createDriverData(registerCar)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
          this.licenseLoad = false;
          this.notifyService.showSuccessMessage(successMessage);
          this.openDialogue = false;
        }, error => {
          this.licenseLoad = false;
          this.notifyService.showErrorMessage(errorMessage);
        });

    } else {
      this.licenseLoad = false;
      const declineMessage = 'You have previously uploaded your details, to update your details please send us a message on our support channel.';
      this.notifyService.showErrorMessage(declineMessage);
    }
    // this.registerCarDetails.value.carType = this.driverData.carType;
    // this.registerCarDetails.value.carDocument2 = this.driverData.carDocument2;


    // const driverDataId = localStorage.getItem('driverDataId');
    // this.driverDataService.updateDriverData(driverDataId, registerCar)
    // .pipe(takeUntil(this.unsubscribe$))
    // .subscribe(res => {
    //   this.notifyService.showSuccessMessage(successMessage);
    //   this.licenseLoad = false;
    //   this.openDialogue = false;
    // }, error => {
    //   this.notifyService.showErrorMessage(errorMessage);
    //   this.licenseLoad = false;
    // });
  }

  // uploadLicense(templateUrl) {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(event.target.files[0]);
  //   reader.onload = async () => {
  //     this.licenseLoad = true;
  //     const file = reader.result.toString().split(',')[1];
  //     const model = { File: file };
  //     const image = { image: model.File };
  //     this.carLicenseForm.patchValue({ licenseImage: url, driverId: this.userId });
  //     if (image) {
  //       // this.notifyService.showInfoMessage('Your License is uploading, this will take a while.');
  //       this.driverDataService.uploadDriverLicense(this.carLicenseForm.value)
  //         .pipe(takeUntil(this.unsubscribe$))
  //         .subscribe(res => {
  //           this.notifyService.showSuccessMessage('Your license has been uploaded successfully.');
  //           this.licenseLoad = false;
  //         }, error => {
  //           this.notifyService.showErrorMessage('An error occured. This might be network related.');
  //         });
  //     }
  //   };

  // }

  getBanksLookup() {
    this.driverDataService.getBanksLookup()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(bank => {
        this.banks = bank.data.Banks;
      });
  }

  getSecKey() {
    this.paymentService.getSecKey()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(key => {
        this.secKey = key.encryptionKey;
      });
  }

  creatDriverAccount() {
    const accountPayload = {
      account_bank: this.registerCarDetails.value.driverBank,
      account_number: this.registerCarDetails.value.accountNumber,
      business_name: this.userName,
      business_email: this.email,
      business_mobile: this.userPhone,
      seckey: this.secKey,
      split_type: 'percentage',
      split_value: '0.20',
      country: 'NG'
    };
    this.driverDataService.createDriverAccount(accountPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(acc => {
        if (acc) {
          this.driverAccountId = acc.data.subaccount_id;
          this.registerCar();
        } else {
          return;
        }
      }, err => {
        this.notifyService.showErrorMessage(err);
      });
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
