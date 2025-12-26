import { notFound } from 'next/navigation';
import { db } from '@/db';
import { recentExams, sscResults } from '@/db/schema';
import { eq, and, gt, count } from 'drizzle-orm';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { 
  Trophy, TrendingUp, Users, CalendarDays, 
  MapPin, Clock, Download, Share2, ArrowLeft 
} from "lucide-react";
import Link from 'next/link';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ roll: string }>;
};

// --- 1. DYNAMIC RANK CALCULATION ---
async function getRankStats(examId: number, currentScore: number, category: string, shift: string) {
  // 1. Total Candidates
  const totalStudentsRes = await db.select({ count: count() })
    .from(sscResults)
    .where(eq(sscResults.examId, examId));
  const totalStudents = totalStudentsRes[0].count;

  // 2. Overall Rank (Count people with higher score + 1)
  const rankRes = await db.select({ count: count() })
    .from(sscResults)
    .where(and(
      eq(sscResults.examId, examId),
      gt(sscResults.totalScore, currentScore)
    ));
  const overallRank = rankRes[0].count + 1;

  // 3. Category Rank
  const catRankRes = await db.select({ count: count() })
    .from(sscResults)
    .where(and(
      eq(sscResults.examId, examId),
      eq(sscResults.category, category),
      gt(sscResults.totalScore, currentScore)
    ));
  const categoryRank = catRankRes[0].count + 1;

  // 4. Shift Rank
  const shiftRankRes = await db.select({ count: count() })
    .from(sscResults)
    .where(and(
      eq(sscResults.examId, examId),
      eq(sscResults.testTimeShift, shift),
      gt(sscResults.totalScore, currentScore)
    ));
  const shiftRank = shiftRankRes[0].count + 1;

  // 5. Percentile: ((N - Rank) / N) * 100
  const percentile = totalStudents > 1 
    ? (((totalStudents - overallRank) / totalStudents) * 100).toFixed(2) 
    : '100.00';

  return { overallRank, categoryRank, shiftRank, totalStudents, percentile };
}

// --- 2. DATA FETCHING ---
async function getResultData(slug: string, rollNo: string) {
  // Find Exam
  const exam = await db.query.recentExams.findFirst({
    where: eq(recentExams.url, slug),
  });
  if (!exam) return null;

  // Find Result
  const result = await db.query.sscResults.findFirst({
    where: and(
        eq(sscResults.rollNo, rollNo),
        eq(sscResults.examId, exam.id) 
    ),
  });

  if (!result) return { exam, result: null, stats: null };

  // Calculate Ranks Live
  const stats = await getRankStats(
    exam.id, 
    result.totalScore, 
    result.category || 'UR', 
    result.testTimeShift || ''
  );

  return { exam, result, stats };
}

