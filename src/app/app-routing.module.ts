import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { AuthenticateUserComponent } from './components/authenticate-user/authenticate-user.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { VerifycodeComponent } from './components/verifycode/verifycode.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SupportComponent } from './components/support/support.component';
import { TripsHistoryComponent } from './components/trips-history/trips-history.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    data: { animation: 'onboarding' }
  },
  {
    path: 'verify',
    component: VerifycodeComponent,
    data: { animation: 'verify' }
  },
  {
    path: 'login',
    component: AuthenticateUserComponent,
    data: { animation: 'login' }
  },
  {
    path: 'register',
    component: RegisterUserComponent,
    data: { animation: 'register' }
  },
  { path: 'payment/:id', component: PaymentComponent },
  { path: 'trips/:id', component: TripsHistoryComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'support/:id', component: SupportComponent },

  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule'
  },
  {
    path: 'rider',
    loadChildren: './rider/rider.module#RiderModule'
  },
  {
    path: 'driver',
    loadChildren: './driver/driver.module#DriverModule'
  },
  {
    path: '**',
    component: PagenotfoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
