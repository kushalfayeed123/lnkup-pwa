import { AgmDirectionModule } from 'agm-direction';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { AngularMaterialModule } from './angular-material.module';
import { SuccessMessageComponent } from './components/success-message/success-message.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { PushNotificationComponent } from './components/push-notification/push-notification.component';
@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    OnboardingComponent,
    RegisterUserComponent,
    AuthenticateUserComponent,
    VerifycodeComponent,
    SuccessMessageComponent,
    ErrorMessageComponent,
    PushNotificationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAftkH0NJdTC0ZoN7A3cvG-7-z4d9oECnQ',
    }),
    AgmDirectionModule,
    MatGoogleMapsAutocompleteModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    BroadcastService,
    GoogleMapsAPIWrapper,
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {provide: AuthenticateDataService, useClass: AuthenticateWebService}
  ],
  bootstrap: [AppComponent],
  entryComponents: [SuccessMessageComponent, ErrorMessageComponent]

})
export class AppModule { }
