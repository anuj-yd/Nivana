require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// yaha unhi token ko varify kiya jata h
// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Nivana" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// default decription for sending the mail
async function sendRegistrationEmial(userEmial,name) {
    const subject = "Welcome to Nivana!";
    const text = `Hello ${name},\n\nThank you for registering at Nivana.
    We are excited to have you on board!\n\nBest regards,\nThe Nivana Team`;
    const html = `<p>Hello ${name},<p/><p>Thank you for registering at Nivana.
    We are excited to have you on board!</p><p>Best regards,<br>The Nivana Team</p>`;

    await sendEmail(userEmial,subject,text,html)
    
}

async function sendForgotPasswordEmail(userEmail, resetUrl) {
    const subject = "Password Reset Request - NIVANA";
    const text = `You have requested a password reset.\n\nPlease go to this link to reset your password:\n${resetUrl}`;
    const html = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmial,
    sendForgotPasswordEmail
}