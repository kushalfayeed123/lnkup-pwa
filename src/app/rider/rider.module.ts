import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiderRoutingModule } from './rider-routing.module';
import { RiderlandingComponent } from './riderlanding/riderlanding.component';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AngularMaterialModule } from '../angular-material.module';
import { AvailabledriversComponent } from './availabledrivers/availabledrivers.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';



@NgModule({
  declarations: [RiderlandingComponent, AvailabledriversComponent],
  imports: [
    CommonModule,
    RiderRoutingModule,
    NgxUsefulSwiperModule,
    AgmCoreModule,
    AgmDirectionModule,
    FormsModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    AngularMaterialModule
  ]
})
export class RiderModule { }
