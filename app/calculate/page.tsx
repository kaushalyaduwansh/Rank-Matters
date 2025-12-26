"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Link as LinkIcon, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function CalculateSSC({ examData }: { examData: any }) {
  const [inputUrl, setInputUrl] = useState("");
  const [category, setCategory] = useState("UR");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!inputUrl.includes("http")) {
      toast.error("Please paste a valid URL starting with http/https");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/calculate-ssc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputUrl,
          category: category,
          examId: examData.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate");
      }

      toast.success("Score Calculated Successfully!");
      router.push(`/${examData.url}/result?roll=${data.dbData.rollNo}`);

    } catch (err: any) {
      toast.error(err.message || "Error checking result. Please check URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-0">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900">
            SSC Answer Key Calculator
          </CardTitle>
          <CardDescription className="text-slate-500">
            Paste any of the 4 subject links below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-6">
            
            {/* 1. URL Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Response Sheet URL
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <Input
                  placeholder="https://sscexam.cbexams.com/..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  // Added focus-visible classes for the subtle green effect
                  className="pl-10 h-11 text-sm bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* 2. Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger 
                  // Matching the Input style exactly
                  className="w-full h-11 pl-3 bg-slate-50 border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                >
                   <div className="flex items-center gap-3 w-full">
                      <Users className="h-4 w-4 text-slate-400" />
                      {/* Truncate ensures text doesn't break layout if too long */}
                      <span className="truncate">
                        <SelectValue placeholder="Select Category" />
                      </span>
                   </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UR">UR (Unreserved)</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Button - Matches the Emerald Green from your screenshot */}
            <Button 
              className="w-full h-11 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all mt-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Calculate Score"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}