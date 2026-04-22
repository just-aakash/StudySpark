import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log(`[Email Service] Attempting to send email to ${options.email}...`);
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${options.email}`);
  } catch (err) {
    console.error(`[Email Service] Error sending email:`, err);
    throw err;
  }
};

export default sendEmail;