import { EmailContent, EmailProductInfo, NotificationType, User } from '@/types';
import nodemailer from 'nodemailer';

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
  TARGET_PRICE_MET: 'TARGET_PRICE_MET',
}

const THRESHOLD_PERCENTAGE = 40; // Threshold for discount

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType,
  user?: User,
  additionalInfo: { targetPrice?: number } = {}
) {
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;

  let subject = '';
  let body = '';

  switch (type) {
    case Notification.WELCOME:
      subject = `Welcome to PriceTrace for ${shortenedTitle}`;
      body = `
        <div>
          <h2>Welcome to PriceTrace 🚀</h2>
          <p>You are now tracking <strong>${product.title}</strong>.</p>
          <p>Stay tuned for updates and notifications about this product.</p>
        </div>
      `;
      break;

    case Notification.TARGET_PRICE_MET:
      subject = `Target Price Alert for ${shortenedTitle}`;
      body = `
        <div>
          <h4>Good news! The product <strong>${product.title}</strong> has reached your target price!</h4>
          <p>Current price: ₹${product.currentPrice}</p>
          <p><a href="${product.url}" target="_blank" rel="noopener noreferrer">Click here to buy now</a></p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Lowest Price Alert for ${shortenedTitle}`;
      body = `
        <div>
          <h4>The product <strong>${product.title}</strong> has reached its lowest price!</h4>
          <p>Current price: ₹${product.currentPrice}</p>
          <p><a href="${product.url}" target="_blank" rel="noopener noreferrer">Check it out here</a></p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} is back in stock!`;
      body = `
        <div>
          <h4>The product <strong>${product.title}</strong> is now back in stock!</h4>
          <p><a href="${product.url}" target="_blank" rel="noopener noreferrer">Buy it now</a></p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Discount Alert for ${shortenedTitle}`;
      body = `
        <div>
          <h4>Hey, ${product.title} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
          <p>Grab it right away from <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
        </div>
      `;
      break;

    default:
      console.warn('[PriceTrace] Notification type not recognized:', type);
      return {
        subject: '[PriceTrace] Notification',
        body: '<div><p>Notification type not recognized. Please check your settings.</p></div>',
      };
  }

  return { subject, body };
}

// Updated Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: 'contact@bscit.online',
    pass: process.env.EMAIL_PASSWORD, // Ensure EMAIL_PASSWORD is set in your environment
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send email function
export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
  const mailOptions = {
    from: 'contact@bscit.online',
    to: sendTo,
    html: emailContent.body,
    subject: emailContent.subject,
  };

  try {
    console.log('Attempting to send email with the following options:', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (error) {
    console.error('Error while sending email:', error);
  }
};

// Log if no functions are called
// if (require.main === module) {
//   console.log('[PriceTrace] No functions were called. Ensure to invoke generateEmailBody or sendEmail as needed.');
// }
