import React from 'react';
import { Mail, MapPin, Globe, ExternalLink } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = {
  title: 'Contact RankMatters | Official Support & Address',
  description: 'Get in touch with RankMatters for SSC and Railway rank prediction queries. Visit our office in Patna Musallapur Hat or email us at support@growthx100.in.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow mt-16 bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Have questions about your normalized marks or rank? Reach out to us directly through the channels below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Email Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
              <p className="text-slate-500 mb-6 px-4">
                For technical issues, business inquiries, or rank disputes, drop us an email.
              </p>
              <a 
                href="mailto:support@growthx100.in" 
                className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              >
                support@growthx100.in
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Address Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Our Office</h3>
              <p className="text-slate-500 mb-6 px-4">
                Patna Musallapur Hat<br />
                Bihar, India - 800006
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                <Globe size={14} />
                Available 10:00 AM - 6:00 PM
              </span>
            </div>

          </div>

          {/* Quick Support Note */}
          <div className="bg-blue-900 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2 text-white">Need an Instant Update?</h2>
            <p className="text-blue-100 mb-0">
              Check your rank in real-time by submitting your answer key on our homepage. 
              We support <span className="font-bold text-white text-blue-400">SSC CGL, CHSL, MTS, and Railway</span> exams.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}