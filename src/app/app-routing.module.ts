import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { AuthenticateUserComponent } from './components/authenticate-user/authenticate-user.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';


const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashScreenComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'auth', component: AuthenticateUserComponent },
  { path: 'register', component: RegisterUserComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
  
 }
