const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }) {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_SENDER_EMAIL,
      name: process.env.SENDGRID_SENDER_NAME,
    },
    subject,
    html,
  };
  return sgMail.send(msg);
}

module.exports = sendEmail;