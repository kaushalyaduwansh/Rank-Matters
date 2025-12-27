import { db } from "@/db"; 
import { BankResults, recentExams } from "@/db/schema"; // Added recentExams
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, category, examId, userState } = await req.json();

    if (!url || !examId) {
        return NextResponse.json({ error: "Missing URL or Exam ID" }, { status: 400 });
    }

    // --- STEP 1: FETCH EXAM SETTINGS FROM DB ---
    // Fetch Positive/Negative Marks before calculation
    const examSettings = await db.query.recentExams.findFirst({
        where: eq(recentExams.id, examId),
    });

    if (!examSettings) {
        return NextResponse.json({ error: "Exam settings not found" }, { status: 404 });
    }

    const POSITIVE_MARK = examSettings.rightMark ?? 1;
    const NEGATIVE_MARK = examSettings.wrongMark ?? 0.25;

    // --- STEP 2: QUICK FETCH TO GET IDENTITY ---
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

    // --- STEP 3: CHECK EXISTING & UPDATE IF NEEDED ---
    const existingResult = await db.select().from(BankResults)
        .where(and(
            eq(BankResults.rollNo, rollNo),
            eq(BankResults.examId, examId)
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
        if (userState && record.state !== userState) {
            updates.state = userState;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await db.update(BankResults)
                .set(updates)
                .where(eq(BankResults.id, record.id));
            Object.assign(record, updates);
        }

        return NextResponse.json({ 
            success: true,
            isCached: true,
            dbData: record 
        });
    }

    // --- STEP 4: FULL CALCULATION ---
    const extractInfo = (label: string) => {
        let value = "";
        $('.main-info-pnl table tr').each((_, row) => {
            const tds = $(row).find('td');
            if (tds.length >= 2) {
                const cellText = $(tds[0]).text().trim();
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
    
    let state = userState || "Unknown"; 

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

        // Use Database marks for section score
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
    
    // Final score calculation using DB marks
    const finalScoreRaw = (totalCorrect * POSITIVE_MARK) - (totalWrong * NEGATIVE_MARK);
    const finalScore = parseFloat(finalScoreRaw.toFixed(4));

    const dbData = {
        examId,
        rollNo,
        candidateName,
        state,
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
    await db.insert(BankResults).values(dbData);

    return NextResponse.json({ 
        success: true,
        isCached: false,
        dbData: dbData
    });

  } catch (error: any) {
    console.error("Bank Calculation Error:", error);
    return NextResponse.json({ error: error.message || "Calculation Failed" }, { status: 500 });
  }
}