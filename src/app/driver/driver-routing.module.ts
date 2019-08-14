import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverdashboardComponent } from '../driver/driverdashboard/driverdashboard.component';
import { AuthGuard } from '../_gaurd/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  {
    path: 'dashboard/:id',
    component: DriverdashboardComponent,
    canActivate: [AuthGuard],
    data: {role: 'Driver'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
