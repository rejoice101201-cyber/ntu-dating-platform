import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('photos') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: '沒有上傳照片' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: '最多只能上傳 5 張照片' }, { status: 400 });
    }

    const photoUrls: string[] = [];

    // 處理每張照片
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: '只能上傳圖片檔案' }, { status: 400 });
      }

      // 生成唯一檔名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${session.user.id}/${timestamp}-${randomStr}.${extension}`;

      // 上傳到 Vercel Blob Storage
      const blob = await put(filename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      photoUrls.push(blob.url);
    }

    return NextResponse.json({ photoUrls });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || '上傳失敗' },
      { status: 500 }
    );
  }
}





