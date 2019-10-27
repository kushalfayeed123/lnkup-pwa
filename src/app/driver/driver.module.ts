import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverRoutingModule } from './driver-routing.module';
import { DriverdashboardComponent } from './driverdashboard/driverdashboard.component';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AngularMaterialModule } from '../angular-material.module';
import { DriverTripCreateComponent } from './driver-trip-create/driver-trip-create.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { RiderRequestComponent } from './rider-request/rider-request.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { DriverTripNavigateComponent } from './driver-trip-navigate/driver-trip-navigate.component';



@NgModule({
  declarations: [DriverdashboardComponent,
                 DriverTripCreateComponent,
                 RiderRequestComponent,
                 DriverTripNavigateComponent],
  imports: [
    CommonModule,
    DriverRoutingModule,
    AgmCoreModule,
    AgmDirectionModule,
    FormsModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    AngularMaterialModule,
    NgxMaterialTimepickerModule,
    NgxUsefulSwiperModule,
  ]
})
export class DriverModule { }
