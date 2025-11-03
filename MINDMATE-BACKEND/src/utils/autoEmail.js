const nodemailer = require('nodemailer');

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allows Gmail connection in dev
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter setup failed:', error);
  } else {
    console.log('✅ Email transporter ready to send messages.');
  }
});

async function sendEmail({ to, subject, html }) {
  try {
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.log('❌ Error sending email:', error.message);
  }
}

module.exports = sendEmail;