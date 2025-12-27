"use client"; // This directive is required for usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ 
  href, 
  children 
}: { 
  href: string; 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  
  // Check if this link is currently active
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`text-sm font-medium px-5 py-2 rounded-full transition-all duration-200 ${
        isActive 
          ? "bg-white text-slate-900 shadow-sm font-semibold" // ACTIVE STYLE
          : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm" // INACTIVE STYLE
      }`}
    >
      {children}
    </Link>
  );
}