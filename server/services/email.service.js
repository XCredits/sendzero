// Here you should put the external email service you require:

// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: 'test@example.com',
  from: 'test@example.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
console.log("###########################################################");
sgMail.send(msg);


exports = {
  addUserToMailingList,
  removeUserFromMailingList,
  retrieveUnsubscribes,
  sendRegisterWelcome,
  sendMailingListWelcome,
  sendPasswordReset,
  sendUsernameRetrieval,
};

/**
 * Add the user to the mailing list in the email service provider
 */
function addUserToMailingList({userId, email, givenName, familyName}) {
  
}

/**
 * Remove the user from the mailing list in the email service provider
 */
function removeUserFromMailingList({userId, email}) {
  
}

/**
 * In this function, we are calling on the email service to retrieve instances 
 * of the user pressing unsubscribe. We are doing this to compare to the user 
 * list in our own databases, to remove individuals who have unsubscribed.
 */
function retrieveUnsubscribes({start, end}) {
  
}

function sendRegisterWelcome({userId, email, givenName, familyName}) {
  
}

function sendMailingListWelcome({userId, email, givenName, familyName}) {
  
}

function sendPasswordReset({userId, email, givenName, familyName, resetLink}) {
  
}

function sendUsernameRetrieval({userId, email, givenName, familyName, userNameArr}) {
  
}

