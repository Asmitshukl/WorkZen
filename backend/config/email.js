const nodemailer = require('nodemailer');

// Check if nodemailer is properly loaded
if (!nodemailer || !nodemailer.createTransport) {
  console.error('Nodemailer not properly installed');
  console.log('Run: npm install nodemailer');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error.message);
    console.log('Emails will not be sent. Check your .env file.');
  } else {
    console.log('Email server is ready to send messages');
  }
});

module.exports = transporter;