import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiderRoutingModule } from './rider-routing.module';
import { RiderlandingComponent } from './riderlanding/riderlanding.component';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [RiderlandingComponent],
  imports: [
    CommonModule,
    RiderRoutingModule,
    AgmCoreModule,
    AgmDirectionModule, 
    FormsModule,
    ReactiveFormsModule, 
  ]
})
export class RiderModule { }
