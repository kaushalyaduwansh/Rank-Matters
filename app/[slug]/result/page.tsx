import { db } from '@/db';
import { recentExams, sscResults, BankResults, OtherResults, rrbResults } from '@/db/schema';
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

// --- 1. STANDARDIZED INTERFACE ---
interface NormalizedResult {
  rollNo: string;
  candidateName: string;
  category: string;
  testDate: string;
  testTimeShift: string;
  centreName: string;
  totalScore: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  state?: string; 
  rrbZone?: string; 
  sectionDetails: any[];
}

// --- 2. RANK CALCULATION ---
async function getStats(
  examId: number, 
  table: any, 
  currentScore: number, 
  category: string, 
  shift: string,
  regionValue?: string 
) {
  const totalRes = await db.select({ count: count() }).from(table).where(eq(table.examId, examId));
  const totalStudents = totalRes[0].count;

  const rankRes = await db.select({ count: count() }).from(table)
    .where(and(eq(table.examId, examId), gt(table.totalScore, currentScore)));
  const overallRank = rankRes[0].count + 1;

  const catRes = await db.select({ count: count() }).from(table)
    .where(and(eq(table.examId, examId), eq(table.category, category), gt(table.totalScore, currentScore)));
  const categoryRank = catRes[0].count + 1;

  const shiftRes = await db.select({ count: count() }).from(table)
    .where(and(eq(table.examId, examId), eq(table.testTimeShift, shift), gt(table.totalScore, currentScore)));
  const shiftRank = shiftRes[0].count + 1;

  let regionRank = 0;
  let regionCatRank = 0;

  if (regionValue) {
    const regionColumn = table === BankResults ? (table as any).state : (table as any).rrbZone;

    if (regionColumn) {
        const rRes = await db.select({ count: count() }).from(table)
          .where(and(eq(table.examId, examId), eq(regionColumn, regionValue), gt(table.totalScore, currentScore)));
        regionRank = rRes[0].count + 1;

        const rcRes = await db.select({ count: count() }).from(table)
          .where(and(eq(table.examId, examId), eq(regionColumn, regionValue), eq(table.category, category), gt(table.totalScore, currentScore)));
        regionCatRank = rcRes[0].count + 1;
    }
  }

  const percentile = totalStudents > 1 
    ? (((totalStudents - overallRank) / totalStudents) * 100).toFixed(2) : '100.00';

  return { overallRank, categoryRank, shiftRank, totalStudents, percentile, regionRank, regionCatRank };
}

// --- 3. DATA FETCHING ---
async function getResultData(slug: string, rollNo: string) {
  const exam = await db.query.recentExams.findFirst({
    where: eq(recentExams.url, slug),
  });
  if (!exam) return null;

  const examType = exam.type?.toUpperCase() || "";
  const isBank = examType === 'BANK';
  const isSSC = examType === 'SSC';
  const isRRB = examType === 'RRB';
  
  let targetTable: any;
  if (isBank) targetTable = BankResults;
  else if (isSSC) targetTable = sscResults;
  else if (isRRB) targetTable = rrbResults;
  else targetTable = OtherResults;

  const rawResult = await db.select().from(targetTable)
    .where(and(eq(targetTable.rollNo, rollNo), eq(targetTable.examId, exam.id)))
    .limit(1)
    .then(res => res[0] as any);

  if (!rawResult) return { exam, result: null, stats: null, isBank, isRRB };

  const sections = typeof rawResult.sectionDetails === 'string' 
    ? JSON.parse(rawResult.sectionDetails) 
    : rawResult.sectionDetails || [];

  const normalizedResult: NormalizedResult = {
    rollNo: rawResult.rollNo,
    candidateName: rawResult.candidateName,
    category: rawResult.category || 'UR',
    testDate: rawResult.testDate || '',
    testTimeShift: rawResult.testTimeShift || '',
    centreName: rawResult.centreName || '',
    totalScore: rawResult.totalScore,
    state: rawResult.state, 
    rrbZone: rawResult.rrbZone, 
    sectionDetails: sections,
    totalCorrect: rawResult.totalCorrect ?? sections.reduce((acc:any, curr:any) => acc + (curr.right || 0), 0),
    totalWrong: rawResult.totalWrong ?? sections.reduce((acc:any, curr:any) => acc + (curr.wrong || 0), 0),
    totalUnattempted: rawResult.totalUnattempted ?? sections.reduce((acc:any, curr:any) => acc + (curr.unattempted || 0), 0),
  };

  const regionValue = isBank ? normalizedResult.state : normalizedResult.rrbZone;

  const stats = await getStats(
    exam.id, 
    targetTable, 
    normalizedResult.totalScore, 
    normalizedResult.category, 
    normalizedResult.testTimeShift, 
    regionValue
  );

  return { exam, result: normalizedResult, stats, isBank, isRRB };
}

