import { db } from "@/db"; 
import { sscResults, recentExams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function getNormalizedUrls(inputUrl: string): string[] {
  const basePattern = /(ViewCandResponse)\d*/i;
  const baseUrl = inputUrl.trim().replace(basePattern, "ViewCandResponse");
  return [
    baseUrl,
    baseUrl.replace("ViewCandResponse", "ViewCandResponse2"),
    baseUrl.replace("ViewCandResponse", "ViewCandResponse3"),
    baseUrl.replace("ViewCandResponse", "ViewCandResponse4"),
  ];
}

export async function POST(req: Request) {
  try {
    const { url, category, examId } = await req.json();

    if (!url || !examId) {
        return NextResponse.json({ error: "Missing URL or Exam ID" }, { status: 400 });
    }

    // 1. Fetch Exam Settings
    const examSettings = await db.query.recentExams.findFirst({
        where: eq(recentExams.id, examId),
    });

    if (!examSettings) {
        return NextResponse.json({ error: "Exam settings not found" }, { status: 404 });
    }

    const POSITIVE_MARK = examSettings.rightMark ?? 2;
    const NEGATIVE_MARK = examSettings.wrongMark ?? 0.5;

    const urls = getNormalizedUrls(url);
    const pages = await Promise.all(
      urls.map((u: string) => 
        fetch(u, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.text() : ""))
      )
    );

    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0;
    const subjectScores: number[] = [];
    const detailedStats: any[] = [];

    // --- SCORING LOGIC ---
    pages.forEach((html: string, index: number) => {
      const subjectName = ["Reasoning", "GK", "Quant", "English"][index] || `Subject ${index+1}`;

      if (!html) {
        subjectScores.push(0);
        detailedStats.push({ subject: subjectName, right: 0, wrong: 0, unattempted: 0, score: 0 });
        return;
      }

      const $ = cheerio.load(html);
      let sCorrect = 0, sWrong = 0, sUnattemptRaw = 0;

      $('td[bgcolor]').each((_, el) => {
        const color = $(el).attr('bgcolor')?.toLowerCase();
        if (color === 'green') sCorrect++;
        if (color === 'red') sWrong++;
        if (color === 'yellow') sUnattemptRaw++;
      });

      const sRealUnattempted = Math.max(0, sUnattemptRaw - sWrong); 
      const sectionScore = (sCorrect * POSITIVE_MARK) - (sWrong * NEGATIVE_MARK);
      
      subjectScores.push(sectionScore);
      totalCorrect += sCorrect;
      totalWrong += sWrong;
      totalUnattempted += sRealUnattempted;

      detailedStats.push({
          subject: subjectName,
          right: sCorrect,
          wrong: sWrong,
          unattempted: sRealUnattempted,
          score: sectionScore
      });
    });

    const totalScore = (totalCorrect * POSITIVE_MARK) - (totalWrong * NEGATIVE_MARK);

    // --- EXTRACTION LOGIC (FIXED) ---
    const $base = cheerio.load(pages[0]);

    // Robust extractor that flattens all whitespace (newlines, tabs) into single spaces
    const extractText = (targetLabels: string[]) => {
      let foundValue = "";

      // Loop through EVERY 'td' to find the label manually
      $base('td').each((_, element) => {
        if (foundValue) return; // Stop if already found

        // Normalize: "Centre \n Name" -> "Centre Name"
        const cellText = $base(element).text().replace(/\s+/g, ' ').trim(); 
        
        // Check if this cell contains any of our target labels (e.g., "Centre Name")
        if (targetLabels.some(label => cellText.includes(label))) {
           // If match, grab the NEXT cell
           foundValue = $base(element).next().text().replace(':', '').trim();
        }
      });

      return foundValue;
    };

    // Extract Centre Name (checking both common variations)
    const centreName = extractText(["Centre Name", "Venue Name"]);

    const finalData = {
      examId: examId,
      category: category,
      rollNo: extractText(["Roll No"]),
      candidateName: extractText(["Candidate Name"]),
      testDate: extractText(["Test Date"]),
      testTimeShift: extractText(["Test Time"]),
      centreName: centreName,
      answerKeyUrl: url.trim(),
      
      reasoningScore: subjectScores[0] || 0,
      gkScore: subjectScores[1] || 0,
      quantScore: subjectScores[2] || 0,
      englishScore: subjectScores[3] || 0,
      totalScore: totalScore,
      sectionDetails: detailedStats 
    };

    // 5. Save to DB
    if (finalData.rollNo) {
      await db.insert(sscResults)
        .values(finalData)
        .onConflictDoUpdate({
          target: [sscResults.rollNo, sscResults.examId],
          set: finalData
        });
    } else {
        return NextResponse.json({ error: "Could not parse Roll Number from URL" }, { status: 422 });
    }

    return NextResponse.json({ 
      score: totalScore, 
      correct: totalCorrect, 
      wrong: totalWrong, 
      unattempted: totalUnattempted,
      dbData: finalData
    });

  } catch (error: any) {
    console.error("Calculation Error:", error);
    return NextResponse.json({ error: error.message || "Server failed to calculate" }, { status: 500 });
  }
}