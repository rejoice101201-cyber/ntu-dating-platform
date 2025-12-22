import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// Lazy load sharp to handle platform-specific issues
let sharp: any;
async function getSharp() {
  if (!sharp) {
    try {
      sharp = (await import('sharp')).default;
    } catch (error) {
      console.error('Failed to load sharp:', error);
      throw error;
    }
  }
  return sharp;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> | { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const resolvedParams = await Promise.resolve(params);
  const { matchId } = resolvedParams;

  try {
    // Check if BLOB_READ_WRITE_TOKEN is set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userId: authUser.id },
          { matchedUserId: authUser.id },
        ],
        status: 'matched',
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine file type
    const isImage = file.type.startsWith('image/');
    const fileType = isImage ? 'image' : 'file';
    
    let blobUrl: string;
    let processedBuffer: Buffer;

    if (isImage) {
      // Process image with sharp
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const sharpInstance = await getSharp();
        processedBuffer = await sharpInstance(buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch (sharpError) {
        // If sharp fails, use original image
        processedBuffer = Buffer.from(await file.arrayBuffer());
      }

      // Upload to Vercel Blob
      const blob = await put(`chat/${matchId}/${Date.now()}-${file.name}`, processedBuffer, {
        access: 'public',
        contentType: 'image/jpeg',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      blobUrl = blob.url;
    } else {
      // For non-image files, upload as-is
      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await put(`chat/${matchId}/${Date.now()}-${file.name}`, buffer, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      blobUrl = blob.url;
    }

    // Create message with file URL
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: authUser.id,
        content: blobUrl,
        type: fileType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get other user ID
    const otherUserId = match.userId === authUser.id ? match.matchedUserId : match.userId;

    // Send via Pusher
    try {
      const { getPusher } = await import('@/lib/pusher');
      const pusher = getPusher();
      await pusher.trigger(`match-${matchId}`, 'new_message', {
        ...message,
        matchId,
      });
      await pusher.trigger(`user-${otherUserId}`, 'new_message', {
        ...message,
        matchId,
      });
    } catch (pusherError) {
      console.warn('Pusher not configured, message saved but not broadcast:', pusherError);
    }

    return NextResponse.json({ 
      message,
      url: blobUrl,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

