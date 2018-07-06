

const customPath = {
  '/': {
    path: '/home',
    url: process.env.URL_ORIGIN,
    title: process.env.SITE_NAME,
    description: 'High-speed, decentralized file sharing',
    image: '/assets/img/social-default.jpg',
  },
  '/home': {
    path: '/home',
    url: process.env.URL_ORIGIN + '/home',
    title: process.env.SITE_NAME,
    description: 'High-speed, decentralized file sharing',
    image: '/assets/img/social-default.jpg',
  },
  '/register': {
    path: '/register',
    url: process.env.URL_ORIGIN + '/register',
    title: 'Register for ' + process.env.SITE_NAME,
    description: 'Sign up for our great service',
    image: '/assets/img/social-default.jpg',
  },
  '/login': {
    path: '/login',
    url: process.env.URL_ORIGIN + '/login',
    title: 'Log in to ' + process.env.SITE_NAME,
    description: '',
    image: '/assets/img/social-default.jpg',
  },
  '/help': {
    path: '/help',
    url: process.env.URL_ORIGIN + '/help',
    title: process.env.SITE_NAME + ': help',
    description: 'Get help with using ' + process.env.SITE_NAME,
    image: '/assets/img/social-default.jpg',
  },
  '/privacy': {
    path: '/privacy',
    url: process.env.URL_ORIGIN + '/privacy',
    title: process.env.SITE_NAME + ' privacy policy',
    description: 'Learn about the ' + process.env.SITE_NAME + ' privacy policy',
    image: '/assets/img/social-default.jpg',
  },
  '/terms': {
    path: '/terms',
    url: process.env.URL_ORIGIN + '/terms',
    title: process.env.SITE_NAME + ' terms and conditions',
    description: 'Learn about the ' + process.env.SITE_NAME + ' terms and conditions',
    image: '/assets/img/social-default.jpg',
  },
};

module.exports = function(path) {
  return customPath[path];
};
