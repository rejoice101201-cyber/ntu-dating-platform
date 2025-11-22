/**
 * Line Profile Service
 * 用於獲取 Line 使用者的 Profile 資訊（顯示名稱、頭像等）
 */

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.CHANNEL_ACCESS_TOKEN || '';

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

/**
 * 獲取 Line 使用者 Profile
 * 使用 Line Messaging API 的 Get Profile API
 * 
 * @param userId Line User ID
 * @returns 使用者 Profile 資訊，如果失敗則返回 null
 */
export async function getUserProfile(userId: string): Promise<LineUserProfile | null> {
  if (!CHANNEL_ACCESS_TOKEN) {
    console.warn('⚠️ 缺少 CHANNEL_ACCESS_TOKEN，無法獲取使用者 Profile');
    return null;
  }

  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ 使用者 ${userId.substring(0, 20)}... 的 Profile 不存在或已封鎖 Bot`);
        return null;
      }
      const errorText = await response.text();
      console.error(`❌ 獲取 Profile 失敗 (${response.status}):`, errorText);
      return null;
    }

    const profile = await response.json();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('❌ 獲取 Profile 時發生錯誤:', error);
    return null;
  }
}

/**
 * 批次獲取多個使用者的 Profile
 * 注意：Line API 不支援批次查詢，需要逐個查詢
 * 
 * @param userIds 使用者 ID 陣列
 * @returns 使用者 Profile 資訊的 Map
 */
export async function getUserProfiles(userIds: string[]): Promise<Map<string, LineUserProfile>> {
  const profiles = new Map<string, LineUserProfile>();
  
  // 逐個查詢（可以考慮加入快取機制）
  const promises = userIds.map(async (userId) => {
    const profile = await getUserProfile(userId);
    if (profile) {
      profiles.set(userId, profile);
    }
  });

  await Promise.all(promises);
  return profiles;
}

