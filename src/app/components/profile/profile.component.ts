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
  userId: any;
  userRole: any;
  license: { image: string; };
  licenseImage: any;
  licenseLoad: boolean;
  driverDataId: any;
  driverData: import("c:/sandbox/lnkup-mobile/src/app/models/DriverData").DriverData;


  constructor(private route: ActivatedRoute,
              private authService: AuthenticateDataService,
              private formBuilder: FormBuilder,
              private driverDataService: DriverDataDataService,
              private notifyService: NotificationsService
     ) { }

  ngOnInit() {
    this.registerCarDetails = this.formBuilder.group({
      carType: ['', Validators.required],
      carLicense: ['', Validators.required],
      carDocument1: ['', Validators.required],
      carDocument2: ['', Validators.required],
      driverId: ['', Validators.required],
      rating: [0, Validators.required],
      rideDeclineCount: [0, Validators.required],
      driverSeatCapacity: [4, Validators.required],
      maxCarSeatNumber: [4, Validators.required],
      workAddress: ['', Validators.required]
    });
    this.route.params.subscribe(p => {
      this.routeId = p.id;
    });
    this.getUserProfileImage();
    this.getUserData();
  }

  getUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.user = user;
    this.userId = user.id;
    this.userRole = user.role;
    const referral = user.token;
    this.ref = referral.slice(0, 6).toUpperCase();
    this.driverDataService.getDriverByDriverId(this.routeId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.driverData = res;
      this.driverDataId = res.driverDataId;
    });
  }


  openUploadDialogue() {
    this.openDialogue = !this.openDialogue;
  }

  async getUserProfileImage() {
    await this.authService.getUserImage(this.routeId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(img => {
      if (img == null) {
        return;
      } else {
        this.image = 'data:image/png;base64,' + img.image;
        this.imageId = img.imageId;
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
          },
          error => {
            this.loading = false;
            const message = 'Your profile image failed to upload, please try uploading again shortly.';
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
    const message = 'Your details are being uploaded, this might take a while.';
    const successMessage = 'Your profile has been updated.';
    const errorMessage = 'We were not able to update your profile due to some errors, please try again shortly.';
    // this.registerCarDetails.value.carType = this.driverData.carType;
    // this.registerCarDetails.value.carDocument2 = this.driverData.carDocument2;

    this.notifyService.showInfoMessage(message);
    this.registerCarDetails.patchValue({driverId: this.userId});
    const registerCar = this.registerCarDetails.value;
    if (this.driverData) {
      const driverDataId =localStorage.getItem('driverDataId');
      this.driverDataService.updateDriverData(driverDataId, registerCar)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.notifyService.showSuccessMessage(successMessage);
        this.licenseLoad = false;
      }, error => {
        this.notifyService.showErrorMessage(errorMessage);
        this.licenseLoad = false;
      });
    } else {
      this.driverDataService.createDriverData(registerCar)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.licenseLoad = false;
        this.notifyService.showSuccessMessage(successMessage);
        console.log(res);
      }, error => {
        this.licenseLoad = false;
        this.notifyService.showErrorMessage(errorMessage);
      });
    }
  }

  uploadLicense(event) {
    this.loading = true;
    const fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]);
    fileReader.onload = async () => {
        const file = fileReader.result.toString().split(',')[1];
        const model = { File: file };
        this.license = { image: model.File };
        this.licenseImage = 'data:image/png;base64,' + this.license.image;
        this.registerCarDetails.patchValue({carLicense: this.license.image});
        this.loading = false;
      };
    if (this.license !== null) {
        console.log('image has been uploaded', event.target);
      }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
