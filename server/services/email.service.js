// Here you should put the external email service you require:

// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// https://github.com/sendgrid/sendgrid-nodejs/blob/master/packages/client/USAGE.md
const sendgridMail = require('@sendgrid/mail');
const sendgridClient = require('@sendgrid/client');
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY);
sendgridMail.setSubstitutionWrappers('{{', '}}');

const organizationName = 'XCredits';
const organizationEmail = 'teamx@xcredits.com';
const organizationFromName = 'Team XCredits';
const registerWelcomeTemplateId = '325bd7af-8542-4d59-bd32-2469cf13b495';


// #SENDGRID_VERIFICATION START
// const msg = {
//   to: 'test@example.com',
//   from: 'test@example.com',
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sendgridMail.send(msg)
//     .then(() => {console.log('SendGrid worked!')})
//     .catch((err) => {console.log('Error occurred.'); console.log(err); });
// #SENDGRID_VERIFICATION END

module.exports = {

/**
 * Add the user to the mailing list in the email service provider
 */
addUserToMailingList: function({userId, email, givenName, familyName}) {
  const data = [
    {
      "email": email,
      "first_name": givenName,
      "last_name": familyName,
      "id": userId, // optional, if not a registered user
    },
  ];
  var request = {
    body: data,
    method: 'POST',
    url: '/v3/contactdb/recipients',
  };
  return sendgridClient.request(request)
      .then(([response, body]) => {
        if (body.errors.length === 0) {
          // console.log(response.body.persisted_recipients[0]);
          return response.body.persisted_recipients[0];
        }
        throw new Error('Problem adding to email list.');
      })
},
// Testing
// addUserToMailingList({
//   email: 'test@test.com', 
//   givenName: 'Robert', 
//   familyName: 'Smith'});


/**
 * Remove the user from the mailing list in the email service provider
 * In this case, userId should be the 'persisted_recipients' id created by 
 * the SendGrid process above.
 */
removeUserFromMailingList: function({userId}) {
  var request = {
    body: [userId],
    method: 'DELETE',
    url: '/v3/contactdb/recipients',
  };
  return sendgridClient.request(request)
      .then(([response, body]) => {
        if (response.statusCode === 204) {
          return true;
        }
        throw new Error('Problem removing user.');
      })
},
// Testing
// removeUserFromMailingList({userId: 'dGVzdEB0ZXN0LmNvbQ=='});

/**
 * In this function, we are calling on the email service to retrieve instances 
 * of the user pressing unsubscribe. We are doing this to compare to the user 
 * list in our own databases, to remove individuals who have unsubscribed.
 */
retrieveUnsubscribes: function({start, end}) {
  
},

/**
 * 
 * Instructions on sending transactional emails
 * https://github.com/sendgrid/sendgrid-nodejs/blob/master/use-cases/transactional-templates.md
 */

sendRegisterWelcome: function({userId, email, givenName, familyName}) {
  const msg = {
    to: email,
    from: organizationEmail,
    subject: 'Welcome to ' + organizationName + (givenName? ', ' + givenName : ''),
    templateId: registerWelcomeTemplateId,
    substitutions: {
      first_name: givenName,
      last_name: familyName,
    },
  };
  return sendgridMail.send(msg);
},

sendMailingListWelcome: function({userId, email, givenName, familyName}) {
  
},

sendPasswordReset: function({userId, email, givenName, familyName, resetLink}) {
  
},

sendUsernameRetrieval: function({userId, email, givenName, familyName, userNameArr}) {
  
}

};