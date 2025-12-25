"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

export default function ResilientCalculator() {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/calculate-ssc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      alert("Error: Check your internet or URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">SSC Answer Key Calculator</CardTitle>
          <p className="text-center text-muted-foreground text-sm">Paste any of the 4 subject links below</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <Input
              placeholder="https://sscexam.cbexams.com/.../ViewCandResponse.aspx?..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="font-mono text-xs"
              required
            />
            <Button className="w-full font-bold" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing 4 Subjects...</> : "Calculate Score"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex justify-between items-center">
              Final Results
              <span className="text-3xl font-black text-primary">{results.score.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="text-green-500 w-4 h-4" /> Correct
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-bold">{results.correct}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <XCircle className="text-red-500 w-4 h-4" /> Wrong
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-bold">{results.wrong}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <MinusCircle className="text-gray-400 w-4 h-4" /> Not Attempted
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{results.unattempted}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}