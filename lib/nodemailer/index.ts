import { EmailContent, EmailProductInfo, NotificationType, User } from '@/types';
import nodemailer from 'nodemailer';

// Notification Types
const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
  TARGET_PRICE_MET: 'TARGET_PRICE_MET',
};

const THRESHOLD_PERCENTAGE = 40; // Threshold for discount

/**
 * Generate Email Body
 */
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

  const commonStyles = `
    font-family: Arial, sans-serif; color: #333; line-height: 1.5; text-align: center;
    padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;
  `;
  const headerStyles = `
    font-size: 24px; color: #d9534f; font-weight: bold; margin-bottom: 20px;
  `;
  const productImageStyles = `
    max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;
  `;
  const buttonStyles = `
    display: inline-block; margin-top: 20px; padding: 10px 20px;
    font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none;
    border-radius: 4px;
  `;
  const footerStyles = `
    margin-top: 40px; font-size: 12px; color: #777; text-align: center;
  `;

  switch (type) {
    case Notification.WELCOME:
      subject = `Welcome to PriceTrace for ${shortenedTitle}`;
      body = `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            🚀 Welcome to PriceTrace!
          </div>
          <img src="${product.image}" alt="${product.title}" style="${productImageStyles}" />
          <p>You are now tracking <strong>${product.title}</strong>.</p>
          <p>Stay tuned for updates and notifications about this product.</p>
          <a href="${product.url}" style="${buttonStyles}" target="_blank" rel="noopener noreferrer">Explore Product</a>
          <div style="${footerStyles}">
            Missing out on PriceTrace updates? Add us to your primary inbox!<br/>
            This email was sent by PriceTrace (Nalanda Housing Society, St Xavier Road, Mumbai - 40042).<br/> </a>.
          </div>
        </div>
      `;
      break;

    case Notification.TARGET_PRICE_MET:
      subject = `Target Price Alert for ${shortenedTitle}`;
      body = `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            🎯 Your Target Price is Here!
          </div>
          <img src="${product.image}" alt="${product.title}" style="${productImageStyles}" />
          <p>The product <strong>${product.title}</strong> has reached your target price of !</p>
          <p>Current price: <strong>₹${product.currentPrice}</strong></p>
          <a href="${product.url}" style="${buttonStyles}" target="_blank" rel="noopener noreferrer">Buy Now</a>
          <div style="${footerStyles}">
            Missing out on PriceTrace updates? Add us to your primary inbox!<br/>
            This email was sent by PriceTrace (Nalanda Housing Society, St Xavier Road, Mumbai - 40042).<br/></a>.
          </div>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Lowest Price Alert for ${shortenedTitle}`;
      body = `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            🔥 Lowest Price Alert!
          </div>
          <img src="${product.image}" alt="${product.title}" style="${productImageStyles}" />
          <p>The product <strong>${product.title}</strong> is now at its lowest price!</p>
          <p>Current price: <strong>₹${product.currentPrice}</strong></p>
          <a href="${product.url}" style="${buttonStyles}" target="_blank" rel="noopener noreferrer">Check It Out</a>
          <div style="${footerStyles}">
            Missing out on PriceTrace updates? Add us to your primary inbox!<br/>
            This email was sent by PriceTrace (Nalanda Housing Society, St Xavier Road, Mumbai - 40042).<br/></a>.
          </div>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} is Back in Stock!`;
      body = `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            🚨 Back in Stock!
          </div>
          <img src="${product.image}" alt="${product.title}" style="${productImageStyles}" />
          <p>The product <strong>${product.title}</strong> is now back in stock!</p>
          <a href="${product.url}" style="${buttonStyles}" target="_blank" rel="noopener noreferrer">Buy Now</a>
          <div style="${footerStyles}">
            Missing out on PriceTrace updates? Add us to your primary inbox!<br/>
            This email was sent by PriceTrace (Nalanda Housing Society, St Xavier Road, Mumbai - 40042).<br/></a>.
          </div>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Discount Alert for ${shortenedTitle}`;
      body = `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            💰 Big Discount Alert!
          </div>
          <img src="${product.image}" alt="${product.title}" style="${productImageStyles}" />
          <p>Hey, <strong>${product.title}</strong> is now available at a discount greater than ${THRESHOLD_PERCENTAGE}%!</p>
          <a href="${product.url}" style="${buttonStyles}" target="_blank" rel="noopener noreferrer">Shop Now</a>
          <div style="${footerStyles}">
            Missing out on PriceTrace updates? Add us to your primary inbox!<br/>
            This email was sent by PriceTrace (Nalanda Housing Society, St Xavier Road, Mumbai - 40042).<br/></a>.
          </div>
        </div>
      `;
      break;

    default:
      console.warn('[PriceTrace] Notification type not recognized:', type);
      return {
        subject: '[PriceTrace] Notification',
        body: `
          <div style="${commonStyles}">
            <h2>Notification Type Not Recognized</h2>
            <p>Please check your settings or contact support for assistance.</p>
          </div>
        `,
      };
  }

  return { subject, body };
}
/**
 * Nodemailer Transporter Configuration
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alerts@pricetrace.tech',
    pass: process.env.EMAIL_PASSWORD, // Ensure EMAIL_PASSWORD is set in your environment
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send Email
 */
export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
  const mailOptions = {
    from: 'alerts@pricetrace.tech',
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