'use server'

import { v2 as cloudinary } from 'cloudinary';
import { db } from '@/db';
import { recentExams } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split('@')[1].split('.')[0] : '', 
  api_key: process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split('://')[1].split(':')[0] : '',
  api_secret: process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split(':')[2].split('@')[0] : '',
});

export async function addExam(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;
  const imageFile = formData.get('image') as File;

  // --- NEW: Extract and Parse Numeric Fields ---
  // We use Number() or parseFloat() to ensure they are stored as numbers, not strings.
  // Fallback to defaults (100, 1, 0) if the parse fails.
  const totalQuestions = parseInt(formData.get('total_questions') as string) || 100;
  const rightMark = parseFloat(formData.get('right_mark') as string) || 1.0;
  const wrongMark = parseFloat(formData.get('wrong_mark') as string) || 0.0;

  if (!imageFile || !name || !url) {
    return { success: false, message: 'Missing required fields (Name, URL, or Image)' };
  }

  try {
    // 1. Upload to Cloudinary
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'exams' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // 2. Save to Neon DB with NEW Fields
    await db.insert(recentExams).values({
      examName: name,
      type,
      description,
      imageUrl: uploadResult.secure_url,
      url,
      
      // Map the parsed numbers to the schema columns
      totalQuestions: totalQuestions,
      rightMark: rightMark,
      wrongMark: wrongMark,
    });

    revalidatePath('/');
    return { success: true, message: 'Answer Key published successfully!' };

  } catch (error: any) {
    console.error('Add Exam Error:', error);
    
    // Handle Postgres Unique Constraint Violation (Duplicate URL)
    if (error.code === '23505') {
       return { success: false, message: 'This URL slug already exists. Please choose a unique one.' };
    }
    
    return { success: false, message: 'Failed to create entry. Please try again.' };
  }
}

export async function getExams() {
  try {
    const data = await db.query.recentExams.findMany({
      orderBy: [desc(recentExams.createdAt)],
    });
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
}

export async function deleteExam(id: number) {
  try {
    await db.delete(recentExams).where(eq(recentExams.id, id));
    revalidatePath('/');
    return { success: true, message: 'Answer Key deleted successfully' }; 
  } catch (e) {
    console.error('Delete Error:', e);
    return { success: false, message: 'Failed to delete Answer Key' }; 
  }
}