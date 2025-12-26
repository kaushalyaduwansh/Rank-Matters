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

export default async function Header() {
  const exams = await getRecentExams();
  const { userId } = await auth();

  // REPLACE WITH YOUR LOGO URL
  const LOGO_URL = "https://res.cloudinary.com/diyjz7pvk/image/upload/v1766663877/Rank_m7ctpr.png"; 

  return (
    <div className="">
      
      {/* --- HEADER --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300 h-16 md:h-20">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="h-8 md:h-10 w-auto">
                    <img 
                      src={LOGO_URL} 
                      alt="RankMatters Logo" 
                      className="h-full w-auto object-contain"
                    />
                </div>
            </Link>

            {/* Navigation (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/60 backdrop-blur-md mr-25">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/contact">Contact</NavLink>
                {userId && (
                   <Link href="/dashboard" className="text-sm font-medium text-indigo-600 bg-white shadow-sm px-4 py-2 rounded-full hover:text-indigo-700 transition-all">
                      Dashboard
                   </Link>
                )}
            </div>
            
            {/* Mobile Dashboard Button / Spacer */}
            <div className="flex items-center gap-4">
                {userId ? (
                    <Link href="/dashboard" className="md:hidden">
                        <Button size="sm" variant="outline" className="rounded-full text-indigo-600 border-indigo-200">
                            Dashboard
                        </Button>
                    </Link>
                ) : (
                    <div className="w-8 md:w-0"></div> 
                )}
            </div>
        </div>
      </nav>

     

     
    </div>
  );
}

// --- HELPER COMPONENT ---
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-sm font-medium text-slate-600 px-5 py-2 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-200">
            {children}
        </Link>
    )
}