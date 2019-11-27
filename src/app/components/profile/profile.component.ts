import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverDataDataService } from 'src/app/services/data/driver-data/driver-data.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
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


  constructor(private route: ActivatedRoute,
              private authService: AuthenticateDataService,
              private formBuilder: FormBuilder,
              private driverDataService: DriverDataDataService,
              private notifyService: NotificationsService
     ) { }

  ngOnInit() {
    this.isImage = false;
    this.registerCarDetails = this.formBuilder.group({
      carType: ['', Validators.required],
      carDocument2: ['', Validators.required],
      driverId: ['', Validators.required],
      rating: [0, Validators.required],
      rideDeclineCount: [0, Validators.required],
      driverSeatCapacity: [4, Validators.required],
      maxCarSeatNumber: [4, Validators.required],
      workAddress: ['', Validators.required]
    });
    this.carLicenseForm = this.formBuilder.group({
      driverId: ['', Validators.required],
      carLicense: ['', Validators.required],
    });
    this.route.params.subscribe(p => {
      this.routeId = p.id;
      this.getDriverData();

    });
    this.getUserProfileImage();
    this.getUserData();
  }

  getUserData() {
    console.log('is image', this.isImage);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.user = user;
    this.userId = user.id;
    this.userRole = user.role;
    const referral = user.token;
    this.ref = referral.slice(0, 6).toUpperCase();
    if ( this.userRole === 'Driver') {
      this.isDriver = true;
    } else {
      this.isDriver = false;
    }
  }

  getDriverData() {
    this.driverDataService.getDriverByDriverId(this.routeId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.driverData = res;
      this.driverDataId = res.driverDataId;
    }, error => {
      console.log(error);
    });
  }


  openUploadDialogue() {
    this.openDialogue = !this.openDialogue;
  }

   getUserProfileImage() {
     this.authService.getUserImage(this.routeId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(img => {
      this.isImage = false;

      if (img == null) {
        this.isImage = false;
      } else {
        this.image = 'data:image/png;base64,' + img.image;
        this.imageId = img.imageId;
        this.isImage = true;
      }
    });
  }

  uploadImage(event) {
    this.loading = true;
    this.getUserProfileImage();
    if (this.image  == null) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = async () => {
        const file = reader.result.toString().split(',')[1];
        const model = { File: file };
        const image = { image: model.File, userId: this.routeId };
        this.authService.uploadUserImage(image).subscribe(
          data => {
            this.getUserProfileImage();
            this.loading = false;
            this.openDialogue = false;
            const message = 'Your profile picture uploaded successfully.';
            this.notifyService.showSuccessMessage(message);
            this.openDialogue = false;
          },
          error => {
            this.loading = false;
            const message = 'Your profile image failed to upload, please try uploading again.';
            this.notifyService.showErrorMessage(message);
          }
        );
    };
   } else {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = async () => {
        this.loading = true;
        const file = reader.result.toString().split(',')[1];
        const model = { File: file };
        const image = { image: model.File };
        this.authService
          .updateUserImage(this.routeId, image)
          .subscribe(
            img => {
                    const message = 'Your profile picture uploaded successfully';
                    this.notifyService.showSuccessMessage(message);
                    this.getUserProfileImage();
                    this.loading = false;
                    this.openDialogue = false;
                  },
            error => {
              const message = 'Your profile image failed to upload, please try uploading again shortly.';
              this.notifyService.showErrorMessage(message);
              this.loading = false;
            }
          );
      };
    }
  }

  registerCar() {
    this.licenseLoad = true;
    const message = 'Your information is being uploaded.';
    const successMessage = 'Thank you! Our team will review and get back to you when your submission has been approved.';
    const errorMessage = 'We were unable to update your profile due to some errors, please try again shortly.';
    if (this.driverData === undefined) {
       this.notifyService.showInfoMessage(message);
       this.registerCarDetails.patchValue({driverId: this.userId});
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

  uploadLicense(event) {
    const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = async () => {
        this.licenseLoad = true;
        const file = reader.result.toString().split(',')[1];
        const model = { File: file };
        const image = { image: model.File };
        this.carLicenseForm.patchValue({carLicense: image.image, driverId: this.userId});
        if (image) {
          // this.notifyService.showInfoMessage('Your License is uploading, this will take a while.');
          this.driverDataService.uploadDriverLicense(this.carLicenseForm.value)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(res => {
            this.notifyService.showSuccessMessage('Your license has been uploaded successfully.');
            this.licenseLoad = false;
          }, error => {
            this.notifyService.showErrorMessage('An error occured. This might be network related.')
          });
        }
      };
   
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
