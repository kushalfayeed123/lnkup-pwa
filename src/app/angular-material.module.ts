import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
   MatButtonModule,
   MatToolbarModule,
   MatIconModule,
   MatBadgeModule,
   MatSidenavModule,
   MatListModule,
   MatGridListModule,
   MatFormFieldModule,
   MatInputModule,
   MatSelectModule,
   MatRadioModule,
   MatNativeDateModule,
   MatChipsModule,
   MatTooltipModule,
   MatTableModule,
   MatPaginatorModule,
   MatCardModule,
   MatDialogModule,
   MatProgressBarModule,
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { NotificationComponent } from './components/notification/notification.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

@NgModule({
   imports: [
      CommonModule,
      MatButtonModule,
      MatToolbarModule,
      MatBottomSheetModule,
      MatIconModule,
      MatSidenavModule,
      MatBadgeModule,
      MatListModule,
      MatGridListModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatChipsModule,
      MatProgressBarModule,
      MatTooltipModule,
      MatTableModule,
      MatPaginatorModule,
      MatCardModule,
      MatProgressSpinnerModule,
      MatSnackBarModule,
      MatTabsModule,
      MatSidenavModule,
      MatCarouselModule,
      MatDialogModule
   ],
   declarations: [NotificationComponent, SpinnerComponent,
   ],
   exports: [
      MatButtonModule,
      MatToolbarModule,
      MatIconModule,
      MatSidenavModule,
      MatBadgeModule,
      MatListModule,
      MatGridListModule,
      MatInputModule,
      MatFormFieldModule,
      MatSelectModule,
      MatRadioModule,
      MatDatepickerModule,
      MatChipsModule,
      MatTooltipModule,
      MatTableModule,
      MatPaginatorModule,
      MatCardModule,
      MatProgressSpinnerModule,
      MatProgressBarModule,
      MatBottomSheetModule,
      MatSidenavModule,
      MatSnackBarModule,
      MatTabsModule,
      MatCarouselModule,
      MatDialogModule,
      NotificationComponent,
      SpinnerComponent,

   ],
   providers: [
      MatDatepickerModule,
   ]
})

export class AngularMaterialModule { }
