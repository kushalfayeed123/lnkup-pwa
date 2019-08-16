// import the required animation functions from the angular animations module
import { trigger, state, animate, transition, style } from '@angular/animations';

export const popInAnimation =
    // trigger name for attaching this animation to an element using the [@triggerName] syntax
    trigger('popInAnimation', [

        // route 'enter' transition
        transition(':enter', [

            // css styles at start of transition
            style({ transform: 'translateY(-100px)', opacity: 0}),

            // animation and styles at end of transition
            animate('2s  cubic-bezier(0.55, 0.055, 0.675, 0.19)', style({ opacity: 0.2,
              background: '#D73872',
              transform: 'translateY(-100px)',

             }))
        ]),
        transition(':leave', [

          // css styles at start of transition
          style({ transform: 'translateY(-100px)', opacity: 0}),

          // animation and styles at end of transition
          animate('2s  cubic-bezier(0.55, 0.055, 0.675, 0.19)', style({ opacity: 0.2,
            background: '#black',
            transform: 'translateY(-100px)',

           }))
      ]),
    ]);
