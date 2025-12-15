/**
 * 台灣時區日期工具函數
 * 所有日期判斷都應該使用台灣時間（UTC+8）
 */

/**
 * 取得台灣時間的今天日期範圍
 * @returns { start: Date, end: Date } 今天的開始時間（00:00:00）和結束時間（23:59:59.999）
 */
export function getTodayInTaiwan(): { start: Date; end: Date } {
  // 取得台灣時間的現在時間
  const now = new Date();
  
  // 使用 Intl.DateTimeFormat 取得台灣時間的各個部分
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10);
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
  
  // 建立台灣時間的今天開始時間（00:00:00 UTC+8）
  // 台灣時間 UTC+8，所以台灣時間 00:00:00 = UTC 前一天 16:00:00
  // 計算：year, month, day 在台灣時區的 00:00:00 對應的 UTC 時間
  // 使用 Date.UTC 建立 UTC 時間，台灣時間比 UTC 快 8 小時，所以減去 8 小時
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  start.setUTCHours(start.getUTCHours() - 8);
  
  // 建立台灣時間的今天結束時間（23:59:59.999 UTC+8）
  // 台灣時間 23:59:59.999 = UTC 同一天 15:59:59.999
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  end.setUTCHours(end.getUTCHours() - 8);
  
  return { start, end };
}
