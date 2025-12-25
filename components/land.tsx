import Link from 'next/link';
import { db } from '@/db';
import { recentExams } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { ArrowRight, BarChart3, Users, CheckCircle2, Globe2, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';

// --- SERVER ACTION ---
async function getRecentExams() {
  const exams = await db.select().from(recentExams).orderBy(desc(recentExams.createdAt));
  return exams;
}

export default async function LandingPage() {
  const exams = await getRecentExams();
  const { userId } = await auth();

  // REPLACE WITH YOUR LOGO URL
  const LOGO_URL = "https://res.cloudinary.com/diyjz7pvk/image/upload/v1766663877/Rank_m7ctpr.png"; 

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-indigo-100 flex flex-col">
      
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

      <main className="pt-24 md:pt-36 flex-grow container mx-auto px-4 md:px-6 max-w-6xl">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center mb-8 md:mb-20 space-y-4 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] md:text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                <Sparkles className="w-3 h-3 fill-indigo-600" /> 
                New Answer Keys Added
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
                Score Calculator <br className="hidden md:block" />
                <span className="text-slate-400 font-medium text-2xl md:text-5xl block mt-1 md:mt-3">
                    & Rank Predictor
                </span>
            </h1>
            
            <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Check your normalized marks and rank for online exams instantly.
            </p>
        </div>

        {/* --- EXAM CARDS SECTION --- */}
        <div className="mb-20 md:mb-28">
            <div className="flex items-center justify-between mb-6 md:mb-8 px-1">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                    </span>
                    Recent Added Answer Keys
                </h2>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {exams.map((exam) => (
                    <ProfessionalCard key={exam.id} data={exam} />
                ))}
                
                {exams.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 className="text-slate-300 w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">No active answer keys found.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- SEO & INFO SECTION --- */}
        <div className="grid md:grid-cols-12 gap-12 mb-24 border-t border-slate-200 pt-16 md:pt-20">
            <div className="md:col-span-7 space-y-6 md:space-y-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Why RankMatters?</h3>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                    We process thousands of student entries to provide the most statistically accurate rank prediction. 
                    Our normalization logic mimics the actual commission formulas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-2">
                    {[
                        { icon: BarChart3, title: "Real-time Normalization", desc: "Dynamic shift-wise adjustment" },
                        { icon: Users, title: "Category-wise Ranks", desc: "See where you stand in your vertical" },
                        { icon: CheckCircle2, title: "Accuracy Assured", desc: "Algorithm verified with past results" },
                        { icon: Globe2, title: "All India Standing", desc: "Compare with 50,000+ students" },
                    ].map((feature, i) => (
                        <div key={i} className="flex gap-4 items-start group hover:bg-white p-3 rounded-xl transition-colors">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                                <feature.icon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{feature.title}</h4>
                                <p className="text-slate-500 text-xs mt-1">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    🔥 Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2.5">
                    {[
                        "SSC CGL Tier 1", "RRB NTPC", "Railway Group D",
                        "SSC CHSL", "Bihar SSC", "UP Police", 
                        "CSIR ASO", "IBPS PO", "SBI Clerk"
                    ].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 cursor-pointer transition-all">
                            {tag}
                        </span>
                    ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-slate-100">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Latest Activity</p>
                     <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <p className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-900">SSC CGL 2024</span> answer key link updated. 
                                <span className="text-slate-400 text-xs block mt-0.5">2 hours ago</span>
                            </p>
                        </div>
                     </div>
                </div>
            </div>
        </div>

      </main>

      {/* --- FOOTER (Restored Content) --- */}
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

// --- HELPER COMPONENT ---
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-sm font-medium text-slate-600 px-5 py-2 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-200">
            {children}
        </Link>
    )
}

// --- UPDATED CARD COMPONENT WITH BLURRED BACKGROUND ---
function ProfessionalCard({ data }: { data: any }) {
    return (
        <Link href={data.url} className="block h-full">
            <div className="group relative h-full bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden">
                
                {/* 1. BLURRED IMAGE BACKGROUND
                   This creates the "modern vibe" and dynamic color glow based on the exam logo.
                */}
                <div className="absolute -bottom-16 -left-16 w-48 h-48 opacity-[0.12] blur-[70px] pointer-events-none group-hover:opacity-[0.20] transition-opacity duration-500 will-change-transform z-0">
                     <img 
                        src={data.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        aria-hidden="true"
                     />
                </div>

                {/* 2. CARD CONTENT (Relative z-10 to stay above the blur) */}
                <div className="relative z-10 flex items-start gap-4 md:gap-5">
                    
                    {/* Logo Container */}
                    <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-white border border-slate-100 p-2 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        <img 
                            src={data.imageUrl} 
                            alt={data.examName} 
                            className="w-full h-full object-contain mix-blend-multiply" 
                        />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                             <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Now</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight truncate pr-2 group-hover:text-indigo-600 transition-colors">
                            {data.examName}
                        </h3>
                        <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
                            Check Score & Rank
                        </p>
                    </div>
                </div>

                {/* Bottom Action Area */}
                <div className="relative z-10 mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className={`text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500 ${data.type === 'SSC' ? 'group-hover:bg-orange-100 group-hover:text-orange-700' : 'group-hover:bg-blue-100 group-hover:text-blue-700'} transition-colors`}>
                        {data.type}
                    </span>

                    {/* Analyze button visible by default, moves slightly on hover */}
                    <div className="flex items-center gap-1 text-indigo-600 text-xs md:text-sm font-semibold group-hover:gap-2 transition-all duration-300">
                        Analyze <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                </div>
            </div>
        </Link>
    )
}