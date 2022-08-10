var replace = require("replace-in-file");

var originalLine =
  'implementation "com.google.firebase:firebase-messaging:$firebaseMessagingVersion"';
var newLine = 'implementation "com.google.firebase:firebase-iid:21.1.0"';

var wantToPatch = false;
var options = {
  files: "./node_modules/@capacitor/push-notifications/android/build.gradle",
  from: originalLine,
  to: function (match, line, fileContent) {
    if (fileContent.indexOf(newLine) > -1) {
      console.log("fcm: already patched");
      return originalLine;
    } else {
      console.log("fcm: trying to add " + newLine);
      wantToPatch = true;
      return [originalLine, newLine].join("\n    ");
    }
  },
};
replace(options)
  .then(function () {
    if (wantToPatch) {
      var wasPatched = arguments[0][0].hasChanged;
      if (wasPatched) {
        console.log("fcm: patched successfully");
      } else {
        console.error("fcm: patch failed", arguments[0][0]);
        exit(1);
      }
    }
  })
  .catch(function (error) {
    console.error("Error occurred:", error);
    exit(1);
  });
