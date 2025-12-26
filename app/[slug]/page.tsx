import { notFound } from 'next/navigation';
import { db } from '@/db';
import { recentExams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';

// --- IMPORT YOUR CALCULATOR COMPONENTS ---
import CalculateSSC from '../calculate/page';
import CalculateRRB from '../calculate/railway';
import CalculateBank from '../calculate/bank';
import CalculateOthers from '../calculate/others';
import Header from '@/components/header';
import Footer from '@/components/footer';

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. GENERATE DYNAMIC METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) return { title: 'Page Not Found' };

  return {
    title: `Check Your ${exam.examName} Score - Rank Matters`,
    description: exam.description || `Calculate score and rank for ${exam.examName}`,
  };
}

// 2. FETCH DATA HELPER
async function getExamBySlug(slug: string) {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const result = await db
      .select()
      .from(recentExams)
      .where(eq(recentExams.url, decodedSlug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return null;
  }
}

// 3. MAIN PAGE COMPONENT
export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);

  if (!exam) {
    notFound();
  }

  // --- DYNAMIC COMPONENT SELECTION LOGIC ---
  let CalculatorComponent;
  const examType = exam.type ? exam.type.toUpperCase() : 'OTHERS';

  switch (examType) {
    case 'SSC':
      CalculatorComponent = <CalculateSSC examData={exam} />;
      break;
    case 'RAILWAY':  
    case 'RRB':      
      CalculatorComponent = <CalculateRRB />;
      break;
    case 'BANK':
    case 'BANKING':
      CalculatorComponent = <CalculateBank />;
      break;
    default:
      CalculatorComponent = <CalculateOthers />;
      break;
  }

  return (
    // 'min-h-screen' and 'flex-col' ensures Footer stays at the bottom
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Header />

      {/* pt-24: Adds padding at top to clear the fixed Header (approx 96px).
         px-4: Adds side spacing for mobile phones so text doesn't touch edges.
      */}
      <main className="flex-1 w-full pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* --- DYNAMIC HEADER --- */}
          <div className="text-center space-y-3">
            {/* Responsive Text: text-2xl on mobile, text-4xl on desktop */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Check Your <span className="text-primary">{exam.examName}</span> Score
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto px-2">
              {exam.description || 'Enter your response sheet URL below to check your normalized score and rank.'}
            </p>
          </div>

          {/* --- DYNAMIC CALCULATOR RENDER --- */}
          {/* Constrain width to look like a card on desktop */}
          <div className="w-full max-w-xl mx-auto">
            {CalculatorComponent}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}