import { db } from "@/db"; 
import { sscResults } from "@/db/schema";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function getNormalizedUrls(inputUrl: string): string[] {
  const basePattern = /(ViewCandResponse)\d*/i;
  const baseUrl = inputUrl.replace(basePattern, "ViewCandResponse");
  return [
    baseUrl,
    baseUrl.replace("ViewCandResponse", "ViewCandResponse2"),
    baseUrl.replace("ViewCandResponse", "ViewCandResponse3"),
    baseUrl.replace("ViewCandResponse", "ViewCandResponse4"),
  ];
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const normalizedUrl = url.trim();
    const urls = getNormalizedUrls(normalizedUrl);

    // Fetch all 4 subjects in parallel
    const pages = await Promise.all(
      urls.map((u: string) => 
        fetch(u, { next: { revalidate: 3600 } }).then((res) => (res.ok ? res.text() : ""))
      )
    );

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnattempted = 0;
    const subjectScores: number[] = [];

    pages.forEach((html: string) => {
      if (!html) {
        subjectScores.push(0);
        return;
      }
      const $ = cheerio.load(html);
      let sCorrect = 0;
      let sWrong = 0;

      // 1. Calculate Score based on bgcolor
      $('td[bgcolor]').each((_, el) => {
        const color = $(el).attr('bgcolor')?.toLowerCase();
        if (color === 'green') sCorrect++;
        if (color === 'red') sWrong++;
      });

      // 2. Count Unattempted (Looking for "Not Answered" in tables)
      $('table.menu-tbl').each((_, table) => {
        if ($(table).text().includes("Not Answered")) totalUnattempted++;
      });

      totalCorrect += sCorrect;
      totalWrong += sWrong;
      // SSC CPO formula: +1 for correct, -0.25 for wrong
      subjectScores.push((sCorrect * 1) - (sWrong * 0.25));
    });

    const totalScore = (totalCorrect * 1) - (totalWrong * 0.25);

    // 3. Extract Metadata from the first page (Base Page)
    const $base = cheerio.load(pages[0]);
    const extractText = (label: string) => 
      $base(`td:contains("${label}")`).next().text().replace(':', '').trim();

    const finalData = {
      rollNo: extractText("Roll No."),
      candidateName: extractText("Candidate Name"),
      testDate: extractText("Test Date"),
      testTimeShift: extractText("Test Time"),
      centreName: extractText("Centre Name"),
      answerKeyUrl: normalizedUrl,
      reasoningScore: subjectScores[0] || 0,
      gkScore: subjectScores[1] || 0,
      quantScore: subjectScores[2] || 0,
      englishScore: subjectScores[3] || 0,
      totalScore: totalScore,
    };

    // 4. Save to Neon Database (Upsert)
    // Only attempt to save if we actually found a Roll No
    if (finalData.rollNo) {
      await db.insert(sscResults)
        .values(finalData)
        .onConflictDoUpdate({
          target: sscResults.rollNo,
          set: finalData
        });
    }

    // 5. Return JSON in the format the UI expects
    return NextResponse.json({ 
      score: totalScore, 
      correct: totalCorrect, 
      wrong: totalWrong, 
      unattempted: totalUnattempted,
      dbData: finalData // This includes the student name and roll no for the UI
    });

  } catch (error) {
    console.error("Calculation Error:", error);
    return NextResponse.json({ error: "Server failed to calculate" }, { status: 500 });
  }
}