'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false }); // Optional: Configure the progress bar

const NProgressHandler = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();

    const timer = setTimeout(() => {
      NProgress.done();
    }, 300); // Ensure NProgress finishes after a delay

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
};

export default NProgressHandler;
