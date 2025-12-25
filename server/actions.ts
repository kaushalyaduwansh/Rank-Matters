'use server'

import { v2 as cloudinary } from 'cloudinary';
import { db } from '@/db';
import { recentExams } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split('@')[1].split('.')[0], // Extract from URL or set manually
  api_key: process.env.CLOUDINARY_URL?.split('://')[1].split(':')[0],
  api_secret: process.env.CLOUDINARY_URL?.split(':')[2].split('@')[0],
});

export async function addExam(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;
  const imageFile = formData.get('image') as File;

  if (!imageFile || !name || !url) {
    return { success: false, message: 'Missing required fields' };
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

    // 2. Save to Neon DB
    await db.insert(recentExams).values({
      examName: name,
      type,
      description,
      imageUrl: uploadResult.secure_url,
      url,
    });

    revalidatePath('/');
    return { success: true, message: 'Exam added successfully!' };
  } catch (error: any) {
    console.error(error);
    // Handle unique URL constraint
    if (error.code === '23505') {
       return { success: false, message: 'This URL already exists. Please use a unique URL.' };
    }
    return { success: false, message: 'Failed to create exam.' };
  }
}

export async function getExams() {
  return await db.query.recentExams.findMany({
    orderBy: [desc(recentExams.createdAt)],
  });
}

export async function deleteExam(id: number) {
  try {
    await db.delete(recentExams).where(eq(recentExams.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}