# dslab.playgo-mobile

## Build environment
At each step of building application, there are build environments/flavors to
choose from. 

### Angular environments
configuration is in `src\environments`
 - production
 - development
 - testing (like development but with prod server url )
 - stage (like production but using different aac callback )
### Capacitor  
configuration is in `capacitor.config.ts`
 - production (default)
 - stage (using staging code push cannel)
### Android productFlavors
   configuration is in `android\app\build.gradle`
 - production
 - stage (different app id, name, custom url, firebase config)

### Ios build targets 
 - default (production)
 - stage (different app id, name, custom url, firebase config)

### Choosing right combination
At each part of build process, some environment/flavor could be chosen. But not
all combination does make a sense.

Angular's "development" and "testing" environments are not meant to be released
to store, so these are only for developes.

To build production app it is needed to choose "production" environment in Angular, Capacitor, Android and Ios.

Same is true for the special "stage" build which is meant to be released to store, and could be
installed alongside normal production app due to different appId. This stage app will
use dev servers, and is meant to test new features with internal testers.

## Build app

### production build
 - make sure that you are on correct branch. In general release_x.x.x is preferred.
 - run `ionic:sync:prod`
 - open android studio
   - [only first time] run "Sync project with gradle files" (icon on top right with elephant with arrow) 
   - open Build>Select build variant
   - in first line ":app" choose "productionRelease" (or "productionDebug" to try apk before release)
   - build apk, or signed bundle 
   - (optional) install app and make sure that in about page all environments are production.
   - release to store
 - open xcode
### stage build
 - Stage build could be created from normal feature branch that we want to test, or special stage branch containing multiple features that are being tested before adding them to release.
 - build process is similar to production build but:
 - run `ionic:sync:stage`
 - choose "stageRelease" in build variants of Android studio
 - choose "App stage" build target in xcode. 