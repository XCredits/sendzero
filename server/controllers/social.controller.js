// The social controller intercepts scrapers and serves new URLs

const socialLinks = require('./social-links.controller');

const socialDefaults = {
  url: process.env.URL_ORIGIN,
  title: process.env.SITE_NAME,
  description: '',
  image: '/assets/img/social-default.jpg',
};

module.exports = function(req, res, next) {
  const ua =req.headers['user-agent'];
  if (ua.includes('FacebookExternalHit') ||
      ua.includes('Facebot') ||
      ua.includes('LinkedInBot') ||
      ua.includes('Twitterbot') ) {
    const customLink = socialLinks(req.path);
    return res.send(html(customLink ? customLink : socialDefaults));
  }
  next();
};

/**
 * generates html
 * @param {*} v
 * @return {*}
 */
function html(v) {
  return `
    <html>
      <head>
        <meta property="og:url" content="${v.url}" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="${v.title}" />
        <meta property="og:description" content="${v.description}" />
        <meta property="og:image" content="${v.image}" />
      </head>
      <body>
        <h1>${v.title}</h1>
        <p>${v.description}</p>
        <img src="${v.image}">
      </body>
      
    </html>
  `;
};
