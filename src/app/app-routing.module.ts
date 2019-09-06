import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { AuthenticateUserComponent } from './components/authenticate-user/authenticate-user.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { VerifycodeComponent } from './components/verifycode/verifycode.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'verify', component: VerifycodeComponent },
  { path: 'login', component: AuthenticateUserComponent },
  { path: 'register', component: RegisterUserComponent },
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
  { path: '**',
  component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

 }
