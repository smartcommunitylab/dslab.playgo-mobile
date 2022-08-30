// This script runs operations *synchronously* which is normally not the best
// approach, but it keeps things simple, readable, and for now is good enough.

var gitDescribeSync = require("git-describe").gitDescribeSync;
var writeFileSync = require("fs").writeFileSync;

var gitInfo = gitDescribeSync();
var versionInfoJson = JSON.stringify(gitInfo, null, 2);

writeFileSync("src/assets/git-version.json", versionInfoJson);
writeFileSync("android/app/src/main/assets/git-version.json", versionInfoJson);
