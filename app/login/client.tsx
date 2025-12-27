"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface ExamOption {
  name: string;
  url: string;
}

export default function LoginClient({ exams }: { exams: ExamOption[] }) {
  const [selectedExamUrl, setSelectedExamUrl] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const brandColor = "lab(55 -44.44 -3.68 / 1)";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExamUrl) {
      toast.error("Please select an exam");
      return;
    }
    if (!rollNo) {
      toast.error("Please enter your roll number");
      return;
    }

    setLoading(true);

    const targetUrl = `/${selectedExamUrl}/result?roll=${rollNo.trim()}`;
    router.push(targetUrl);
  };

  return (
    <div className="w-full max-w-md">
      <style jsx>{`
        .brand-focus:focus, 
        .brand-focus:focus-visible,
        .brand-focus[data-state="open"] {
          border-color: ${brandColor} !important;
          box-shadow: 0 0 0 1px ${brandColor} !important;
          outline: none !important;
        }
      `}</style>

      <Card className="mt-20 bg-white border border-zinc-200 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="text-center bg-zinc-50/50 border-b border-zinc-100 pb-6 pt-8">
          <CardTitle className="text-2xl font-bold text-zinc-900">
            Check Result
          </CardTitle>
          <CardDescription className="mt-2">
            Select your exam to view your rank
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Exam Selector */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-zinc-700 mb-2 ml-1">
                Select Exam
              </label>
              <Select onValueChange={setSelectedExamUrl} value={selectedExamUrl}>
                {/* Added w-full to ensure full width */}
                <SelectTrigger className="brand-focus w-full h-12 bg-white text-base">
                  <SelectValue placeholder="Choose Exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.length > 0 ? (
                    exams.map((exam) => (
                      <SelectItem key={exam.url} value={exam.url} className="py-3">
                        {exam.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No exams available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Roll Number Input */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-zinc-700 mb-2 ml-1">
                Roll Number
              </label>
              <Input 
                placeholder="Enter Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                // Increased height to h-12 for better mobile touch
                className="brand-focus h-12 text-base w-full"
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 font-semibold text-white mt-2 text-base shadow-md transition-all active:scale-[0.98]"
              style={{ backgroundColor: brandColor }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  View Result <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}