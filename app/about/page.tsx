import React from 'react';
import { Mail, MapPin, CheckCircle2, BarChart3, GraduationCap } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = {
  title: 'About RankMatters | Real-Time Rank Predictor & Normalization Tool',
  description: 'RankMatters helps students calculate normalized marks and real-time ranks for SSC CGL, CHSL, MTS, Railway NTPC, Group D, and more.',
};

export default function AboutPage() {
  const exams = [
    "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SSC CPO",
    "Railway NTPC", "Railway Group D", "RRB ALP", 
    "State PCS", "Banking Exams", "Delhi Police"
  ];

  return (
    <div>
        <Header/>
    <div className="mt-5 bg-white text-slate-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-blue-900 mb-6">
            Your Rank  <span className="text-blue-600">Matters.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            <span className="font-bold text-blue-600">RankMatters</span>, the ultimate rank predictor and normalization tool, empowers students to accurately estimate their ranks in competitive exams like SSC and Railway. Our advanced algorithms analyze your scores in real-time, providing instant insights and helping you strategize your preparation effectively.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-8 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <BarChart3 className="text-blue-600 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Real-Time Ranking</h3>
            <p className="text-slate-500">See where you stand among thousands of candidates instantly after submitting your answer key.</p>
          </div>
          <div className="p-8 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <CheckCircle2 className="text-blue-600 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Normalization Logic</h3>
            <p className="text-slate-500">We use precise mathematical formulas to predict your normalized scores across different shifts.</p>
          </div>
          <div className="p-8 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap className="text-blue-600 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Comprehensive Coverage</h3>
            <p className="text-slate-500">From Central to State-level exams, we cover every major competitive test in India.</p>
          </div>
        </div>
      </section>

      {/* SEO-Rich Exams Section */}
      <section className="py-16 bg-slate-50 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Exams We Support</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {exams.map((exam) => (
              <span key={exam} className="px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 shadow-sm">
                {exam} Rank Predictor
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-blue-900 rounded-3xl p-10 md:p-16 text-white overflow-hidden relative">
          <div className="relative z-10 grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-blue-100 mb-8">Have questions about your rank or normalization? Our support team is here to help you 24/7.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-blue-400 mt-1" />
                  <div>
                    <p className="font-bold">Our Office</p>
                    <p className="text-blue-200">Patna Musallapur Hat, 800006</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="text-blue-400 mt-1" />
                  <div>
                    <p className="font-bold">Email Us</p>
                    <a href="mailto:support@growthx100.in" className="text-blue-200 hover:text-white underline">support@growthx100.in</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
               <div className="w-full h-48 bg-blue-800 rounded-xl flex items-center justify-center border border-blue-700">
                  <span className="text-blue-300 font-mono tracking-widest text-xl italic font-bold">RankMatters</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </div>
  );
}