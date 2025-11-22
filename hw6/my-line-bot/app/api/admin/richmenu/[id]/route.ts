import { NextRequest, NextResponse } from 'next/server';
import { richMenuService } from '@/lib/services/richMenuService';

/**
 * GET /api/admin/richmenu/[id]
 * 取得單一 Rich Menu 資訊
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Rich Menu ID is required' },
        { status: 400 }
      );
    }

    console.log('📋 [RichMenu API] 取得 Rich Menu 資訊...', { id });
    const richMenu = await richMenuService.getRichMenu(id);

    return NextResponse.json(richMenu);
  } catch (error: any) {
    console.error('❌ [RichMenu API] 取得 Rich Menu 資訊失敗:', error);
    
    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: 'Rich Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch rich menu', message: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/richmenu/[id]
 * 刪除 Rich Menu
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Rich Menu ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ [RichMenu API] 刪除 Rich Menu...', { id });
    await richMenuService.deleteRichMenu(id);

    return NextResponse.json({
      success: true,
      message: 'Rich Menu deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ [RichMenu API] 刪除 Rich Menu 失敗:', error);
    
    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: 'Rich Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete rich menu', message: error?.message },
      { status: 500 }
    );
  }
}

