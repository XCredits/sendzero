'use strict';

process.env.JWT_EXPIRY_MINS = 10;
process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS = 365;

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

