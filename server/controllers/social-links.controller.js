

const customPath = {
  '/register': {
    url: process.env.SITE_URL + '/register',
    title: 'Register for ' + process.env.SITE_NAME,
    description: 'Sign up for our great service',
    image: '/assets/img/social-default.jpg',
  },
  '/login': {
    url: process.env.SITE_URL + '/login',
    title: 'Log in to ' + process.env.SITE_NAME,
    description: '',
    image: '/assets/img/social-default.jpg',
  },
  '/help': {
    url: process.env.SITE_URL + '/help',
    title: process.env.SITE_NAME + ': help',
    description: 'Get help with using ' + process.env.SITE_NAME,
    image: '/assets/img/social-default.jpg',
  },
  '/privacy': {
    url: process.env.SITE_URL + '/privacy',
    title: process.env.SITE_NAME + ' privacy policy',
    description: 'Learn about the ' + process.env.SITE_NAME + ' privacy policy',
    image: '/assets/img/social-default.jpg',
  },
  '/terms': {
    url: process.env.SITE_URL + '/terms',
    title: process.env.SITE_NAME + ' terms and conditions',
    description: 'Learn about the ' + process.env.SITE_NAME + ' terms and conditions',
    image: '/assets/img/social-default.jpg',
  },
};


module.exports = function(path) {
  return customPath[path];
};
