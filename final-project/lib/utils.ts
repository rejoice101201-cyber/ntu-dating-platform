import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 驗證 userID 格式
export function isValidUserID(userID: string): boolean {
  if (!userID || userID.length < 1 || userID.length > 15) {
    return false;
  }
  // 只允許字母、數字和底線
  return /^[a-zA-Z0-9_]+$/.test(userID);
}

// 截斷文字
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}





