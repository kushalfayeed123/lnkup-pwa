import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  image: string;
  routeId: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.routeId = p['id'];
    });
  }


  // uploadStorePhoto(event) {
  //   this.getStoreImage();
  //   if (this.storeImage == null) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = async () => {
  //       const file = reader.result.toString().split(',')[1];
  //       const model = { File: file };
  //       this.image = model.File;
  //       const image = { file: this.image, UserId: this.routeId };
  //       this.adminService.uploadStoreImage(image).subscribe(
  //         data => {
  //           this.loading = true;
  //           alert('Store profile picture uploaded successfully');
  //         },
  //         error => {
  //           alert('An error occured, please try again shortly');
  //         }
  //       );
  //     };
  //     setTimeout(() => {
  //       this.getStoreImage();
  //       this.loading = false;
  //     }, 15000);
  //   } else {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = async () => {
  //       this.loading = true;
  //       const file = reader.result.toString().split(',')[1];
  //       const model = { File: file };
  //       this.productUrl = { file: model.File };
  //       this.adminService
  //         .updateStoreImage(this.productUrl, this.routeId)
  //         .subscribe(
  //           img => {},
  //           error => {
  //             alert('An error occured, please try again shortly');
  //             this.loading = false;
  //           }
  //         );
  //     };
  //     setTimeout(() => {
  //       alert('Store profile picture uploaded successfully');
  //       this.getStoreImage();
  //       this.loading = false;
  //     }, 15000);
  //   }
  // }

  // async getStoreImage() {
  //   await this.adminService.getStoreImageById(this.routeId).subscribe(img => {
  //     if (img) {
  //       this.storeImage = 'data:image/png;base64,' + img.file;
  //     } else {
  //       return;
  //     }

  //   });
  // }

}
