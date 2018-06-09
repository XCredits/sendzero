# Instructions for running this server locally

1) Install [NodeJS](https://nodejs.org/)

2) Install AngularCLI

~~~bash
npm install @angular/cli@latest -g
~~~

3) Install nodemon

~~~bash
npm install -g nodemon
~~~

4) Download or clone this repository

5) Open the NodeJS Terminal. Run 

~~~bash
npm install
~~~

 to add the needed files into the node_modules folder

6) Start the MongoDB server

[Install MongoDB](https://www.mongodb.com/download-center?jmp=nav#community).
Create the folder

~~~bash
C:\data\db\
~~~

Navigate to

~~~bash
cd "C:\Program Files\MongoDB\Server\3.4\bin"
~~~

Run

~~~bash
mongod.exe
~~~

to start the MongoDB server.

Run

~~~bash
mongo.exe
~~~

to connect to the server.

Run

~~~bash
use lazywebapp
db.createUser ({user:'lazywebapp',pwd:'password', roles:[{role:'dbAdmin', db:'lazywebapp'}]})
~~~

7) Run

~~~bash
ng build
~~~

to compile the Angular front-end components into the `dist` folder

8) Run

~~~bash
node server.js
~~~

9) Open [localhost:3000](http://localhost:3000/) in your browser. You should see a basic Angular app displayed. You are now running a local server. 

## Using simple running

Alternatively, skip steps 7-9 and instead run the following command to have the Angular built and server restarted when code changes

~~~bash
npm run dev
~~~

# Instructions for running this server on Google App Engine

After doing the above:

1) [Set up Google Cloud Platform](https://cloud.google.com/)

2) Create a new project

![Create a project](/readme/img/gcp12.png)

3) Name the project

![Name the project](/readme/img/gcp3.png)

4) Make sure the project is selected

![Select the project](/readme/img/gcp4.png)

5) Install the [Google Cloud SDK](https://cloud.google.com/sdk/)

6) Run the following command and create a new configuration. It can have any name.

~~~bash
gcloud init
~~~

7) Log in to your Google account

8) Select the project that you created above

9) Select the region

10) Choose a region that the server will be hosted in

~~~bash
gcloud config set compute/region us-central1
~~~

11) Run the following commands

~~~bash
ng build --prod
gcloud app deploy
~~~

12) Wait for the app to deploy.

13) Visit the address that is displayed when the deploy command finishes.

~~~bash
Deployed service [default] to [https://test-project-197703.appspot.com]
~~~

# Instructions for setting up SendGrid emails

1) Go to
  [this page](https://app.sendgrid.com/guide/integrate/langs/nodejs),
  do NOT follow the instructions.

2) Add the SendGrid API key to the .env file

3) Click "I've integrated the code above." and Click "Verifiy integration".

4) Comment out the `#SENDGRID_VERIFICATION` section of the at the top of the
  `email.service.js` file.

5) Start the server in development mode in order to send an email and verify 
  that the installation works.

6) COMMENT OUT THE `#SENDGRID_VERIFICATION` again!

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
Then into the imports array in the same file
~~~
ServiceWorkerModule.register('/ngsw-worker.js', 
    {enabled: environment.production})
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

## Install Material Design
I based this section on [Material Getting Started Guide](https://material.angular.io/guide/getting-started). I also used [this tutorial](https://www.youtube.com/watch?v=UnKsoCeTdEI) to help inform some of the things we are doing below.

The following installs material, the CDK and animation.
~~~
npm install --save @angular/material @angular/cdk @angular/animations
~~~

### Import Angular into app.module.ts
~~~
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
~~~
And add to the `@NgModule` `imports` array.

### Add some angular components as an example into app.module.ts
~~~
import { 
      MatAutocompleteModule,
      MatButtonModule,
      ... etc ...
    } from '@angular/material';
~~~
And add to the `@NgModule` `imports` array.


### Import a global theme in styles.css
~~~
@import "~@angular/material/prebuilt-themes/indigo-pink.css";
~~~

### Add font and font icons
To the `index.html` file
~~~
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Roboto:300,400,500,700,400Italic" rel="stylesheet">
~~~

### Add a navbar
Put the following at the top of app.component.html
~~~
<mat-toolbar color="primary">
  <span>{{ title }}</span>
  <span class="navbar-spacer"></span>
  <button mat-icon-button routerLink="/release-schedule">
    <mat-icon>person</mat-icon>
  </button>
</mat-toolbar>
~~~
Add the following to styles.css
~~~
body { 
  margin: 0px; 
} 

.navbar-spacer { 
  flex: 1 1 auto; 
} 
 
.navbar-icon { 
  padding: 0 14px; 
}
~~~

## Add Routes to the application
Create some new components to navigate to using the Angular CLI generate command
~~~
ng g component home
ng g component help
ng g component settings
~~~
### Set up the router module
Add the following to `app.module.ts`
~~~
import { RouterModule } from '@angular/router';
~~~

Add the routes to the RouterModule

~~~
RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'help',
        component: HelpComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
    ]),
