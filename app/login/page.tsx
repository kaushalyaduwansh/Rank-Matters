import React from "react";
import { db } from "@/db"; 
import { recentExams } from "@/db/schema";
import { desc } from "drizzle-orm";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoginClient from "./client";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const exams = await db
    .select({
      name: recentExams.examName,
      url: recentExams.url,
    })
    .from(recentExams)
    .orderBy(desc(recentExams.createdAt));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header is part of the flex flow, so it won't cover content */}
      <Header />
      
      {/* py-12 adds top/bottom padding to prevent touching header/footer */}
      <main className="  flex-grow flex items-center justify-center p-4 py-12">
        <LoginClient exams={exams} />
      </main>

      <Footer />
    </div>
  );
}