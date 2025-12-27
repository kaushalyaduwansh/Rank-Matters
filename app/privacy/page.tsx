import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = {
  title: 'Privacy Policy | RankMatters - Your Data & Normalization Security',
  description: 'Learn how RankMatters collects and protects your data for SSC, Railway, and other competitive exam rank predictions and normalization.',
};

export default function PrivacyPolicy() {
  const lastUpdated = "October 2023"; // Update this date accordingly

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className=" flex-grow mt-25 mb-20 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8 font-medium">Last Updated: {lastUpdated}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                Welcome to <strong>RankMatters</strong>. We respect your privacy and are committed to protecting the personal data you share with us. This policy explains how we collect, use, and safeguard your information when you use our rank prediction and normalization tools.
              </p>
            </section>

            <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-3">2. Data We Collect</h2>
              <p className="mb-4">To provide accurate rank predictions and normalization for exams like SSC CGL, CHSL, and Railway, we collect the following information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Answer Key Data:</strong> The raw URL or content of your official exam answer key.</li>
                <li><strong>Exam Details:</strong> Shift timing, date, and exam category (e.g., SSC CGL 2024).</li>
                <li><strong>Basic Identifiers:</strong> Name, Email ID, and Roll Number (to prevent duplicate entries).</li>
                <li><strong>Performance Data:</strong> Raw marks obtained, category (General, OBC, SC/ST), and state/zone.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Data</h2>
              <p>By using our tool, you grant RankMatters permission to store your data in our database for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Normalization Calculations:</strong> Comparing your performance against thousands of other aspirants to calculate accurate normalized scores.</li>
                <li><strong>Real-Time Ranking:</strong> Placing you in a live leaderboard among all participants.</li>
                <li><strong>Cutoff Prediction:</strong> Aggregating data to forecast potential cutoffs for various exam stages.</li>
                <li><strong>Future Analysis:</strong> Improving our algorithms for upcoming exam cycles to provide even more precise data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security & Consent</h2>
              <p>
                We do not sell your personal information to third parties. Your data is used exclusively for educational research and ranking purposes. By submitting your answer key, you explicitly consent to:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>The storage of your raw marks and exam details in our secure database.</li>
                <li>The inclusion of your data (anonymized) in our public rank lists and cutoff analysis.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Contact Information</h2>
              <p>
                If you wish to have your data removed from our database or have questions regarding your privacy, please contact us at:
              </p>
              <div className="mt-4 p-4 border-l-4 border-blue-600 bg-slate-50">
                <p className="font-bold text-slate-900">RankMatters Support</p>
                <p>Email: <a href="mailto:support@growthx100.in" className="text-blue-600 underline">support@growthx100.in</a></p>
                <p>Address: Patna Musallapur Hat, Bihar - 800006</p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}