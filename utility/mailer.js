const nodemailer = require('nodemailer');
const dotenv = require('dotenv'); 

dotenv.config();

// Debug: Log environment variables (hide password)
console.log('Email config check:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  service: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  console.log('sendEmail function called with:', { to, subject });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.log('Error sending email:', error);
    throw error;
  }
};
// Debug: Confirm export
console.log('Mailer module exports:', Object.keys(module.exports));

module.exports = { sendEmail };