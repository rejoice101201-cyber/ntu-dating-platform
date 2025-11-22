import type { SupportedLocale } from '../types/locale';
import { DEFAULT_LOCALE } from '../types/locale';
import { getSectionContent, type SectionContent } from './sections';
import { prisma } from '../db/prisma';

// 簡單的 session 儲存（在生產環境中應使用資料庫或 Redis）
const userLocaleCache = new Map<string, SupportedLocale>();

/**
 * 取得使用者語系（優先從資料庫，其次從 cache，最後使用預設值）
 */
export async function getUserLocale(userId: string): Promise<SupportedLocale> {
  // 先從 cache 取得
  if (userLocaleCache.has(userId)) {
    return userLocaleCache.get(userId)!;
  }

  // 嘗試從資料庫取得
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { lineUserId: userId },
      orderBy: { lastMessageAt: 'desc' },
    });
    
    if (conversation?.metadata) {
      const metadata = conversation.metadata as any;
      if (metadata.locale) {
        const locale = metadata.locale as SupportedLocale;
        userLocaleCache.set(userId, locale);
        return locale;
      }
    }
  } catch (error) {
    console.warn('從資料庫取得語系失敗:', error);
  }

  return DEFAULT_LOCALE;
}

/**
 * 設定使用者語系
 */
export function setUserLocale(userId: string, locale: SupportedLocale): void {
  userLocaleCache.set(userId, locale);
}

/**
 * 取得章節內容
 */
export function getSectionContentByLocale(
  locale: SupportedLocale,
  section: string
): SectionContent | null {
  try {
    return getSectionContent(locale, section as any);
  } catch {
    return null;
  }
}
