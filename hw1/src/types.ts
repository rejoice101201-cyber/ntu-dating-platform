/**
 * TypeScript 類型定義文件
 * 定義網站中使用的所有自定義類型
 */

// 頁面類型定義
export type PageType = 'hero' | 'about' | 'portfolio' | 'contact';

// 子頁面區塊類型
export type SectionType = 'about' | 'portfolio' | 'contact';

// 作品集分類類型
export type PortfolioCategory = 'school' | 'lab' | 'hobby';

// 眼睛動畫相關類型
export interface EyeAnimation {
  element: HTMLElement;
  timer?: number;
  isBlinking: boolean;
}

// 作品集項目類型
export interface PortfolioItem {
  element: HTMLElement;
  category: PortfolioCategory;
  title: string;
  description: string;
  isVisible: boolean;
  animationDelay: number;
}

// 聯絡表單數據類型
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// 動畫配置類型
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
}

// 響應式斷點類型
export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

// 游標狀態類型
export interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  scale: number;
}

// 頁面狀態類型
export interface PageState {
  currentPage: PageType;
  expandedSection: SectionType | null;
  isAnimating: boolean;
  isLoaded: boolean;
}

// 事件處理器類型
export type EventHandler<T = Event> = (event: T) => void;

// DOM 元素選擇器類型
export type Selector = string | HTMLElement | NodeListOf<HTMLElement>;

// 動畫回調函數類型
export type AnimationCallback = () => void;

// 表單驗證結果類型
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 作品集篩選配置類型
export interface FilterConfig {
  activeFilter: PortfolioCategory | 'all';
  transitionDuration: number;
  staggerDelay: number;
}

// 鍵盤快捷鍵類型
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
}

// 滾動動畫配置類型
export interface ScrollAnimationConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}

// 媒體查詢配置類型
export interface MediaQueryConfig {
  query: string;
  callback: (matches: boolean) => void;
}

// 應用程式主要介面類型
export interface PortfolioApp {
  currentPage: PageType;
  eyeTimers: number[];
  expandedSection: HTMLElement | null;
  portfolioItems: PortfolioItem[];
  cursorState: CursorState;
  pageState: PageState;
  
  init(): void;
  destroy(): void;
  navigateToPage(page: PageType): void;
  expandSection(section: SectionType): void;
  collapseSection(): void;
  filterPortfolio(category: PortfolioCategory): void;
  handleFormSubmit(data: ContactFormData): void;
}
