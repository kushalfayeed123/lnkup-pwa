// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  webUrl : 'https://linkup20191021111853.azurewebsites.net/api',
  openConnect: 'https://linkup20191021111853.azurewebsites.net/notifyHub',
  vapidPublicKey: 'BCleJ0xgtXBcFHep4RmZXWX3Fa6S6ofO-XCzK56AHW3CXPlXZBsOtQ1ydmoidDBXaPeZdvA70ybSXB6atJBq7Jc',
  ravePubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
  raveEndpoint: 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/charge',
  raveValidateEndpoint: 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/validatecharge',
  raveTokenizedEndpoint: 'https://api.ravepay.co/flwv3-pug/getpaidx/api/tokenized/charge'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
