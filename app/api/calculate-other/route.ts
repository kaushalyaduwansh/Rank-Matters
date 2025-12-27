import { db } from "@/db"; 
import { OtherResults, recentExams } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, category, examId } = await req.json();

    if (!url || !examId) {
      return NextResponse.json({ error: "Missing URL or Exam ID" }, { status: 400 });
    }

    // --- STEP 1: FETCH EXAM SETTINGS FROM DB ---
    const examSettings = await db.query.recentExams.findFirst({
      where: eq(recentExams.id, examId),
    });

    if (!examSettings) {
      return NextResponse.json({ error: "Exam settings not found" }, { status: 404 });
    }

    const POSITIVE_MARK = examSettings.rightMark ?? 1;
    const NEGATIVE_MARK = examSettings.wrongMark ?? 0.25;

    // --- STEP 2: SECURE FETCH WITH USER-AGENT ---
    // We add headers to mimic a real browser to prevent Vercel IPs from being blocked
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout for slow portal responses
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch answer key: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Helper for robust info extraction
    const extractInfo = (label: string) => {
      let value = "";
      $('.main-info-pnl table tr').each((_, row) => {
        const tds = $(row).find('td');
        if (tds.length >= 2) {
          const cellText = $(tds[0]).text().trim();
          // regex handles case-sensitivity and trailing colons
          if (new RegExp(label, "i").test(cellText)) {
            value = $(tds[1]).text().trim();
          }
        }
      });
      return value;
    };

    // --- STEP 3: IDENTITY CHECK ---
    const rollNo = extractInfo("Roll Number") || extractInfo("Participant ID") || extractInfo("Candidate Roll No.") ;
    
    if (!rollNo) {
      return NextResponse.json({ error: "Could not find Roll Number/ID in URL" }, { status: 422 });
    }

    // --- STEP 4: CHECK EXISTING & UPDATE IF NEEDED ---
    const existingResult = await db.select().from(OtherResults)
      .where(and(
        eq(OtherResults.rollNo, rollNo),
        eq(OtherResults.examId, examId)
      ))
      .limit(1);

    if (existingResult.length > 0) {
      const record = existingResult[0];
      let needsUpdate = false;
      const updates: any = {};

      if (category && record.category !== category) {
        updates.category = category;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await db.update(OtherResults)
          .set(updates)
          .where(eq(OtherResults.id, record.id));
        Object.assign(record, updates);
      }

      return NextResponse.json({ 
        success: true,
        isCached: true,
        dbData: record 
      });
    }

    // --- STEP 5: FULL CALCULATION ---
    // Logical OR (||) ensures it checks Participant Name if Candidate Name is an empty string
    const candidateName = extractInfo("Candidate Name") || extractInfo("Participant Name") || "Unknown Candidate";
    const testDate = extractInfo("Test Date");
    const testTime = extractInfo("Test Time");
    const centreName = extractInfo("Test Center Name");

    const sections: any[] = [];
    
    $('.section-cntnr').each((_, sectionElem) => {
      const sectionName = $(sectionElem).find('.section-lbl .bold').text().trim() || "General";
      
      let secRight = 0;
      let secWrong = 0;
      let secUnattempted = 0;

      $(sectionElem).find('.question-pnl').each((_, qElem) => {
        let correctOptionIndex = -1;
        
        $(qElem).find('.rightAns').each((_, rightElem) => {
          const text = $(rightElem).text().trim();
          const match = text.match(/^(\d+)\./); 
          if (match) {
            correctOptionIndex = parseInt(match[1]);
          }
        });

        let chosenOption = 0; 
        const menuTable = $(qElem).find('.menu-tbl');
        menuTable.find('tr').each((_, row) => {
          const tds = $(row).find('td');
          if ($(tds[0]).text().includes("Chosen Option")) {
            const val = $(tds[1]).text().trim();
            if (val !== "--" && val !== "") {
              chosenOption = parseInt(val);
            }
          }
        });

        if (chosenOption === 0) {
          secUnattempted++;
        } else if (correctOptionIndex !== -1 && chosenOption === correctOptionIndex) {
          secRight++;
        } else {
          secWrong++;
        }
      });

      const secScore = (secRight * POSITIVE_MARK) - (secWrong * NEGATIVE_MARK);

      sections.push({
        subject: sectionName,
        right: secRight,
        wrong: secWrong,
        unattempted: secUnattempted,
        score: parseFloat(secScore.toFixed(4)) 
      });
    });

    const totalCorrect = sections.reduce((acc, curr) => acc + curr.right, 0);
    const totalWrong = sections.reduce((acc, curr) => acc + curr.wrong, 0);
    const totalUnattempted = sections.reduce((acc, curr) => acc + curr.unattempted, 0);
    
    const finalScoreRaw = (totalCorrect * POSITIVE_MARK) - (totalWrong * NEGATIVE_MARK);
    const finalScore = parseFloat(finalScoreRaw.toFixed(4));

    const dbData = {
      examId,
      rollNo,
      candidateName,
      category,
      testDate,
      testTimeShift: testTime,
      centreName,
      answerKeyUrl: url,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      totalScore: finalScore,
      sectionDetails: sections 
    };

    // Save New Result
    await db.insert(OtherResults).values(dbData);

    return NextResponse.json({ 
      success: true,
      isCached: false,
      dbData: dbData
    });

  } catch (error: any) {
    console.error("Calculation Error details:", error);
    return NextResponse.json({ error: error.message || "Calculation Failed" }, { status: 500 });
  }
}
