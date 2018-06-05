// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  siteName: 'LazyWebApp',

  // Comment out Google Analytics below to prevent analytics from running
  googleAnalytics: 'UA-120389053-1',


  // Comment out any of the below to prevent them being shown
  social: {
    facebook: 'https://www.facebook.com/lazywebapp',
    twitter: 'https://twitter.com/lazywebapp',
    linkedIn: 'https://www.linkedin.com/company/lazywebapp/',
    medium: 'https://medium.com/lazywebapp',
    telegram: 'https://t.me/lazywebapp',
    youtube: 'https://www.youtube.com/channel/lazywebapp',
    reddit: 'https://www.reddit.com/r/lazywebapp',
  }
};
