"use client";

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { name: 'Home', link: '/' },          // Home page (root)
  { name: 'About Us', link: '/about-us' },  // About Us page
  { name: 'Services', link: '/services' },  // Services page
  { name: 'Contact Us', link: '/contact-us' }, // Contact Us page
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the menu when a link is clicked
  };

  return (
    <header className="w-full bg-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6 md:px-10">
        <Link href="/" className="flex items-center gap-1">
          <p className="text-2xl font-bold nav-logo">
            Price<span className="text-primary">Trace</span>
          </p>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.link} className="text-lg font-medium hover:text-primary">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden">
            <div className="flex flex-col items-center py-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.link} 
                  className="text-lg font-medium hover:text-primary" 
                  onClick={handleLinkClick} // Close the menu when a link is clicked
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
