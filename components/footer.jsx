import Link from 'next/link';
import { db } from '@/db';
import { recentExams } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';

// --- SERVER ACTION ---
async function getRecentExams() {
  const exams = await db.select().from(recentExams).orderBy(desc(recentExams.createdAt));
  return exams;
}

export default async function Footer() {
  const exams = await getRecentExams();
  const { userId } = await auth();

  // REPLACE WITH YOUR LOGO URL
  const LOGO_URL = "https://res.cloudinary.com/diyjz7pvk/image/upload/v1766663877/Rank_m7ctpr.png"; 

  return (
    <div className="">
      
      <footer className="bg-white border-t border-slate-200 py-12 md:py-16">
             <div className="container mx-auto px-6">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                     {/* Brand Column */}
                     <div className="col-span-1 md:col-span-1">
                         <div className="flex items-center gap-2 mb-4">
                             <div className="h-6 w-auto opacity-80 grayscale">
                                  <img src={LOGO_URL} alt="RankMatters" className="h-full object-contain" />
                             </div>
                         </div>
                         <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                             Helping aspirants analyze their performance with precision and trust.
                         </p>
                     </div>
                     
                     {/* Quick Links */}
                     <div>
                         <h4 className="font-bold text-slate-900 mb-4 text-sm">Quick Links</h4>
                         <ul className="space-y-2 text-sm text-slate-500">
                             <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                             <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                             <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                             <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                         </ul>
                     </div>
     
                     {/* Exams */}
                     <div>
                         <h4 className="font-bold text-slate-900 mb-4 text-sm">Exams</h4>
                         <ul className="space-y-2 text-sm text-slate-500">
                             <li><Link href="#" className="hover:text-blue-600">SSC Exams</Link></li>
                             <li><Link href="#" className="hover:text-blue-600">Railway Exams</Link></li>
                             <li><Link href="#" className="hover:text-blue-600">Banking Exams</Link></li>
                             <li><Link href="#" className="hover:text-blue-600">State Exams</Link></li>
                         </ul>
                     </div>
     
                     {/* Connect */}
                     <div>
                         <h4 className="font-bold text-slate-900 mb-4 text-sm">Connect</h4>
                         <div className="flex gap-4">
                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                                 <span className="sr-only">Twitter</span>
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                             </div>
                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.269.156 5.023 1.938 5.179 5.203.06 1.264.072 1.645.072 4.849 0 3.205-.012 3.584-.072 4.849-.156 3.264-1.91 5.023-5.179 5.179-1.265.06-1.646.072-4.85.072-3.205 0-3.584-.012-4.849-.072-3.26-.156-5.024-1.91-5.18-5.18-.059-1.264-.071-1.644-.071-4.849 0-3.204.013-3.583.071-4.849.149-3.227 1.887-5.023 5.18-5.179 1.265-.06 1.644-.072 4.849-.072zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 {/* Bottom Bar */}
                 <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                     <p>&copy; 2025 RankMatters. All rights reserved.</p>
                     <div className="flex gap-4 mt-4 md:mt-0">
                         <Link href="#" className="hover:text-blue-600">Terms</Link>
                         <Link href="#" className="hover:text-blue-600">Privacy</Link>
                         <Link href="#" className="hover:text-blue-600">Cookies</Link>
                     </div>
                 </div>
             </div>
           </footer>

     

     
    </div>
  );
}