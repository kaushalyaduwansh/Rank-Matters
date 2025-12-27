import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6 px-3 md:py-8 md:px-6">
      <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
        
        {/* TOP NAV SKELETON */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-slate-300" />
                <Skeleton className="h-4 w-24 bg-slate-200" />
            </div>
            <div className="flex gap-2">
                 <Skeleton className="h-8 w-20 rounded-md bg-slate-200" />
                 <Skeleton className="h-8 w-20 rounded-md bg-slate-300" />
            </div>
        </div>

        {/* --- MAIN REPORT CARD SKELETON --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            
            {/* 1. HEADER IDENTITY */}
            <div className="bg-white p-5 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full md:w-auto space-y-3">
                    {/* Exam Name */}
                    <Skeleton className="h-8 w-3/4 md:w-96 bg-slate-200 rounded-lg" />
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-3">
                        <Skeleton className="h-5 w-32 bg-slate-100 rounded" />
                        <Skeleton className="h-5 w-24 bg-slate-100 rounded" />
                        <Skeleton className="h-5 w-20 bg-slate-100 rounded" />
                    </div>
                </div>

                {/* SCORE BADGE */}
                <div className="w-full md:w-auto flex flex-col md:items-end mt-2 md:mt-0 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                    <Skeleton className="h-3 w-16 mb-2 bg-slate-200" />
                    <Skeleton className="h-12 w-32 bg-slate-300 rounded-lg" />
                </div>
            </div>

            {/* 2. KEY STATISTICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b border-gray-100 bg-gray-50/50">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 md:p-5 flex flex-col items-center justify-center space-y-2">
                        <Skeleton className="h-3 w-20 bg-slate-200" />
                        <Skeleton className="h-8 w-16 bg-slate-300 rounded" />
                        <Skeleton className="h-2 w-12 bg-slate-200" />
                    </div>
                ))}
            </div>

            {/* 3. DETAILED SUBJECT TABLE */}
            <div className="p-4 md:p-8 space-y-4">
                <Skeleton className="h-4 w-48 bg-slate-300" />
                
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                    {/* Header Row */}
                    <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4">
                        <Skeleton className="h-3 w-full bg-slate-200" />
                    </div>
                    {/* Data Rows */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 border-b border-gray-100 flex items-center px-4 gap-4">
                            <Skeleton className="h-3 w-1/3 bg-slate-100" />
                            <Skeleton className="h-3 w-full bg-slate-50" />
                        </div>
                    ))}
                    {/* Total Row */}
                    <div className="h-14 bg-slate-900 flex items-center px-4">
                        <Skeleton className="h-4 w-full bg-slate-700 opacity-50" />
                    </div>
                </div>
            </div>

            {/* 4. FOOTER INFO */}
            <div className="bg-gray-50 border-t border-gray-100 p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                <Skeleton className="h-10 w-full md:w-1/3 bg-slate-200 rounded-lg" />
                <Skeleton className="h-10 w-full md:w-1/3 bg-slate-200 rounded-lg" />
                <Skeleton className="h-10 w-full md:w-1/3 bg-slate-200 rounded-lg" />
            </div>
        </div>
        
        <div className="flex justify-center">
             <Skeleton className="h-3 w-48 bg-slate-200" />
        </div>
      </div>
    </div>
  );
}