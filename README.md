# dslab.playgo-mobile

## Build environment
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

## Build app

### production build
 - make sure that you are on correct branch
 - run `ionic:sync:prod`
 - open android studio
   - [only first time] run "Sync project with gradle files" (icon on top right with elephant with arrow) 
   - open Build>Select build variant
   - in first line ":app" choose "productionRelease" (or "productionDebug" to try apk before release)
   - build apk, or signed bundle 
   - release to store
 - open xcode