import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure the Nodemailer transporter with the given details
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // Use TLS, not SSL
  auth: {
    user: 'contact@bscit.online',
    pass: process.env.EMAIL_PASSWORD, // Ensure EMAIL_PASSWORD is set in your environment
  },
  tls: {
    rejectUnauthorized: false, // This is often needed for custom SMTP services
  },
});

// Define the email content structure
interface EmailContent {
  subject: string;
  body: string;
}

// Function to send email
export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
  const mailOptions = {
    from: 'contact@bscit.online', // Sender's email
    to: sendTo, // List of recipients
    subject: emailContent.subject, // Email subject
    html: emailContent.body, // HTML body content
  };

  try {
    await transporter.sendMail(mailOptions);
    return { status: 'success' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { status: 'error', message: 'Failed to send email' };
  }
};

// Handle the POST request from the contact form
export async function POST(req: Request) {
  const { name, email, message, subject } = await req.json();

  // Validate the incoming data
  if (!name || !email || !message || !subject) {
    return NextResponse.json(
      { message: 'All fields (name, email, message, and subject) are required!' },
      { status: 400 }
    );
  }

  // Define the email content
  const emailContent: EmailContent = {
    subject: `New contact form submission from ${name} - Subject: ${subject}`, // Include the custom subject here
    body: `
      <p>You have received a new message from ${name} (${email}):</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Send the email
  const result = await sendEmail(emailContent, ['contact@bscit.online']);

  if (result.status === 'success') {
    return NextResponse.json(
      { message: 'Message sent successfully!' },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: result.message || 'Failed to send message.' },
      { status: 500 }
    );
  }
}