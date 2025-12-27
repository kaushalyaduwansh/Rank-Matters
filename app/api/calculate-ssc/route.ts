import { db } from "@/db"; 
import { sscResults, recentExams } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

    // --- STEP 1: QUICK IDENTITY CHECK ---
    // Fetch only the first page to get the Roll Number
    const urls = getNormalizedUrls(url);
    const mainResponse = await fetch(urls[0], { next: { revalidate: 3600 } });
    
    if (!mainResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch answer key" }, { status: 400 });
    }
    
    const mainHtml = await mainResponse.text();
    const $check = cheerio.load(mainHtml);

    // Extract Roll No for DB Lookup
    let rollNo = "";
    // Robust extraction looking for "Roll No" label
    $check('td').each((_, element) => {
        if (rollNo) return;
        const cellText = $check(element).text().replace(/\s+/g, ' ').trim();
        if (cellText.includes("Roll No")) {
            rollNo = $check(element).next().text().replace(':', '').trim();
        }
    });

    if (!rollNo) {
        return NextResponse.json({ error: "Could not find Roll Number in URL" }, { status: 422 });
    }

    // --- STEP 2: CHECK DB & UPDATE IF NEEDED ---
    const existingResult = await db.select().from(sscResults)
        .where(and(
            eq(sscResults.rollNo, rollNo),
            eq(sscResults.examId, examId)
        ))
        .limit(1);

    if (existingResult.length > 0) {
        const record = existingResult[0];
        
        // If Category has changed, update it
        if (category && record.category !== category) {
            await db.update(sscResults)
                .set({ category: category })
                .where(eq(sscResults.id, record.id));
            
            record.category = category; // Update local object for response
        }

        return NextResponse.json({ 
            success: true, 
            isCached: true, 
            dbData: record 
        });
    }

    // --- STEP 3: FULL CALCULATION (Only for New Students) ---
    
    // Fetch Exam Settings (Positive/Negative Marks)
    const examSettings = await db.query.recentExams.findFirst({
        where: eq(recentExams.id, examId),
    });

    if (!examSettings) {
        return NextResponse.json({ error: "Exam settings not found" }, { status: 404 });
    }

    const POSITIVE_MARK = examSettings.rightMark ?? 2;
    const NEGATIVE_MARK = examSettings.wrongMark ?? 0.5;

    // Fetch remaining pages (we already have the first one)
    const remainingPages = await Promise.all(
      urls.slice(1).map((u: string) => 
        fetch(u, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.text() : ""))
      )
    );

    // Combine all pages (Main + Remaining)
    const allPages = [mainHtml, ...remainingPages];

    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0;
    const subjectScores: number[] = [];
    const detailedStats: any[] = [];

    // --- SCORING LOGIC ---
    allPages.forEach((html: string, index: number) => {
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

    // --- EXTRACTION ---
    // Reuse the $check cheerio instance from the first page since it has the meta info
    const extractText = (targetLabels: string[]) => {
      let foundValue = "";
      $check('td').each((_, element) => {
        if (foundValue) return;
        const cellText = $check(element).text().replace(/\s+/g, ' ').trim(); 
        if (targetLabels.some(label => cellText.includes(label))) {
           foundValue = $check(element).next().text().replace(':', '').trim();
        }
      });
      return foundValue;
    };

    const finalData = {
      examId: examId,
      category: category,
      rollNo: rollNo, // We already extracted this
      candidateName: extractText(["Candidate Name"]),
      testDate: extractText(["Test Date"]),
      testTimeShift: extractText(["Test Time"]),
      centreName: extractText(["Centre Name", "Venue Name"]),
      answerKeyUrl: url.trim(),
      
      reasoningScore: subjectScores[0] || 0,
      gkScore: subjectScores[1] || 0,
      quantScore: subjectScores[2] || 0,
      englishScore: subjectScores[3] || 0,
      
      totalScore: totalScore,
      
      // Store these for the standardized Result Page
      // (Even if your DB schema doesn't have columns yet, storing them in sectionDetails JSON helps)
      sectionDetails: detailedStats 
    };

    // 5. Save to DB
    await db.insert(sscResults)
      .values(finalData)
      .onConflictDoUpdate({
        target: [sscResults.rollNo, sscResults.examId],
        set: finalData
      });

    return NextResponse.json({ 
      success: true,
      isCached: false,
      score: totalScore, 
      correct: totalCorrect, 
      wrong: totalWrong, 
      unattempted: totalUnattempted,
      dbData: finalData
    });

  } catch (error: any) {
    console.error("SSC Calculation Error:", error);
    return NextResponse.json({ error: error.message || "Server failed to calculate" }, { status: 500 });
  }
}