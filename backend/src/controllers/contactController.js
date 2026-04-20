import sendEmail from '../../utils/sendemails.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const adminEmail = 'tyagiidhruv5@gmail.com';
    const emailSubject = `StudySpark Contact Form: ${subject}`;
    const emailMessage = `You have received a new message from the StudySpark contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    await sendEmail({
      email: adminEmail,
      subject: emailSubject,
      message: emailMessage,
    });

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Message could not be sent. Please try again later.' });
  }
};
