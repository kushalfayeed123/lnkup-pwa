import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { AuthenticateUserComponent } from './components/authenticate-user/authenticate-user.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { VerifycodeComponent } from './components/verifycode/verifycode.component';


const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'verify', component: VerifycodeComponent },
  { path: 'auth', component: AuthenticateUserComponent },
  { path: 'register', component: RegisterUserComponent },
  { path: '**', redirectTo: 'register', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
  
 }
