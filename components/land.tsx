import Link from 'next/link';
import { db } from '@/db';
import { recentExams } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { ArrowRight, BarChart3, Users, CheckCircle2, Globe2, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import Footer from './footer';
import Header from './header';
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
      
        <Header/>

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
     <Footer/>
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