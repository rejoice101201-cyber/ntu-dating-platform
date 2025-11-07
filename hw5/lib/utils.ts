import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UserID validation: 1-15 characters, alphanumeric + underscore (similar to Twitter/X)
export function isValidUserID(userID: string): boolean {
  const regex = /^[a-zA-Z0-9_]{1,15}$/
  return regex.test(userID)
}

// Calculate character count for posts (links count as 23, hashtags and mentions don't count)
export function calculatePostLength(content: string): number {
  // Remove hashtags (#hashtag)
  let text = content.replace(/#\w+/g, '')
  // Remove mentions (@mention)
  text = text.replace(/@\w+/g, '')
  
  // Find all URLs (http/https)
  const urlRegex = /https?:\/\/[^\s]+/g
  const urls = text.match(urlRegex) || []
  
  // Count URLs as 23 characters each
  const urlLength = urls.length * 23
  
  // Remove URLs from text and count remaining characters
  const textWithoutUrls = text.replace(urlRegex, '')
  
  return textWithoutUrls.length + urlLength
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分鐘前`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小時前`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}天前`
  }
  
  // Format as MM/DD
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // If same year, return MM/DD, otherwise YYYY/MM/DD
  if (date.getFullYear() === now.getFullYear()) {
    return `${month}/${day}`
  }
  
  return `${date.getFullYear()}/${month}/${day}`
}

// Extract URLs from text and convert to links
export function linkify(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>')
}

// Extract hashtags and mentions
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const matches = text.match(hashtagRegex) || []
  return matches.map(tag => tag.substring(1))
}

export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const matches = text.match(mentionRegex) || []
  return matches.map(mention => mention.substring(1))
}

