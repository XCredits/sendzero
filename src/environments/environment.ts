// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  siteName: 'SendZero',

  // Comment out Google Analytics below to prevent analytics from running
  googleAnalyticsTrackingId: 'UA-120466200-3',

  // Comment out any of the below to prevent them being shown
  social: {
    facebook: 'https://www.facebook.com/sendzero',
    twitter: 'https://twitter.com/sendzero',
    linkedin: 'https://www.linkedin.com/company/sendzero/',
    medium: 'https://medium.com/sendzero',
    telegram: 'https://t.me/sendzero',
    youtube: 'https://www.youtube.com/channel/sendzero',
    reddit: 'https://www.reddit.com/r/sendzero',
  }
};
