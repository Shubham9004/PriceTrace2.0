'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: '', // Added subject field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const router = useRouter();

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTransactionComplete(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setTransactionComplete(true);
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '', subject: '' });
      } else {
        toast.error(result.message || 'Failed to send message.');
      }
    } catch (error) {
      toast.error('An error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-8 md:px-24 py-28 bg-gray-50">
      <div className="flex flex-col items-center space-y-8 text-center max-w-2xl mx-auto">

        <h1 className="text-4xl font-bold leading-snug text-gray-800">Contact Us</h1>

        <p className="text-gray-600 text-lg">
          We’d love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to send us a message.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-6 mt-8"
        >
          <div>
            <label htmlFor="name" className="block text-lg text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-lg text-gray-700 mb-2">Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-lg text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter the subject"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-lg text-gray-700 mb-2">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your message"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px] bg-primary hover:bg-primary-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : transactionComplete ? (
              <>
                <Image
                  src="/assets/icons/check.svg"
                  alt="check"
                  width={22}
                  height={22}
                />
                <span className="text-base">Message Sent</span>
              </>
            ) : (
              <span className="text-base">Send Message</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;
