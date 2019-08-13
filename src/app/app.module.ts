import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { AuthenticateWebService } from './services/data/authenticate.web.service';
import { AuthenticateDataService } from './services/data/authenticate.data.service';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { AuthenticateUserComponent } from './components/authenticate-user/authenticate-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VerifycodeComponent } from './components/verifycode/verifycode.component';
import { BroadcastService } from './services/business/broadcastdata.service';

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    OnboardingComponent,
    RegisterUserComponent,
    AuthenticateUserComponent,
    VerifycodeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    BroadcastService,
    
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {provide: AuthenticateDataService, useClass: AuthenticateWebService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
