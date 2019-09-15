import { BookseatrequestComponent } from './bookseatrequest/bookseatrequest.component';
import { AvailabledriversComponent } from './availabledrivers/availabledrivers.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_gaurd/auth.guard';
import { RiderlandingComponent } from './riderlanding/riderlanding.component';
import { RiderlinkComponent } from './riderlink/riderlink.component';
import { DriverdetailsComponent } from './driverdetails/driverdetails.component';


const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  {
    path: 'home/:id',
    component: RiderlandingComponent,
    canActivate: [AuthGuard],
    data: {role: 'Rider'},
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'available-drivers', component:  AvailabledriversComponent},
      { path: 'driver-details', component: DriverdetailsComponent },
      // { path: 'detail-report', component: DetailReportComponent }

    ],
  },

  {
    path: 'bookSeat',
    component: BookseatrequestComponent,
    canActivate: [AuthGuard],
    data: {role: 'Rider'}
  },
  {
    path: 'riderLink',
    component: RiderlinkComponent,
    canActivate: [AuthGuard],
    data: {role: 'Rider'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiderRoutingModule { }
