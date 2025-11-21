import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // 確保上傳目錄存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', session.user.id);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 處理每張照片
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: '只能上傳圖片檔案' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 生成唯一檔名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${randomStr}.${extension}`;
      const filepath = join(uploadDir, filename);

      // 儲存檔案
      await writeFile(filepath, buffer);

      // 生成 URL
      const photoUrl = `/uploads/${session.user.id}/${filename}`;
      photoUrls.push(photoUrl);
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




