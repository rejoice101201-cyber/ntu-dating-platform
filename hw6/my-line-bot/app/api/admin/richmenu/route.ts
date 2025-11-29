import { NextRequest, NextResponse } from 'next/server';
import { richMenuService } from '@/lib/services/richMenuService';
import { createRichMenuConfig } from '@/lib/bot/richMenuConfig';

/**
 * GET /api/admin/richmenu
 * 取得所有 Rich Menu 列表
 */
export async function GET() {
  try {
    console.log('📋 [RichMenu API] 取得 Rich Menu 列表');
    const richMenus = await richMenuService.getRichMenuList();
    const defaultRichMenuId = await richMenuService.getDefaultRichMenuId();

    return NextResponse.json({
      richMenus,
      defaultRichMenuId,
      count: richMenus.length,
    });
  } catch (error: any) {
    console.error('❌ [RichMenu API] 取得 Rich Menu 列表失敗:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rich menus', message: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/richmenu
 * 創建新的 Rich Menu
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { locale = 'zh-TW', imageUrl, imageBuffer, contentType } = body;

    console.log('📋 [RichMenu API] 創建 Rich Menu...', { locale });

    // 創建 Rich Menu 配置
    const richMenuConfig = createRichMenuConfig(locale as 'zh-TW' | 'en-US');

    // 創建 Rich Menu
    const richMenuId = await richMenuService.createRichMenu(richMenuConfig);

    // 如果有圖片，上傳圖片
    if (imageUrl) {
      await richMenuService.uploadRichMenuImageFromUrl(richMenuId, imageUrl);
    } else if (imageBuffer && contentType) {
      // 如果提供 base64 編碼的圖片
      const buffer = Buffer.from(imageBuffer, 'base64');
      await richMenuService.uploadRichMenuImage(
        richMenuId,
        buffer,
        contentType as 'image/jpeg' | 'image/png'
      );
    }

    // 如果指定為預設 Rich Menu，設定為預設
    if (body.setAsDefault) {
      await richMenuService.setDefaultRichMenu(richMenuId);
    }

    return NextResponse.json({
      success: true,
      richMenuId,
      message: 'Rich Menu created successfully',
    });
  } catch (error: any) {
    console.error('❌ [RichMenu API] 創建 Rich Menu 失敗:', error);
    return NextResponse.json(
      { error: 'Failed to create rich menu', message: error?.message },
      { status: 500 }
    );
  }
}









