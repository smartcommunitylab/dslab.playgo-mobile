var semver = require("semver");
var packageJson = require("./package.json");

var version = packageJson.engines.node;
if (!semver.satisfies(process.version, version)) {
  console.log(
    "Required node version " +
      version +
      " not satisfied with current version " +
      process.version +
      "."
  );
  process.exit(1);
}
