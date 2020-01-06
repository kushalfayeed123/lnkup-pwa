import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { slideInAnimation } from 'src/app/services/misc/animation';



@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class OnboardingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }


}
