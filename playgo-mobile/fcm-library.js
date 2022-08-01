var replace = require('replace-in-file');
var options = {
  files: './node_modules/@capacitor/push-notifications/android/build.gradle',
  from: 'implementation "com.google.firebase: firebase - messaging: $firebaseMessagingVersion"',
  to: 'implementation "com.google.firebase: firebase - messaging: $firebaseMessagingVersion"\n\timplementation "com.google.firebase:firebase-iid:21.1.0"'
};
replace(options)
  .then(results => {
    console.log('Added implementation "com.google.firebase:firebase-iid:21.1.0"');
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });