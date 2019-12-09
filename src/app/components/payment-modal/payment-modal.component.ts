import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData, PaymentDialogData } from 'src/app/models/DialogData';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PaymentModalComponent>,
              public sanitizer: DomSanitizer,
              @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
