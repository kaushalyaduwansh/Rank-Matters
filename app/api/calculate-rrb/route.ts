import { db } from "@/db"; 
import { rrbResults } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, category, examId, userZone } = await req.json();

    if (!url || !examId) {
        return NextResponse.json({ error: "Missing URL or Exam ID" }, { status: 400 });
    }

    // --- STEP 1: QUICK FETCH TO GET IDENTITY ---
    // We need the Roll Number to check if the user exists
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Failed to fetch answer key");
    const html = await response.text();
    const $ = cheerio.load(html);

    let rollNo = "";
    $('.main-info-pnl table tr').each((_, row) => {
        const tds = $(row).find('td');
        if (tds.length >= 2) {
            if ($(tds[0]).text().trim().includes("Roll Number")) {
                rollNo = $(tds[1]).text().trim();
            }
        }
    });

    if (!rollNo) {
        return NextResponse.json({ error: "Could not find Roll Number in URL" }, { status: 422 });
    }

    // --- STEP 2: CHECK EXISTING & UPDATE IF NEEDED ---
    const existingResult = await db.select().from(rrbResults)
        .where(and(
            eq(rrbResults.rollNo, rollNo),
            eq(rrbResults.examId, examId)
        ))
        .limit(1);

    if (existingResult.length > 0) {
        const record = existingResult[0];
        let needsUpdate = false;
        const updates: any = {};

        // Check if Category changed
        if (category && record.category !== category) {
            updates.category = category;
            needsUpdate = true;
        }

        // Check if Zone changed (and user provided a valid zone)
        if (userZone && record.rrbZone !== userZone) {
            updates.rrbZone = userZone;
            needsUpdate = true;
        }

        // If changes detected, Update DB without recalculating score
        if (needsUpdate) {
            await db.update(rrbResults)
                .set(updates)
                .where(eq(rrbResults.id, record.id));
            
            // Update the local record object to return the fresh data
            Object.assign(record, updates);
        }

        return NextResponse.json({ 
            success: true,
            isCached: true,
            dbData: record 
        });
    }

    // --- STEP 3: FULL CALCULATION (Only runs if new student) ---
    
    // Extract remaining info
  const extractInfo = (label: string) => {
  let value = "";
  $('.main-info-pnl table tr').each((_, row) => {
    const tds = $(row).find('td');
    if (tds.length >= 2) {
      const cellText = $(tds[0]).text().trim();
      // Use a case-insensitive regex to match the label accurately
      const regex = new RegExp(label, "i"); 
      
      if (regex.test(cellText)) {
        value = $(tds[1]).text().trim();
      }
    }
  });
  return value;
};

    const candidateName = extractInfo("Candidate Name") || extractInfo("Participant Name") || "Unknown Candidate";
    const testDate = extractInfo("Test Date");
    const testTime = extractInfo("Test Time");
    const centreName = extractInfo("Test Center Name");
    
    let rrbZone = userZone || "Unknown"; 

    // Parsing Sections
    const sections: any[] = [];
    
    $('.section-cntnr').each((_, sectionElem) => {
        const sectionName = $(sectionElem).find('.section-lbl .bold').text().trim() || "General";
        
        let secRight = 0;
        let secWrong = 0;
        let secUnattempted = 0;

        $(sectionElem).find('.question-pnl').each((_, qElem) => {
            let correctOptionIndex = -1;
            let foundRight = false;
            
            $(qElem).find('.rightAns').each((_, rightElem) => {
                const text = $(rightElem).text().trim();
                const match = text.match(/^(\d+)\./); 
                if (match) {
                    correctOptionIndex = parseInt(match[1]);
                    foundRight = true;
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

        const secScore = secRight - (secWrong / 3);

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
    
    const finalScoreRaw = totalCorrect - (totalWrong / 3);
    const finalScore = parseFloat(finalScoreRaw.toFixed(4));

    const dbData = {
        examId,
        rollNo,
        candidateName,
        rrbZone,
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
    await db.insert(rrbResults).values(dbData);

    return NextResponse.json({ 
        success: true,
        isCached: false,
        dbData: dbData
    });

  } catch (error: any) {
    console.error("RRB Calculation Error:", error);
    return NextResponse.json({ error: error.message || "Calculation Failed" }, { status: 500 });
  }
}