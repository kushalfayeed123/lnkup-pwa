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
import { RiderlinkComponent } from './riderlink/riderlink.component';
import { SidebarModule } from 'ng-sidebar';
import { NotificationComponent } from '../components/notification/notification.component';
import { OnboardingComponent } from '../components/onboarding/onboarding.component';
import { AgmOverlays } from 'agm-overlays';


@NgModule({
  declarations: [RiderlandingComponent,
                 AvailabledriversComponent,
                 DriverdetailsComponent,
                 BookseatrequestComponent,
                 RiderlinkComponent,
                //  OnboardingComponent,


                 ],
  imports: [
    CommonModule,
    RiderRoutingModule,
    NgxUsefulSwiperModule,
    AgmCoreModule,
    AgmDirectionModule,
    FormsModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    AgmOverlays,
    AngularMaterialModule,
    SidebarModule.forRoot(),
  ]
})
export class RiderModule { }