~~~

### Add routes to HTML
In `app.component.html` add
~~~
<router-outlet></router-outlet>
~~~
to where the routes should be displayed on the page.

Add the following links so that the user can navigate to the routes:
~~~
<a routerLink='/home'>Home</a>
<a routerLink='/help'>Help</a>
<a routerLink='/settings'>Settings</a>
~~~

### Update express to handle all get routes to default to serving index.js
Add the following to `server.js` towards the end of the file:
~~~
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
~~~

### Set the default route
Add the following redirect to the `RouterModule.forRoot`
~~~
{ 
  path: '', 
  redirectTo: '/home', 
  pathMatch: 'full',
}
~~~

### Add a Page Not Found route
Run
~~~
ng g component page-not-found
~~~
Add the component to the routes
~~~
{  
  path: '**',  
  component: PageNotFoundComponent, 
}
~~~

## Set up the project to use Sass
Sass is better than CSS, 
~~~
ng set defaults.styleExt scss
~~~
Convert all the .css files (and all references to those files) to .scss files. 

## Add an app manifest to make it phone home screen compatible
Using the [instructions from Google](https://developers.google.com/web/fundamentals/web-app-manifest/) a manifest.json file was added to the project, and the following line added to `index.js`
~~~
<link rel="manifest" href="/manifest.json">
~~~
This file is needed in the `dist` folder, so we need to add it to the assets array in the `.angular.cli,json` file:
~~~
"assets": [
  "assets",
  "favicon.ico",
  "manifest.json"
]
~~~

## Set up the dev platform to work with Nodemon
The following configuration was inspired by [this answer on StackOverflow](https://stackoverflow.com/a/42907043).

Install `concurrently` to run multiple commands at once
~~~
npm install concurrently --save 
~~~

Add `proxy.config.json` to root of Angular project:
~~~
{
  "/api/*":{
    "target":"http://localhost:3000",
    "secure":false,
    "logLevel":"debug"
  }
}
~~~
Add the following to `scripts` in `package.json`
~~~
"dev": "concurrently --kill-others \"npm run dev-server\" \"npm run dev-angular\"",
"dev-server": "nodemon server.js --watch server",
"dev-angular": "ng serve --proxy-config proxy.config.json",
~~~
The above will allow you to run `npm run dev`, which will start a Nodemon server that restarts when the 

## Use the following to start the server
### To serve only the front-end
~~~
ng serve
~~~
Visit `localhost:4200`

### To run the Express server with Nodemon and the Angular app
~~~
npm run dev
~~~
Visit `localhost:4200`

### To test the Service Worker and Progressive Web App elements
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
NOTE: If the above doesn't work and you're on Windows, it is probably because you are not using bash. More recent versions of Windows contain bash, just press the Windows key, type `Windows Features`, then select `Windows Subsystem for Linux`. Restart, then install Ubuntu form the Microsoft Store. When Ubuntu is setup, run, from the command line 
~~~
bash
~~~ 

More information on how to do this [here](https://www.howtogeek.com/249966/how-to-install-and-use-the-linux-bash-shell-on-windows-10/).

ngu-app-shell --module src/app/app.module.ts --url /loading --insert-module src/app/loading/module.ts





# NOTE: the below information was created as part of the 'ng build' process 

# LazyWebApp

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
