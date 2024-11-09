"use client";

import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const footerLinks = [
  { name: 'Home', link: '/' },
  { name: 'About Us', link: '/about' },
  { name: 'Services', link: '/services' },
  { name: 'Contact Us', link: '/contact' },
  { name: 'Privacy Policy', link: '/privacy-policy' },
  { name: 'Terms of Service', link: '/terms' },
];

const socialLinks = [
  { name: 'Facebook', link: 'https://facebook.com', icon: <FaFacebookF /> },
  { name: 'Twitter', link: 'https://twitter.com', icon: <FaTwitter /> },
  { name: 'Instagram', link: 'https://instagram.com', icon: <FaInstagram /> },
];

const Footer = () => {
  return (
    <footer className="w-full bg-white shadow-md mt-10">
      <div className="container mx-auto px-6 md:px-20 py-12">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Left Section: Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-2xl font-bold mb-4">
              <span className="text-secondary">Price</span>
              <span className="text-primary">Trace</span>
            </p>
            <p className="text-sm text-gray-600 max-w-xs text-center md:text-left">
              Track prices in real-time, make informed decisions, and never miss a deal. Join PriceTrace today and get started on your smart shopping journey.
            </p>
          </div>

          {/* Middle Section: Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-lg font-semibold">
              <span className="text-secondary">Quick</span> <span className="text-primary">Links</span>
            </h3>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.link}
                  className="text-sm text-gray-600 hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Address Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-lg font-semibold">
              <span className="text-secondary">Contact</span> <span className="text-primary">Info</span>
            </h3>
            <p className="text-sm text-gray-600">1234 Street Name, City, Country</p>
            <p className="text-sm text-gray-600">Email: contact@pricetrace.com</p>
            <p className="text-sm text-gray-600">Phone: +1 (123) 456-7890</p>
          </div>

          {/* Social Media Links Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-lg font-semibold">
              <span className="text-secondary">Follow</span> <span className="text-primary">Us</span>
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  className="text-2xl text-gray-600 hover:text-primary transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center md:text-left text-sm text-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>
              <span className="text-secondary">© 2024 Price</span>
              <span className="text-primary">Trace</span>
              <span className="text-secondary">. All rights reserved.</span>
            </p>
            <div className="mt-4 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-primary mx-4">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary mx-4">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
