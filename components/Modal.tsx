"use client"

import { FormEvent, Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import { addUserEmailToProductWithAlert } from '@/lib/actions'  // Make sure this function is updated in your actions

interface Props {
  productId: string
}

const Modal = ({ productId }: Props) => {
  let [isOpen, setIsOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState<number | string>(''); // Add state for target price

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Ensure targetPrice is converted to a number
    const targetPriceNumber = parseFloat(targetPrice as string);
  
    if (!isNaN(targetPriceNumber)) {
      try {
        // Pass email and parsed targetPrice to the backend
        await addUserEmailToProductWithAlert(productId, email, targetPriceNumber);
        alert("You are now tracking this product!");
  
        setIsSubmitting(false);
        setEmail("");
        setTargetPrice(""); // Reset form fields
        closeModal();
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to track the product. Please try again.");
        setIsSubmitting(false);
      }
    } else {
      alert("Please enter a valid target price.");
      setIsSubmitting(false);
    }
  };
  

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" onClose={closeModal} className="dialog-container">
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" /> 
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            />
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="dialog-content">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div className="p-3 border border-gray-200 rounded-10">
                      <Image 
                        src="/assets/icons/logo.svg"
                        alt="logo"
                        width={28}
                        height={28}
                      />
                    </div>

                    <Image 
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      width={24}
                      height={24}
                      className="cursor-pointer"
                      onClick={closeModal}
                    />
                  </div>

                  <h4 className="dialog-head_text">
                    Stay updated with product pricing alerts
                  </h4>

                  <p className="text-sm text-gray-600 mt-2">
                    Never miss a bargain again! Get timely updates right in your inbox.
                  </p>
                </div>

                <form className="flex flex-col mt-5" onSubmit={handleSubmit}>  
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="dialog-input_container">
                    <Image 
                      src="/assets/icons/mail.svg"
                      alt='mail'
                      width={18}
                      height={18}
                    />

                    <input 
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Your Email Address"
                      className='dialog-input'
                    />
                  </div>

                  <label htmlFor="targetPrice" className="text-sm font-medium text-gray-700 mt-4">
                    Target Price
                  </label>
                  <div className="dialog-input_container">
                    <Image 
                      src="/assets/icons/price-tag.svg"
                      alt='price'
                      width={18}
                      height={18}
                    />

                    <input 
                      required
                      type="number"
                      id="targetPrice"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="Enter Your Target Price"
                      className='dialog-input'
                    />
                  </div>

                  <button type="submit" className="dialog-btn">
                    {isSubmitting ? 'Submitting...' : 'Track'}
                  </button>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Modal