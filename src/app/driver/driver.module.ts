import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverRoutingModule } from './driver-routing.module';
import { DriverdashboardComponent } from './driverdashboard/driverdashboard.component';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AngularMaterialModule } from '../angular-material.module';


@NgModule({
  declarations: [DriverdashboardComponent],
  imports: [
    CommonModule,
    DriverRoutingModule,
    AgmCoreModule,
    AgmDirectionModule,
    FormsModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    AngularMaterialModule,
  ]
})
export class DriverModule { }
