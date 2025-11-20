import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { photoId } = params;

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // If viewing own photo, no blur
    if (photo.userId === authUser.id) {
      return NextResponse.json({ ...photo, blurLevel: 0 });
    }

    // Get unlock progress
    const unlockProgress = await prisma.unlockProgress.findUnique({
      where: {
        userId_targetUserId: {
          userId: authUser.id,
          targetUserId: photo.userId,
        },
      },
    });

    // Map unlock level to blur stages: 0% → 90px, 10% → 70px, 30% → 50px, 50% → 10px, 100% → 0px
    const getBlurLevel = (unlockLevel: number): number => {
      if (unlockLevel >= 100) return 0;
      if (unlockLevel >= 50) return 10;
      if (unlockLevel >= 30) return 50;
      if (unlockLevel >= 10) return 70;
      return 90; // 0-10%
    };

    const effectiveBlur = unlockProgress
      ? getBlurLevel(unlockProgress.unlockLevel)
      : 90; // Default blur if no unlock progress

    return NextResponse.json({
      ...photo,
      blurLevel: effectiveBlur,
    });
  } catch (error) {
    console.error('Get photo error:', error);
    return NextResponse.json(
      { error: 'Failed to get photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { photoId } = params;

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Only allow user to delete their own photos
    if (photo.userId !== authUser.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this photo' },
        { status: 403 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(photo.url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (blobError) {
      console.error('Failed to delete from blob:', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

