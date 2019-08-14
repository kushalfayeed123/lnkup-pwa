import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiderRoutingModule } from './rider-routing.module';
import { RiderlandingComponent } from './riderlanding/riderlanding.component';


@NgModule({
  declarations: [RiderlandingComponent],
  imports: [
    CommonModule,
    RiderRoutingModule
  ]
})
export class RiderModule { }
