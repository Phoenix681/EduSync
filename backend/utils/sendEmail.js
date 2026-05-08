import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter using your Mailtrap credentials from .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const message = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Actually send the email
  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;