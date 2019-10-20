import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  image: string;
  routeId: any;
  user: any;
  ref: any;
  openDialogue: boolean;
  loading: boolean;
  private unsubscribe$ = new Subject<void>();
  imageId: any;
  userImage: { file: string; };


  constructor(private route: ActivatedRoute, private authService: AuthenticateDataService) { }

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.routeId = p['id'];
    });
    this.getUserProfileImage();
    this.getUserData();
  }

  getUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.user = user;
    const referral = user.token;
    this.ref = referral.slice(0, 6).toUpperCase();
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    if (userImage === null) {
      return;
    } else {
      this.image = userImage.image;
    }
  }
  openUploadDialogue(){
    this.openDialogue = !this.openDialogue;
  }
  async getUserProfileImage() {
    await this.authService.getUserImage(this.routeId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(img => {
      this.image = img.image;
      this.imageId = img.imageId;
      localStorage.setItem('userImage', JSON.stringify(img));
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
            this.image = model.File;
            this.getUserProfileImage();
            this.loading = false;
            this.openDialogue = false;
            console.log('User profile picture uploaded successfully', data);
          },
          error => {
            this.loading = false;
            console.log('An error occured, please try again shortly');
          }
        );
    };
   } else {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = async () => {
        this.loading = true;
        const userImage = JSON.parse(localStorage.getItem('userImage'));
        const imageId = userImage.imageId;
        const file = reader.result.toString().split(',')[1];
        const model = { File: file };
        this.image = model.File;
        const image = { image: this.image, imageId: this.imageId };
        this.authService
          .updateUserImage(imageId, image)
          .subscribe(
            img => {console.log('success');
                    this.getUserProfileImage();
                    this.loading = false;
                  },
            error => {
              console.log('An error occured, please try again shortly');
              this.loading = false;
            }
          );
      };
    }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
