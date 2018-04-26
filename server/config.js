'use strict';

if (process.env.GOOGLE_CLOUD_PROJECT) {
  process.env.IS_LOCAL = false;
}

if (process.env.IS_LOCAL && 
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

