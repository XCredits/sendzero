'use strict';
// The social controller intercepts scrapers and serves new URLs

const socialLinks = require('./social-links.controller');

const socialDefaults = {
  url: process.env.URL_ORIGIN,
  title: process.env.SITE_NAME,
  description: process.env.SITE_NAME,
  image: '/assets/img/social-default.jpg',
};

module.exports = function(req, res, next) {
  let ua = req.headers['user-agent'];
  if (typeof ua === 'string') {
    ua = ua.toLowerCase();
    if (ua.includes('facebookexternalhit') ||
        ua.includes('facebot') ||
        ua.includes('linkedinbot') ||
        ua.includes('twitterbot') ) {
      const customLink = socialLinks(req.path);
      return res.send(html(customLink ? customLink : socialDefaults));
    }
  }
  next();
};

/**
 * generates html
 * @param {*} v
 * @return {*}
 */
function html(v) {
  let origin = process.env.URL_ORIGIN;
  let twitterProperty = '';
  let facebookProperty = '';
  if (process.env.TWITTER_HANDLE) {
    twitterProperty = `
    <meta name="twitter:site" content="@${process.env.TWITTER_HANDLE}" />
    <meta name="twitter:creator" content="@${process.env.TWITTER_HANDLE}" />`;
  }
  if (process.env.FACEBOOK_APP_ID) {
    facebookProperty =
        `<meta property="fb:app_id" content="${process.env.FACEBOOK_APP_ID}">`;
  }
  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="author", content="${process.env.SITE_NAME}" />

        ${facebookProperty}
        <meta property="og:url" content="${v.url}" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${v.title}" />
        <meta property="og:description" content="${v.description}" />
        <meta property="og:image" content="${origin}${v.image}" />

        <meta name="twitter:card" content="summary_large_image" />
        ${twitterProperty}
        <meta name="twitter:title" content="${v.title}" />
        <meta name="twitter:description" content="${v.description}" />
        <meta name="twitter:image" content="${origin}${v.image}" />

        <meta name="description" content="${v.title}" />

      </head>
      <body>
        <h1>${v.title}</h1>
        <p>${v.description}</p>
        <img src="${origin}${v.image}">
      </body>
      
    </html>
  `;
};
