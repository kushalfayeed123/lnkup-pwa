import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActiveTripWebService } from 'src/app/services/data/active-trip/active-trip.web.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveRiders } from 'src/app/models/ActiveRider';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { MatDialog } from '@angular/material';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Select, Store } from '@ngxs/store';
import { AppState } from 'src/app/state/app/app.state';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';
import { ShowLoader } from 'src/app/state/app/app.actions';
import { TripsState } from 'src/app/state/trip/trips.state';
import { GetChatObject } from 'src/app/state/chat/chat.action';

@Component({
  selector: 'app-rider-request',
  templateUrl: './rider-request.component.html',
  styleUrls: ['./rider-request.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class RiderRequestComponent implements OnInit, OnDestroy, AfterViewInit {

  @Select(AppState.getCurrentUser) user$: Observable<Users>;
  @Select(TripsState.getSelectedTrip) trips$: Observable<ActiveTrips>;



  private unsubscribe$ = new Subject<void>();
  private subs = new SubSink();
  public config: any = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    spaceBetween: 30
  };
  activeTripId: string;
  activeTrip: any;
  riderRequest: ActiveRiders[];
  feePerSeat: number;
  allowedRiderCount: number;
  actriveTripStatus: number;
  activeTripStatus: number;
  maxSeat: number;
  riderRequestLength: number;
  newAllowedRiderCount: number;
  riderNumber: string[] = [];
  loading: boolean;
  allRiderRequest: number;
  cancelLoading: boolean;
  currentUser: Users;

  constructor(private tripService: ActiveTripDataService,
    private notifyService: NotificationsService,
    private riderService: ActiveRiderDataService,
    private broadcastService: BroadcastService,
    public dialog: MatDialog,
    private router: Router,
    private store: Store) {
    this.notifyService.intiateConnection();
  }

  ngOnInit() {
    this.subs.add(
      this.user$.subscribe(res => {
        this.currentUser = res;
        this.getTripData();
      })
    )
  }
  ngAfterViewInit() {
    this.getDriverSuccessAlert();
    this.getDriverCancelAlert();
  }

  navToSupport(riderId, riderUserName) {
    this.store.dispatch(new ShowLoader(false));
    const chatObject = {
      groupName: riderUserName,
      receiverId: riderId,
      senderId: this.currentUser.userId,
      receiverName: riderUserName
    };
    this.store.dispatch(new GetChatObject(chatObject));
    this.router.navigate(['support', this.currentUser.userId]);
  }

  getTripData() {
    this.getActiveTrips();
    console.log('get trip');
  }

  async getDriverSuccessAlert() {
    await this.notifyService.successAlert
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(alert => {
        if (alert === true) {
          this.getActiveTrips();
        }
      });
  }

  async getDriverCancelAlert() {
    await this.notifyService.declineAlert
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(alert => {
        if (alert === true) {
          this.getActiveTrips();
        }
      });
  }

  getActiveTrips() {
    this.loading = true;
    const activeTrip = JSON.parse(localStorage.getItem('activeTrip'));
    this.activeTripId = activeTrip.tripId;
    this.getTripRequest(this.activeTripId);
  }

  getTripRequest(tripId) {
    this.tripService.getTripsById(tripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(activeTrip => {
        this.activeTrip = activeTrip;
        this.loading = false;
        console.log('active trip', this.activeTrip);
        const allRiderRequest = activeTrip.activeRiders.filter(x => x.tripStatus === '2');
        this.allRiderRequest = allRiderRequest.length;
        this.riderRequest = activeTrip.activeRiders;
        this.riderRequestLength = this.riderRequest.length;
        this.feePerSeat = activeTrip.aggregrateTripFee / activeTrip.maxRiderNumber;
        const allowedRiderCount = activeTrip.allowedRiderCount;
        this.allowedRiderCount = allowedRiderCount;
        this.maxSeat = activeTrip.maxRiderNumber;
        this.riderRequest.forEach(tel => {
          let riderNumber = tel.user.phoneNumber;
          riderNumber = riderNumber.slice(0, 4) + riderNumber.slice(5);
          this.riderNumber.push(riderNumber);
        });
        this.acceptTripRequest(this.riderRequest);
      });
  }
  acceptTripRequest(request) {
    const newRequest = request.filter(x => x.tripStatus === '1');
    this.tripProcess(true, newRequest);
  }

  tripProcess(status, newRequest) {
    if (status === true) {
      newRequest.forEach(rider => {
        const tripConnectionId = localStorage.getItem('clientConnectionId');
        const driverName = this.activeTrip.tripDriver.driver.userName;
        const pickup = this.activeTrip.tripPickup;
        const riderId = rider.activeRiderId;
        const receiver = rider.user.userName;
        const receiverId = rider.user.userId;
        const pickupTime = this.activeTrip.tripStartDateTime;
        const bookedSeat = rider.bookedSeat;
        const riderConnectionId = rider.riderConnectId;
        const message = `Meet ${driverName}
      at ${pickup} on or before ${pickupTime}`;
        const pushMessage = {
          title: 'LnkuP',
          body: message,
          click_action: `https://lnkupmob.azureedge.net/rider/home/${riderId}?riderLink=true`,
          receiverName: receiver
        };
        if (this.allowedRiderCount < 1) {
          this.newAllowedRiderCount = this.maxSeat - bookedSeat;
        } else {
          this.newAllowedRiderCount = this.allowedRiderCount - bookedSeat;
        }
        const startTime = localStorage.getItem('startTime');
        const activeRider = {
          tripStatus: '2',
          paymentStatus: '0',
          riderConnectId: riderConnectionId,
        };
        this.riderService.update(riderId, activeRider)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
          }, error => {
            console.log(error);
          });

        if (this.newAllowedRiderCount < 1) {
          this.activeTripStatus = 2;
        } else {
          this.activeTripStatus = 1;
        }
        const activeTrip = {
          driverTripStatus: this.activeTripStatus,
          allowedRiderCount: this.newAllowedRiderCount,
          tripConnectionId,
          actualTripEndDateTime: '',
          tripEndDateTime: '',
          actualTripStartDateTime: startTime.toString(),
          tripStartDateTime: pickupTime,
        };


        this.tripService.updateTrip(this.activeTripId, activeTrip)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(response => {
            this.notifyService.sendNotification(receiverId, pushMessage);
            setTimeout(() => {
              this.notifyService.sendAcceptMessage(receiverId, message);
            }, 5000);

          }, error => {
            console.log(error);
          });
      });
    } else {
      newRequest.forEach(rider => {
        const tripConnectionId = localStorage.getItem('clientConnectionId');
        const driverName = this.activeTrip.tripDriver.driver.userName;
        const riderId = rider.activeRiderId;
        const receiver = rider.user.userName;
        const receiverId = rider.user.userId;

        const riderConnectionId = rider.riderConnectId;
        const message = `${driverName}
        has cancelled this trip. Please search for another trip. Thank you.`;
        const pushMessage = {
          title: 'LnkuP',
          body: message,
          click_action: `https://lnkupmob.azureedge.net/rider/home/${riderId}?riderLink=true`,
          receiverName: receiver
        };
        const activeRider = {
          tripStatus: '3',
          paymentStatus: '0',
          riderConnectId: riderConnectionId,
        };
        this.riderService.update(riderId, activeRider)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
          }, error => {
            console.log(error);
          });
        const activeTrip = {
          driverTripStatus: 4,
          allowedRiderCount: this.newAllowedRiderCount,
          tripConnectionId
        };
        this.tripService.updateTrip(this.activeTripId, activeTrip)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(response => {
            this.getActiveTrips();
            this.notifyService.sendNotification(receiverId, pushMessage);
            setTimeout(() => {
              this.notifyService.sendRejectMessage(receiverId, message);
            }, 5000);
            const user = JSON.parse(localStorage.getItem('currentUser'));
            this.cancelLoading = false;
            this.router.navigate(['driver/home', this.currentUser.userId]);
          }, error => {
            console.log(error);
          });
      });
    }
  }

  startTrip() {
    const name = `You have ${this.riderRequestLength} riders in this trip, continue?`;
    if (this.riderRequestLength < this.maxSeat) {
      const dialogRef = this.dialog.open(ModalComponent, {
        width: '90%',
        panelClass: 'dialog',
        data: { name, price: null, showCancel: true }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.broadcastService.modalStat
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(res => {
            if (res === true) {
              this.router.navigate(['driver/home', this.currentUser.userId], { queryParams: { driverNav: true } });
            } else {
              return;
            }
          });
      });

    } else {
      this.router.navigate(['driver/home', this.currentUser.userId], { queryParams: { driverNav: true } });
    }
  }
  cancelActiveTrip() {
    this.store.dispatch(new ShowLoader(false));
    this.cancelLoading = true;
    if (this.riderRequestLength < 1) {
      this.cancelLoading = false;
      this.router.navigate(['driver/home', this.currentUser.userId]);
    } else {
      this.tripProcess(false, this.riderRequest);
    }
  }


  // declineTripRequest(rider) {
  //   console.log(rider);
  //   const riderConnectionId = rider.riderConnectId;
  //   const riderId = rider.activeRiderId;
  //   const receiverId = rider.user.userId;
  //   const driverName = this.activeTrip.tripDriver.driver.userName;
  //   const receiver = rider.user.userName;
  //   const message = `Sorry, ${driverName} declined your request. Please search for another driver.`;
  //   const pushMessage = {
  //     title: 'LnkuP Trip',
  //     body: message,
  //     click_action: `https://lnkupmob.azureedge.net/rider/home/${riderId}`,
  //     receiverName: receiver
  //   };
  //   this.riderService.delete(riderId)
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe(data => {
  //       this.notifyService.rejectMessage(receiverId, message);
  //       this.notifyService.sendNotification(receiverId, pushMessage);
  //       this.getActiveTrips();
  //     }, error => {
  //       console.log('An error occured');
  //     });
  // }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
