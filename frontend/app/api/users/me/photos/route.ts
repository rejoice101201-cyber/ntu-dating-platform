import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import sharp from 'sharp';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('Upload photo endpoint called');
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // Check if BLOB_READ_WRITE_TOKEN is set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set!');
      return NextResponse.json(
        { error: 'Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const isCover = formData.get('isCover') === 'true';

    if (!file) {
      console.log('No file provided in formData');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type });

    // Process image with sharp
    let processedBuffer: Buffer;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      console.log('Image processed successfully, size:', processedBuffer.length);
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      return NextResponse.json(
        { error: 'Failed to process image', details: sharpError instanceof Error ? sharpError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Upload to Vercel Blob
    let blob;
    try {
      blob = await put(`photos/${authUser.id}/${Date.now()}.jpg`, processedBuffer, {
        access: 'public',
        contentType: 'image/jpeg',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      console.log('Image uploaded to Vercel Blob:', blob.url);
    } catch (blobError) {
      console.error('Vercel Blob upload error:', blobError);
      return NextResponse.json(
        { error: 'Failed to upload to blob storage', details: blobError instanceof Error ? blobError.message : 'Unknown error' },
        { status: 500 }
      );
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { error: 'Failed to upload photo', details: errorMessage },
      { status: 500 }
    );
  }
}

