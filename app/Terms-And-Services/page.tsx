import React from 'react';
import Head from 'next/head';

const TermsAndServices = () => {
  return (
    <>
      <Head>
        <title>Terms and Services - PriceTrace</title>
        <meta name="description" content="Read our Terms and Services to understand the guidelines and policies governing your use of PriceTrace." />
        <meta name="keywords" content="terms and services, user agreement, PriceTrace policies, legal terms" />
        <meta name="author" content="PriceTrace Team" />
        <meta property="og:title" content="Terms and Services - PriceTrace" />
        <meta property="og:description" content="Understand the rules and policies governing the use of PriceTrace." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.pricetrace.tech/terms-and-services" />
        <meta property="og:image" content="/assets/images/terms-seo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms and Services - PriceTrace" />
        <meta name="twitter:description" content="Read our Terms and Services to understand the guidelines and policies governing your use of PriceTrace." />
        <meta name="twitter:image" content="/assets/images/terms-seo.png" />
      </Head>

      <div className="px-8 md:px-24 py-28 bg-gray-50">
        <h1 className="text-4xl font-bold text-center mb-8">Terms and Services</h1>
        <p><strong>Effective Date:</strong> December 21, 2024</p>

        <p>
          Welcome to Pricetrace! These Terms and Services ("Terms") govern your access to and use of
          our website pricetrace.tech (the "Website"). By using our Website, you agree to be bound by
          these Terms. If you do not agree, please refrain from using our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Website, you affirm that you are at least 18 years old or have the
          consent of a parent or guardian. You agree to comply with all applicable laws and
          regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Changes to Terms</h2>
        <p>
          We reserve the right to update or modify these Terms at any time. Changes will be effective
          upon posting on this page. Your continued use of the Website constitutes acceptance of the
          updated Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Use of the Website</h2>
        <ul className="list-disc ml-6">
          <li>The Website is for personal, non-commercial use only.</li>
          <li>You agree not to engage in any unlawful or unauthorized activities.</li>
          <li>You shall not interfere with the Website’s functionality or security features.</li>
          <li>All content and materials provided on the Website are owned by Pricetrace or our
              licensors and are protected by copyright and other intellectual property laws.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Account Registration</h2>
        <p>
          To access certain features, you may need to create an account. You are responsible for
          maintaining the confidentiality of your login credentials and for all activities that occur
          under your account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Pricing and Alerts</h2>
        <p>
          Pricetrace provides tools to track product prices and receive alerts. However, we do not
          guarantee the accuracy or availability of price data. You acknowledge that prices are
          subject to change and availability may vary.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Disclaimer of Warranties</h2>
        <p>
          The Website and its services are provided "as is" and "as available." We disclaim all
          warranties, express or implied, including but not limited to warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Pricetrace shall not be liable for any direct,
          indirect, incidental, special, or consequential damages resulting from your use of the
          Website or inability to use the Website.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your access to the Website at our sole
          discretion, without notice, for any reason, including violation of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any
          disputes arising from or relating to these Terms shall be subject to the exclusive
          jurisdiction of the courts in Mumbai, Maharashtra.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p>
          If you have any questions or concerns about these Terms, please contact us at:
        </p>
        <p>1 St Xavier Rd, Mumbai 400042, Maharashtra</p>
        <p>Email: <a href="mailto:alerts@pricetrace.tech" className="text-primary underline">alerts@pricetrace.tech</a></p>
        <p>Phone: +91 9967640***</p>

        <p className="mt-8">Thank you for using Pricetrace. We value your trust and look forward to serving you.</p>
      </div>
    </>
  );
};

export default TermsAndServices;
