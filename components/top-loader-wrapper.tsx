"use client";

import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { useEffect } from 'react';

export default function TopLoaderWrapper() {
  const pathname = usePathname();

  // 1. Hide on result pages (standard logic)
  if (pathname?.endsWith('/result')) {
    return null;
  }

  return (
    <>
      <NextTopLoader
        // We set a base color, but the CSS below overrides it with a gradient
        color="#6366f1"
        initialPosition={0.08}
        crawlSpeed={200}
        height={2} // Slightly thicker to show off the gradient
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        // "Sick" Shadow: A tight indigo glow + a wider purple ambient glow
        shadow="0 0 10px #63f197ff, 0 0 20px #1fa659ff"
        zIndex={1600}
      />

      {/* 2. GLOBAL CSS OVERRIDE 
         This forces the bar to use a Gradient instead of a solid color.
      */}
      <style jsx global>{`
        #nprogress .bar {
          background: linear-gradient(90deg, #5cd766ff 0%, #55f786ff 50%, #21b563ff 100%) !important;
        }
        /* Optional: Makes the "peg" (the leading edge) invisible so the gradient flows smoothly */
        #nprogress .peg {
          display: none !important;
        }
      `}</style>
    </>
  );
}