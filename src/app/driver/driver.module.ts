import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverRoutingModule } from './driver-routing.module';
import { DriverdashboardComponent } from './driverdashboard/driverdashboard.component';


@NgModule({
  declarations: [DriverdashboardComponent],
  imports: [
    CommonModule,
    DriverRoutingModule
  ]
})
export class DriverModule { }
