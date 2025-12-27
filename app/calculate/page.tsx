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
import { Loader2, Link as LinkIcon, Users, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
// Make sure this path is correct based on where you saved the skeleton
import Loading from "../[slug]/result/loading";

export default function CalculateSSC({ examData }: { examData: any }) {
  const [inputUrl, setInputUrl] = useState("");
  const [category, setCategory] = useState("UR");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const brandColor = "lab(55 -44.44 -3.68 / 1)";

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
      
      // Do NOT set loading(false). 
      // The fixed overlay will stay until the new page completely loads.

    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Error checking result. Please check URL.");
    }
  };

  // 1. LOADING STATE: 
  // We use 'fixed inset-0' to break out of the small form container 
  // and cover the whole screen, matching 'loading.tsx' perfectly.
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F9FA] overflow-y-auto py-6 px-3 md:py-8 md:px-6">
        <Loading />
      </div>
    );
  }

  // 2. NORMAL STATE
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <style jsx>{`
        .brand-focus:focus, 
        .brand-focus:focus-visible,
        .brand-focus[data-state="open"] {
          border-color: ${brandColor} !important;
          box-shadow: 0 0 0 1px ${brandColor} !important;
          outline: none !important;
          ring: 0 !important;
        }
      `}</style>

      <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="mt-[-17] bg-zinc-50 border-b border-zinc-100 pt-6 pb-4 text-center">
          <div className="mx-auto w-10 h-10 bg-white border border-zinc-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
            <CheckCircle2 
              className="h-5 w-5" 
              style={{ color: brandColor }}
            />
          </div>
          <CardTitle className="text-xl font-bold text-zinc-900 tracking-tight">
            SSC Answer Key Calculator
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs mt-1">
            Enter your response sheet URL below
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleCalculate} className="space-y-5">
            
            {/* URL Input */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-3 ml-1">
                Response Sheet URL
              </label>
              <div className="relative group">
                <div 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors"
                  style={{ color: inputUrl ? brandColor : undefined }}
                >
                  <LinkIcon className="h-4 w-4" />
                </div>
                <Input
                  placeholder="https://sscexam.cbexams.com/.../ViewCandResponse.aspx?..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="brand-focus font-mono text-xs pl-9 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 transition-all h-10"
                  required
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-3 ml-1">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger 
                  className=" w-full "
                >
                   <div className="flex items-center gap-3">
                      <Users 
                        className="h-4 w-4 text-zinc-400" 
                        
                      />
                      <span className="text-sm font-medium">
                        <SelectValue placeholder="Select Category" />
                      </span>
                   </div>
                </SelectTrigger>
                <SelectContent className="border-zinc-200">
                  <SelectItem value="UR">UR (Unreserved)</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full font-medium text-white shadow-sm transition-all h-10"
              style={{ backgroundColor: brandColor }}
              disabled={loading}
              type="submit"
            >
              Check Score
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}