// --- 3. PAGE COMPONENT ---
export default async function ResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { roll } = await searchParams;

  const data = await getResultData(slug, roll);

  if (!data || !data.result || !data.stats) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200 w-full max-w-sm">
                <h2 className="text-xl font-bold text-slate-800">Result Not Found</h2>
                <p className="text-slate-500 mt-2 text-sm">We couldn't find a result for Roll No: <span className="font-mono bg-gray-100 px-1 rounded">{roll}</span></p>
                <Button asChild variant="outline" className="mt-6 w-full">
                    <Link href={`/${slug}`}><ArrowLeft className="w-4 h-4 mr-2"/> Go Back</Link>
                </Button>
            </div>
        </div>
    );
  }

  const { exam, result, stats } = data;
  
  // Calculate Max Marks Dynamically
  const maxMarks = exam.totalQuestions * exam.rightMark;

  // Parse section details
  const sections = typeof result.sectionDetails === 'string' 
    ? JSON.parse(result.sectionDetails) 
    : result.sectionDetails;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans py-6 px-3 md:py-8 md:px-6">
      <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
        
        {/* TOP NAV / BREADCRUMB */}
        <div className="flex items-center justify-between">
            <Link href={`/${slug}`} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back to Search</span><span className="md:hidden">Back</span>
            </Link>
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="h-8 gap-2 text-xs uppercase tracking-wider font-bold">
                    <Share2 className="w-3 h-3" /> <span className="hidden sm:inline">Share</span>
                 </Button>
                 <Button size="sm" className="h-8 gap-2 text-xs uppercase tracking-wider font-bold bg-slate-900 text-white hover:bg-slate-800">
                    <Download className="w-3 h-3" /> <span className="hidden sm:inline">Print</span>
                 </Button>
            </div>
        </div>

        {/* --- MAIN REPORT CARD --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-none">
            
            {/* 1. HEADER IDENTITY (Stacked on Mobile) */}
            <div className="bg-white p-5 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full md:w-auto">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">{exam.examName}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 w-full sm:w-auto">
                            <Users className="w-4 h-4 text-slate-400 shrink-0" /> 
                            <span className="truncate max-w-[200px]">{result.candidateName}</span>
                        </span>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <span className="flex items-center gap-1.5 font-mono bg-gray-100 px-2 py-0.5 rounded text-slate-700 text-xs">
                                {result.rollNo}
                            </span>
                            <span className="flex items-center gap-1.5">
                                Cat: <span className="font-bold text-slate-700">{result.category}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* BIG SCORE BADGE */}
                <div className="w-full md:w-auto flex flex-col md:items-end bg-blue-50/50 md:bg-transparent p-4 md:p-0 rounded-xl mt-2 md:mt-0">
                    <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end w-full">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Score</span>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 leading-none mt-0 md:mt-1 flex items-baseline">
                            {result.totalScore}
                            <span className="text-base md:text-lg text-slate-400 font-medium ml-1">/ {maxMarks}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KEY STATISTICS GRID (2 columns on mobile, 4 on desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b border-gray-100 bg-gray-50/50">
                <div className="p-4 md:p-5 flex flex-col items-center justify-center text-center">
                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" /> Overall Rank
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-slate-800">#{stats.overallRank}</span>
                    <span className="text-[10px] text-slate-400 mt-1">out of {stats.totalStudents}</span>
                </div>

                <div className="p-4 md:p-5 flex flex-col items-center justify-center text-center">
                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" /> Percentile
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-blue-600">{stats.percentile}%</span>
                    <span className="text-[10px] text-slate-400 mt-1">Top {100 - Number(stats.percentile)}%</span>
                </div>

                <div className="p-4 md:p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Category Rank
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg md:text-xl font-bold text-slate-700">#{stats.categoryRank}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">{result.category}</Badge>
                    </div>
                </div>

                <div className="p-4 md:p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Shift Rank
                    </span>
                    <span className="text-lg md:text-xl font-bold text-slate-700">#{stats.shiftRank}</span>
                    <span className="text-[10px] text-slate-400 mt-1">in this shift</span>
                </div>
            </div>

            {/* 3. DETAILED SUBJECT TABLE (Scrollable container for mobile) */}
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Subject-wise Performance</h3>
                </div>
                
                <div className="rounded-lg border border-gray-200 overflow-x-auto">
                    <Table className="min-w-[500px] md:min-w-full">
                        <TableHeader className="bg-gray-50">
                            <TableRow className="hover:bg-gray-50 border-gray-200">
                                <TableHead className="w-[180px] font-bold text-slate-700 text-xs uppercase pl-4">Subject</TableHead>
                                <TableHead className="text-center font-bold text-green-600 text-xs uppercase">Right</TableHead>
                                <TableHead className="text-center font-bold text-red-500 text-xs uppercase">Wrong</TableHead>
                                <TableHead className="text-center font-bold text-gray-400 text-xs uppercase">Skipped</TableHead>
                                <TableHead className="text-right font-bold text-slate-900 text-xs uppercase pr-4">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sections?.map((sec: any, idx: number) => (
                                <TableRow key={idx} className="border-gray-100 hover:bg-white">
                                    <TableCell className="font-medium text-slate-700 pl-4">{sec.subject}</TableCell>
                                    <TableCell className="text-center text-green-700 font-medium bg-green-50/50">{sec.right}</TableCell>
                                    <TableCell className="text-center text-red-600 bg-red-50/50">{sec.wrong}</TableCell>
                                    <TableCell className="text-center text-gray-400">{sec.unattempted}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-900 bg-gray-50/30 pr-4">{sec.score}</TableCell>
                                </TableRow>
                            ))}
                            {/* TOTAL ROW */}
                             <TableRow className="bg-slate-900 hover:bg-slate-900 border-t-2 border-slate-900">
                                <TableCell className="font-bold text-white pl-4">Grand Total</TableCell>
                                <TableCell className="text-center font-bold text-white opacity-80">
                                    {sections.reduce((acc:any, curr:any) => acc + curr.right, 0)}
                                </TableCell>
                                <TableCell className="text-center font-bold text-white opacity-80">
                                    {sections.reduce((acc:any, curr:any) => acc + curr.wrong, 0)}
                                </TableCell>
                                <TableCell className="text-center font-bold text-white opacity-50">
                                    {sections.reduce((acc:any, curr:any) => acc + curr.unattempted, 0)}
                                </TableCell>
                                <TableCell className="text-right font-black text-white text-lg pr-4">{result.totalScore}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* 4. FOOTER INFO (Stacked on mobile) */}
            <div className="bg-gray-50 border-t border-gray-100 p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <div>
                        <span className="block font-bold text-slate-700">Date</span>
                        {result.testDate}
                    </div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                <div className="h-px w-full bg-gray-200 md:hidden"></div>
                
                 <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                        <span className="block font-bold text-slate-700">Shift</span>
                        {result.testTimeShift}
                    </div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                <div className="h-px w-full bg-gray-200 md:hidden"></div>

                 <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                        <span className="block font-bold text-slate-700">Venue</span>
                        {result.centreName}
                    </div>
                </div>
            </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-medium pb-8">
            Generated by Rank Matters • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}