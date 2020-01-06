// import the required animation functions from the angular animations module
import { trigger, state, animate, transition, style } from '@angular/animations';

export const slideInAnimation =
    // trigger name for attaching this animation to an element using the [@triggerName] syntax
    trigger('slideInAnimation', [

        // route 'enter' transition
        transition(':enter', [

            // css styles at start of transition
            style({ transform: 'translateX(100%)' }),

            // animation and styles at end of transition
            animate('0.7s ease-in-out', 
            style({ transform: 'translateX(0%)' }))
        ]),
        transition(':leave', [

            // css styles at start of transition
            style({ transform: 'translateX(0%)' }),

            // animation and styles at end of transition
            animate('0.7s ease-in-out', 
            style({ transform: 'translateX(-100%)' }))
        ]),
    ]);


    
