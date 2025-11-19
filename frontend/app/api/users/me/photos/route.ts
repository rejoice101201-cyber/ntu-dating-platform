import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const isCover = formData.get('isCover') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Process image with sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to Vercel Blob
    // Vercel Blob automatically uses BLOB_READ_WRITE_TOKEN from environment variables
    const blob = await put(`photos/${authUser.id}/${Date.now()}.jpg`, processedBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Get current photo count for ordering
    const photoCount = await prisma.photo.count({
      where: { userId: authUser.id },
    });

    // If this is cover photo, unset other cover photos
    if (isCover) {
      await prisma.photo.updateMany({
        where: { userId: authUser.id, isCover: true },
        data: { isCover: false },
      });
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        userId: authUser.id,
        url: blob.url,
        blurLevel: 100, // Default blur level
        isCover: isCover || photoCount === 0, // First photo is cover by default
        order: photoCount,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

