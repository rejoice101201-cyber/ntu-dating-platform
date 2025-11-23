/**
 * 手機號碼管理服務
 * 處理手機號碼綁定、驗證碼產生和驗證
 */

import { prisma } from '../db/prisma';
import { sendVerificationCode } from './smsService';

interface PhoneBindingData {
  phoneNumber?: string;
  phoneVerificationCode?: string;
  phoneVerificationExpiry?: number; // timestamp
  phoneVerified?: boolean;
  phoneBindingStep?: 'idle' | 'waiting_phone' | 'waiting_code' | 'completed';
}

/**
 * 產生 6 位數驗證碼
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 取得用戶手機號碼綁定資料
 */
export async function getUserPhoneData(lineUserId: string): Promise<PhoneBindingData> {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        lineUserId,
        status: 'active',
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    if (!conversation || !conversation.metadata) {
      return {};
    }

    const metadata = conversation.metadata as any;
    return {
      phoneNumber: metadata.phoneNumber,
      phoneVerificationCode: metadata.phoneVerificationCode,
      phoneVerificationExpiry: metadata.phoneVerificationExpiry,
      phoneVerified: metadata.phoneVerified,
      phoneBindingStep: metadata.phoneBindingStep || 'idle',
    };
  } catch (error) {
    console.error('❌ [Phone Service] 取得手機資料失敗:', error);
    return {};
  }
}

/**
 * 取得用戶手機號碼
 */
export async function getUserPhoneNumber(lineUserId: string): Promise<string | null> {
  const data = await getUserPhoneData(lineUserId);
  return data.phoneNumber || null;
}

/**
 * 開始手機號碼綁定流程
 */
export async function initiatePhoneBinding(lineUserId: string): Promise<boolean> {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        lineUserId,
        status: 'active',
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    if (!conversation) {
      return false;
    }

    const metadata = (conversation.metadata as any) || {};
    metadata.phoneBindingStep = 'waiting_phone';

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        metadata,
      },
    });

    return true;
  } catch (error) {
    console.error('❌ [Phone Service] 開始綁定流程失敗:', error);
    return false;
  }
}

/**
 * 設定手機號碼並發送驗證碼
 */
export async function setPhoneNumberAndSendCode(
  lineUserId: string,
  phoneNumber: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  // 驗證手機號碼格式
  if (!/^09\d{8}$/.test(phoneNumber)) {
    return {
      success: false,
      error: '手機號碼格式錯誤，請輸入 10 位數台灣手機號碼（例如：0912345678）',
    };
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        lineUserId,
        status: 'active',
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    if (!conversation) {
      return {
        success: false,
        error: '找不到對話記錄',
      };
    }

    // 產生驗證碼
    const code = generateVerificationCode();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 分鐘後過期

    // 更新 metadata
    const metadata = (conversation.metadata as any) || {};
    metadata.phoneNumber = phoneNumber;
    metadata.phoneVerificationCode = code;
    metadata.phoneVerificationExpiry = expiry;
    metadata.phoneVerified = false;
    metadata.phoneBindingStep = 'waiting_code';

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        metadata,
      },
    });

    // 發送驗證碼簡訊
    const smsSent = await sendVerificationCode(phoneNumber, code);
    if (!smsSent) {
      console.warn('⚠️ [Phone Service] 簡訊發送失敗，但驗證碼已儲存');
    }

    return {
      success: true,
      code: smsSent ? undefined : code, // 如果簡訊發送失敗，返回驗證碼（開發測試用）
    };
  } catch (error: any) {
    console.error('❌ [Phone Service] 設定手機號碼失敗:', error);
    return {
      success: false,
      error: error?.message || '設定手機號碼失敗',
    };
  }
}

/**
 * 驗證驗證碼
 */
export async function verifyPhoneNumber(
  lineUserId: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await getUserPhoneData(lineUserId);

    if (!data.phoneVerificationCode) {
      return {
        success: false,
        error: '沒有待驗證的驗證碼，請先輸入手機號碼',
      };
    }

    if (!data.phoneVerificationExpiry || Date.now() > data.phoneVerificationExpiry) {
      return {
        success: false,
        error: '驗證碼已過期，請重新開始綁定流程',
      };
    }

    if (data.phoneVerificationCode !== inputCode) {
      return {
        success: false,
        error: '驗證碼錯誤，請重新輸入',
      };
    }

    // 驗證成功，更新狀態
    const conversation = await prisma.conversation.findFirst({
      where: {
        lineUserId,
        status: 'active',
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    if (!conversation) {
      return {
        success: false,
        error: '找不到對話記錄',
      };
    }

    const metadata = (conversation.metadata as any) || {};
    metadata.phoneVerified = true;
    metadata.phoneBindingStep = 'completed';
    // 清除驗證碼（安全考量）
    delete metadata.phoneVerificationCode;
    delete metadata.phoneVerificationExpiry;

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        metadata,
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('❌ [Phone Service] 驗證失敗:', error);
    return {
      success: false,
      error: error?.message || '驗證失敗',
    };
  }
}

/**
 * 取消綁定流程
 */
export async function cancelPhoneBinding(lineUserId: string): Promise<boolean> {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        lineUserId,
        status: 'active',
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    if (!conversation) {
      return false;
    }

    const metadata = (conversation.metadata as any) || {};
    metadata.phoneBindingStep = 'idle';
    // 清除待驗證的資料
    delete metadata.phoneVerificationCode;
    delete metadata.phoneVerificationExpiry;

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        metadata,
      },
    });

    return true;
  } catch (error) {
    console.error('❌ [Phone Service] 取消綁定失敗:', error);
    return false;
  }
}

