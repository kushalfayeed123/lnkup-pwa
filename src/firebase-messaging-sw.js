// See https://firebase.google.com/docs/cloud-messaging/js/receive#setting_notification_options_in_the_service_worker
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'AIzaSyAlDm5IdqHlVG8uDXz6faxEwE-l35JQEtQ',
  authDomain: 'lnkup-5ddec.firebaseapp.com',
  databaseURL: 'https://lnkup-5ddec.firebaseio.com',
  projectId: 'lnkup-5ddec',
  storageBucket: 'lnkup-5ddec.appspot.com',
  messagingSenderId: '986206457990',
  appId: '1:986206457990:web:404eba7da3a744396f4107',
  measurementId: 'G-35QM2LZ7S4'});



// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
