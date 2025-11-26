import { NextRequest, NextResponse } from 'next/server';
import { richMenuService } from '@/lib/services/richMenuService';

/**
 * POST /api/admin/richmenu/set-default
 * 設定預設 Rich Menu
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { richMenuId } = body;

    if (!richMenuId) {
      return NextResponse.json(
        { error: 'richMenuId is required' },
        { status: 400 }
      );
    }

    console.log('🔧 [RichMenu API] 設定預設 Rich Menu...', { richMenuId });
    await richMenuService.setDefaultRichMenu(richMenuId);

    return NextResponse.json({
      success: true,
      message: 'Default rich menu set successfully',
    });
  } catch (error: any) {
    console.error('❌ [RichMenu API] 設定預設 Rich Menu 失敗:', error);
    return NextResponse.json(
      { error: 'Failed to set default rich menu', message: error?.message },
      { status: 500 }
    );
  }
}







