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
