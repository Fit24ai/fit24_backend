const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subj, htmlContent) => {
  // { from,to,text,html}
  const msg = { from: config.email.from, to, subject: subj, html: htmlContent };
  // const msg = { from: '"Hey 👻" <smaple@gmail.com>', to, subject, html };
  // const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  // const resetPasswordUrl = <a `href=http://link-to-app/reset-password?token=${token}>Click Here</a>;
  const resetPasswordUrl = `<a href=${config.baseUrls.baseUrl}/v1/auth/reset-password?token=${token} ><b>Click here</b></a>`;
  // const resetPasswordUrl = `<a href=http://localhost:3000/v1/auth/reset-password?token=${token} ><b>Click here</b></a>`;
  const htmlBody = `To reset your password, please click on the following link: ${resetPasswordUrl}.
   This link will remain valid for 10 minutes. 
   If you did not initiate this password reset request, you may disregard this email.
  <br> 
  <br> 
  <br> 
  <br> 
  Thanks & Regards,<br> 
  Health App`;
  const sampleResetEmail = config.baseUrls.tempResetMail;
  // const sampleResetEmail = 'sample456@yopmail.com';
  await sendEmail(sampleResetEmail ?? to, subject, htmlBody);
  // await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
