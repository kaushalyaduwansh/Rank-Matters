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
import { Loader2, Link as LinkIcon, Users, CheckCircle2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
// Using the same loading skeleton as SSC for consistency
import Loading from "../[slug]/result/loading";

const STATES = [
 "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
"Chhattisgarh", "Goa", "Gujarat", "Haryana",
"Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
"Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
"Mizoram", "Nagaland", "Odisha", "Punjab",
"Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
"Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal","Andaman and Nicobar Islands", "Chandigarh",
"Dadra and Nagar Haveli and Daman and Diu", "Delhi",
"Jammu and Kashmir", "Ladakh",
"Lakshadweep", "Puducherry"
];

export default function CalculateRRB({ examData }: { examData: any }) {
  const [inputUrl, setInputUrl] = useState("");
  const [category, setCategory] = useState("UR");
  const [state, setState] = useState(""); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const brandColor = "lab(55 -44.44 -3.68 / 1)";

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic Validation
    if (!inputUrl.includes("http")) {
      toast.error("Please paste a valid URL starting with http/https");
      setLoading(false);
      return;
    }

    if (!state) {
      toast.error("Please select your State");
      setLoading(false);
      return;
    }

    try {
      // Points to the new RRB specific API route
      const response = await fetch("/api/calculate-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputUrl,
          category: category,
          userState: state, // Passing the selected State
          examId: examData.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate");
      }

      toast.success("Score Calculated Successfully!");
      router.push(`/${examData.url}/result?roll=${data.dbData.rollNo}`);
      
      // Keep loading state true to show skeleton during navigation

    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Error checking result. Please check URL.");
    }
  };

  // 1. LOADING STATE (Full Screen Overlay)
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
            BANK Score Calculator
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs mt-1">
            Enter your response sheet details below
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleCalculate} className="space-y-5">
            
            {/* 1. URL Input */}
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
                  placeholder="https://cdn.digialm.com/.../ViewCandResponse..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="brand-focus font-mono text-xs pl-9 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 transition-all h-10"
                  required
                />
              </div>
            </div>

            {/* 2. RRB Zone Selector (New) */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-3 ml-1">
                Choose State
              </label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="brand-focus w-full pl-3 bg-white border-zinc-200 text-zinc-900 focus:ring-0 focus:ring-offset-0 transition-all h-10">
                   <div className="flex items-center gap-3">
                      <MapPin 
                        className="h-4 w-4 text-zinc-400" 
                        style={{ color: state ? brandColor : undefined }}
                      />
                      <span className="text-sm font-medium">
                        <SelectValue placeholder="Select State" />
                      </span>
                   </div>
                </SelectTrigger>
                <SelectContent className="border-zinc-200 max-h-[200px]">
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Category Selector */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-3 ml-1">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="brand-focus w-full pl-3 bg-white border-zinc-200 text-zinc-900 focus:ring-0 focus:ring-offset-0 transition-all h-10">
                   <div className="flex items-center gap-3">
                      <Users 
                        className="h-4 w-4 text-zinc-400" 
                        style={{ color: category ? brandColor : undefined }}
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