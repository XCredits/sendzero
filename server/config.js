'use strict';

process.env.JWT_EXPIRY = 10*60*1000; // Expiry in ms (10 mins), stored as string
process.env.JWT_REFRESH_TOKEN_EXPIRY = 365*24*60*60*1000; // Expiry in ms (1 year), stored as string
process.env.JWT_TEMPORARY_LINK_TOKEN_EXPIRY = 60*60*1000; // Expiry in ms (1 hour), stored as string

if (!process.env.GOOGLE_CLOUD_PROJECT) {
  process.env.IS_LOCAL = 'TRUE';
}

// Default to production
process.env.NODE_ENV = 'production';

if (!process.env.IS_LOCAL &&
    process.env.GOOGLE_CLOUD_PROJECT.endsWith('-dev')) {
  process.env.NODE_ENV = 'development';
}

if (process.env.IS_LOCAL) {
  process.env.URL_ORIGIN = process.env.URL_ORIGIN_LOCAL;
} else if (process.env.NODE_ENV === 'production') {
  process.env.URL_ORIGIN = process.env.URL_ORIGIN_PROD;
} else {
  process.env.URL_ORIGIN = process.env.URL_ORIGIN_DEV;
}

if (process.env.IS_LOCAL) {
  process.env.MONGODB_URI = process.env.MONGODB_URI_LOCAL;
} else if (process.env.NODE_ENV === 'production') {
  process.env.MONGODB_URI = process.env.MONGODB_URI_PROD;
} else {
  process.env.MONGODB_URI = process.env.MONGODB_URI_DEV;
}