// --- 4. PAGE COMPONENT ---
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

  const { exam, result, stats, isBank, isRRB } = data;

  // --- UPDATED MAX MARKS CALCULATION ---
  // Calculates Max Marks as the sum of all attempted and unattempted questions
  const maxMarks = result.totalCorrect + result.totalWrong + result.totalUnattempted;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans py-4 px-2 md:py-8 md:px-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        
        {/* TOP NAV */}
        <div className="flex items-center justify-between">
            <Link href={`/${slug}`} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back to Search</span><span className="md:hidden">Back</span>
            </Link>
            <div className="flex gap-2">
                 <Button size="sm" className="h-8 gap-2 text-xs uppercase tracking-wider font-bold bg-slate-900 text-white hover:bg-slate-800">
                    <Download className="w-3 h-3" /> <span className="hidden sm:inline">Print</span>
                 </Button>
            </div>
        </div>

        {/* --- REPORT CARD --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden print:shadow-none print:border-none">
            
            {/* 1. HEADER */}
            <div className="bg-white p-4 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <div className="w-full md:w-auto">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">{exam.examName}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 w-full sm:w-auto">
                            <Users className="w-4 h-4 text-slate-400 shrink-0" /> Name: 
                            <span className="truncate max-w-[200px]">{result.candidateName}</span>
                        </span>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <span className="flex items-center gap-1.5 font-mono bg-gray-100 px-2 py-0.5 rounded text-slate-700 text-xs">
                                {result.rollNo}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">{result.category}</Badge>
                            
                            {isBank && result.state && (
                                <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50">
                                    {result.state}
                                </Badge>
                            )}

                            {isRRB && result.rrbZone && (
                                <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50">
                                    {result.rrbZone}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* SCORE */}
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

            {/* 2. STATS GRID */}
            <div className={`grid grid-cols-2 ${(isBank || isRRB) ? 'md:grid-cols-3 lg:grid-cols-6' : 'md:grid-cols-4'} divide-x divide-y md:divide-y-0 border-b border-gray-100 bg-gray-50/50`}>
                <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rank</span>
                    <span className="text-lg md:text-xl font-bold text-slate-800">#{stats.overallRank}</span>
                    <span className="text-[9px] md:text-[10px] text-slate-400">/{stats.totalStudents}</span>
                </div>
                <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Percentile</span>
                    <span className="text-lg md:text-xl font-bold text-blue-600">{stats.percentile}%</span>
                </div>
                <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cat. Rank</span>
                    <span className="text-lg md:text-lg font-bold text-slate-700">#{stats.categoryRank}</span>
                </div>
                
                {(isBank || isRRB) && (
                    <>
                        <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center bg-blue-50/30">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                                {isBank ? "State Rank" : "Zone Rank"}
                            </span>
                            <span className="text-lg md:text-lg font-bold text-blue-700">#{stats.regionRank}</span>
                        </div>
                        <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center bg-blue-50/30">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                                {isBank ? "State+Cat" : "Zone+Cat"}
                            </span>
                            <span className="text-lg md:text-lg font-bold text-blue-700">#{stats.regionCatRank}</span>
                        </div>
                    </>
                )}
                
                <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shift</span>
                    <span className="text-lg md:text-lg font-bold text-slate-700">#{stats.shiftRank}</span>
                </div>
            </div>

            {/* 3. TABLE */}
            <div className="p-3 md:p-8">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table className="w-full">
                        <TableHeader className="bg-gray-50">
                            <TableRow className="hover:bg-gray-50 border-gray-200">
                                <TableHead className="w-[80px] md:w-[180px] font-bold text-slate-700 text-[10px] md:text-xs uppercase pl-2 md:pl-4">
                                    <span className="md:hidden">Sub</span>
                                    <span className="hidden md:inline">Subject</span>
                                </TableHead>
                                <TableHead className="text-center font-bold text-green-600 text-[10px] md:text-xs uppercase px-1">
                                    <span className="md:hidden">R</span>
                                    <span className="hidden md:inline">Right</span>
                                </TableHead>
                                <TableHead className="text-center font-bold text-red-500 text-[10px] md:text-xs uppercase px-1">
                                    <span className="md:hidden">W</span>
                                    <span className="hidden md:inline">Wrong</span>
                                </TableHead>
                                <TableHead className="text-center font-bold text-gray-400 text-[10px] md:text-xs uppercase px-1">
                                    <span className="md:hidden">S</span>
                                    <span className="hidden md:inline">Skipped</span>
                                </TableHead>
                                <TableHead className="text-right font-bold text-slate-900 text-[10px] md:text-xs uppercase pr-2 md:pr-4">
                                    Score
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.sectionDetails.map((sec: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-white text-[10px] md:text-sm">
                                    <TableCell className="font-medium text-slate-700 pl-2 md:pl-4 py-2 truncate max-w-[80px] md:max-w-none">
                                        {sec.subject}
                                    </TableCell>
                                    <TableCell className="text-center text-green-700 font-medium bg-green-50/50 px-1 py-2">{sec.right}</TableCell>
                                    <TableCell className="text-center text-red-600 bg-red-50/50 px-1 py-2">{sec.wrong}</TableCell>
                                    <TableCell className="text-center text-gray-400 px-1 py-2">{sec.unattempted}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-900 bg-gray-50/30 pr-2 md:pr-4 py-2">{sec.score}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-slate-900 hover:bg-slate-900 border-t-2 border-slate-900 text-[10px] md:text-sm">
                                <TableCell className="font-bold text-white pl-2 md:pl-4 py-2">Total</TableCell>
                                <TableCell className="text-center font-bold text-white opacity-80 px-1 py-2">{result.totalCorrect}</TableCell>
                                <TableCell className="text-center font-bold text-white opacity-80 px-1 py-2">{result.totalWrong}</TableCell>
                                <TableCell className="text-center font-bold text-white opacity-50 px-1 py-2">{result.totalUnattempted}</TableCell>
                                <TableCell className="text-right font-black text-white text-sm md:text-lg pr-2 md:pr-4 py-2">{result.totalScore}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* 4. FOOTER */}
            <div className="bg-gray-50 border-t border-gray-100 p-4 md:p-6 flex flex-col md:flex-row gap-3 md:gap-6 text-[10px] md:text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                    <div><span className="block font-bold text-slate-700">Date</span>{result.testDate}</div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                    <div><span className="block font-bold text-slate-700">Shift</span>{result.testTimeShift}</div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                    <div><span className="block font-bold text-slate-700">Venue</span>{result.centreName}</div>
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