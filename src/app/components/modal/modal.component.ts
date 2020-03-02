import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from 'src/app/models/DialogData';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  showPrice: boolean;
  showCancel: boolean;

  constructor( public dialogRef: MatDialogRef<ModalComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
               private braodcastService: BroadcastService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    if (this.data.price == null) {
      this.showPrice = false;
    } else {
      this.showPrice = true;
    }
    this.showCancel = this.data.showCancel;
  }

  onNoClick(status) {
    this.braodcastService.publishModalStatus(status);
    this.dialogRef.close();
  }

}
