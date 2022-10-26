# dslab.playgo-mobile

## Build environment

At each step of building application, there are build environments/flavors to
choose from.

### Angular environments

configuration is in `src\environments`. In general all Angular environments are combination of 3 "dimensions". More in `src\environments\create-environment.ts`

- production (releaseToStore=true, aacConfig=default, apiServer=prod)
- development (releaseToStore=false, aacConfig=default, apiServer=dev)
- testing (releaseToStore=false, aacConfig=default, apiServer=prod) used to debug or test application as close as production app.
- stage (releaseToStore=true, aacConfig=stage, apiServer=dev) used to create app with different appId to test new features before adding them to prod.

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

Build targets/flavors were created using this guides:
https://capacitorjs.com/docs/guides/environment-specific-configurations
https://firebase.google.com/docs/projects/multiprojects

## Build app

### production build

- make sure that you are on correct branch. In general release_x.x.x is preferred.
- run `ionic:sync:prod`
- open android studio
  - [only first time] run "Sync project with gradle files" (icon on top right with elephant with arrow)
  - open Build>Select build variant
  - in first line ":app" choose "productionRelease" (or "productionDebug" to try apk before release)
  - build apk, or signed bundle - using "Build bundle(s)". Signing is handled in gradle script.
  - (optional) install app and make sure that in about page all environments are production.
  - release to store
- open xcode

### stage build

- Stage build could be created from normal feature branch that we want to test, or special stage branch containing multiple features that are being tested before adding them to release.
- build process is similar to production build but:
- run `ionic:sync:stage`
- choose "stageRelease" in build variants of Android studio
- choose "App stage" build target in xcode.

### Secrets

Keys and tokens that should not be committed and stored publicly on github are stored in `secrets` folder, which is ignored by git. For now files in this folder are used to create signed bundle for android.

### Hot code push

Hot code push can be used to update web part of app - angular's files in both production and stage application released to the stores. Without needing of creating full release, and also user cannot opt-out of update - update is silent. Production and stage apps use different hot code push "channels".

In general workflow is simple. We host hot code push server by ourselves (https://code-push-server.platform.smartcommunitylab.it). All installed apps on the startup will ask server if there is new web code for the app with newer "label". If we want to deploy a new "label", we have to build angular code, and than run command of code-push cli to upload it.

Almost all handy cli commands are listed in package.json as npm scripts. For security reasons access to code-push-server is restricted, and only public api is endpoints used by capacitor plugin in android/ios apps to check/download new code, rest of api is available only on internal network. That also means that all cli commands works only on internal network.

Most useful npm scripts are:

- `code-push:login` Log in is "persistent" account credentials are stored on developer's machine to be used on every subsequent cod-push cli command We use one shared account for all developers. Fabio/Matteo have more information.
- `code-push:(ios/android):(list/history)` checking already published versions (labels)
- `code-push:(ios/android):clear:(prod/stage)` clearing versions from code-push server. This will not cause uninstall on real devices.
- `code-push:(ios/android):release:(prod/stage) [app-version]` main command to upload new code to our code-push server and later to user's phones. It is important to run `npm run ionic:sync:(prod/stage)` before running code-push release command. Because release command only copy builded files in `/app/src/main/assets/public` or `ios/App/App/public`. Command has one required argument: app-version of installed apps that should be targeted with this code. For example when we have version `1.2.0` of the android production app deployed and we want to fix some bug, we can fix the issue in correct branch. Then run `npm run ionic:sync:prod` to build angular, and then `npm run code-push:android:release:prod 1.2.0`.

Full documentation about code-push cli is here: https://github.com/shm-open/code-push-cli

For plugin we use https://github.com/mapiacompany/capacitor-codepush, but repo is not actively maintained. It is possible that we will have to fork it.

Server is https://github.com/shm-open/code-push-server.
