import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverdashboardComponent } from '../driver/driverdashboard/driverdashboard.component';
import { AuthGuard } from '../_gaurd/auth.guard';
import { RiderRequestComponent } from './rider-request/rider-request.component';
import { OnboardingComponent } from '../components/onboarding/onboarding.component';


const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  // { path: 'onboarding', component: OnboardingComponent},
  {
    path: 'home/:id',
    component: DriverdashboardComponent,
    canActivate: [AuthGuard],
    data: {role: 'Driver'}
  },

  {
    path: 'rider-request',
    component: RiderRequestComponent,
    canActivate: [AuthGuard],
    data: {role: 'Driver'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
