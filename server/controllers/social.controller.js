'use strict';
// The social controller intercepts scrapers and serves new URLs
// The social controller should explicitly state the routes that it is
// intercepting.

const socialLinks = require('./social-links.controller');
const path = require('path');
const fs = require('fs');

module.exports = function(req, res, next) {
  let ua = req.headers['user-agent'];
  const linkDetails = socialLinks(req.path);
  if (typeof ua === 'string' && linkDetails) {
    ua = ua.toLowerCase();
    if (ua.includes('facebookexternalhit') ||
        ua.includes('facebot') ||
        ua.includes('linkedinbot') ||
        ua.includes('twitterbot') ) {
      return res.send(html(linkDetails));
    } else if (ua.includes('googlebot')) {
      const filePath = path.join(__dirname, '../../dist/assets/cache/'
          + linkDetails.path + '.html');
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
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
