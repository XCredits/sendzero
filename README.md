# Instructions for running this server locally
1) Install [NodeJS](https://nodejs.org/)

2) Install AngularCLI
~~~
npm install @angular/cli@latest -g
~~~

3) Install nodemon
~~~
npm install -g nodemon
~~~

4) Download or clone this repository

5) Open the NodeJS Terminal. Run 
~~~
npm install
~~~
 to add the needed files into the node_modules folder

6) Run 
~~~
ng build
~~~
to compile the Angular front-end components into the `dist` folder

7) Run 

~~~
node server.js
~~~

**NOTE: You can also run the following command to have the Angular built and server restarted when code changes**
~~~
npm start-dev
~~~

8) Open [localhost:3000](http://localhost:3000/) in your browser. You should see a basic Angular app displayed. You are now running a local server. 

# Instructions for running this server on Google App Engine
After doing the above:

9) [Set up Google Cloud Platform](https://cloud.google.com/)

10) Create a new project

![Create a project](/readme/img/gcp12.png)

11) Name the project

![Name the project](/readme/img/gcp3.png)

12) Make sure the project is selected

![Select the project](/readme/img/gcp4.png)

13) Install the [Google Cloud SDK](https://cloud.google.com/sdk/)

14) Run the following command and create a new configuration. It can have any name. 
~~~
gcloud init
~~~

15) Log in to your Google account

16) Select the project that you created above

17) Select the region

18) Choose a region that the server will be hosted in

19) Run the following command
~~~
gcloud app deploy
~~~

20) Wait for the app to deploy. 

21) Visit the address that is displayed when the deploy command finishes.
~~~
Deployed service [default] to [https://test-project-197703.appspot.com]
~~~





# How this app was created
## Install Angular
~~~
npm install @angular/cli@latest -g
~~~
### Update TypeScript
> Note: the following was necessary to get the Angular installer to work. In future this may not be necessary.  
~~~
npm install --save-dev typescript@2.6.2
~~~
## Create the app
~~~
ng new app-name-goes-here
~~~
## Compile Angular and check that it works
~~~
cd app-name-goes-here
ng serve
~~~
Visit [http:localhost:4200](http:localhost:4200)
## Install Express and Body Parser
~~~
npm install express body-parser --save
~~~
## Add the server.js file

## Setting up the progressive elements of the app
These instructions were mostly put together using the [service worker documentation](https://angular.io/guide/service-worker-getting-started).

The old method is described in [this article](https://moduscreate.com/blog/creating-progressive-web-apps-using-angular/), [this video from I/o '17](https://www.youtube.com/watch?v=C8KcW1Nj3Mw) and [this repo](https://github.com/alxhub/io17). 

An alternative method for getting going with Angular Progressive Web Apps can be found in [this article](https://medium.com/@nsmirnova/creating-pwa-with-angular-5-e36ea2378b5d) and [the follow up](https://medium.com/@nsmirnova/creating-pwa-with-angular-5-part-2-progressifying-the-application-449e3a706129).
Install required libraries for the service worker tools that help us build the manifest files for the app.
~~~
npm install --save @angular/service-worker
npm install --save @angular/platform-server
~~~

### Update the app to allow service workers
~~~
ng set apps.0.serviceWorker=true
~~~

### Import required modules
Put the following line into `src/app/app.module.ts`
~~~
import { ServiceWorkerModule } from '@angular/service-worker';
~~~
Then into the imports array in the same file, put the following code after platformBrowserDynamic
~~~
platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(() => {
      if ('serviceWorker' in navigator) {
        ServiceWorkerModule.register('/ngsw-worker.js', 
            {enabled: environment.production})
      }
    })
    .catch(err => console.log(err));
~~~

### Optionally creare a ngsw-manifest.json file
If there are routes that need custom configuration, you can create your own `ngsw-manifest.json` and place it in src.

If this file is present and `npm build --prod` is run, then the ngsw-manifest file is combined. 

### Add boiler plate ndsw-config.json file
As per the [docs](https://angular.io/guide/service-worker-getting-started), adding this file is used to configure the serevice worker.
~~~
{
  "index": "/index.html",
  "assetGroups": [{
    "name": "app",
    "installMode": "prefetch",
    "resources": {
    "files": [
      "/favicon.ico",
      "/index.html"
    ],
    "versionedFiles": [
      "/*.bundle.css",
      "/*.bundle.js",
      "/*.chunk.js"
    ]
    }
  }, {
    "name": "assets",
    "installMode": "lazy",
    "updateMode": "prefetch",
    "resources": {
    "files": [
      "/assets/**"
    ]
    }
  }]
}
~~~




### Use the following to start the server
~~~
ng build --prod
node server.js
~~~



# Disused notes about using ng-pwa-tools

// npm install --save ng-pwa-tools not actually used in this process
// Note: there are errors indicating missing peer dependencies. At this point, we are ignoring the errors.

### Add the tool to the npm scripts
Add the following to package.json in the `scripts` array.
~~~
// "ngu-sw-manifest": "node ./node_modules/ng-pwa-tools/bin/ngu-sw-manifest.js" 
~~~


npm run ngu-sw-manifest --module src/app/app.module.ts --out dist/ngsw-manifest.json

The `ngu-sw-manifest` command goes through the router in Angular, and copies all the routes, and uses it to generate a `ngsw-manifest.json` file.

# If you don't have Bash
NOTE: If the above doesn't work and you're on Windows, it is probably because you are not using bash. More recent versions of Windows contain bash, just press the Windows key, type `Windows Features`, then select `Windows Subsystem for Linux`. Restart, then install Ubuntu form the Microsoft Store. When Ubuntu is setup, run, from the command line `bash`. More information on how to do this [here](https://www.howtogeek.com/249966/how-to-install-and-use-the-linux-bash-shell-on-windows-10/).

ngu-app-shell --module src/app/app.module.ts --url /loading --insert-module src/app/loading/module.ts





# NOTE: the below information was created as part of the 'ng build' process 

# SimplestAngularNodejsServer

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
