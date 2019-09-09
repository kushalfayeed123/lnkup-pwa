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
import { DriverdetailsComponent } from './driverdetails/driverdetails.component';
import { BookseatrequestComponent } from './bookseatrequest/bookseatrequest.component';
import {NumberPickerModule} from 'ng-number-picker';



@NgModule({
  declarations: [RiderlandingComponent, AvailabledriversComponent, DriverdetailsComponent, BookseatrequestComponent],
  imports: [
    CommonModule,
    RiderRoutingModule,
    NgxUsefulSwiperModule,
    AgmCoreModule,
    AgmDirectionModule,
    FormsModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    AngularMaterialModule,
    NumberPickerModule
  ]
})
export class RiderModule { }
