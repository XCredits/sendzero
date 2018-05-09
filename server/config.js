'use strict';

process.env.JWT_EXPIRY = 10*60*1000; // Expiry in ms (10 mins)
process.env.JWT_REFRESH_TOKEN_EXPIRY = 365*24*60*60*1000; // Expiry in ms (1 year)

if (process.env.GOOGLE_CLOUD_PROJECT) {
  process.env.IS_LOCAL = false;
} else {
  process.env.IS_LOCAL = true;
}

if (!process.env.IS_LOCAL && 
    process.env.GOOGLE_CLOUD_PROJECT.endsWith('-prod')) {
  process.env.IS_PROD = true;
} else {
  process.env.IS_PROD = false;
}

if (process.env.IS_LOCAL) {
  process.env.MONGODB_URI = process.env.MONGODB_URI_LOCAL;
} else if (process.env.IS_PROD) {
  process.env.MONGODB_URI = process.env.MONGODB_URI_PROD;
} else {
  process.env.MONGODB_URI = process.env.MONGODB_URI_DEV;
}

