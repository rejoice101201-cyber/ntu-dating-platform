"use strict";
/**
 * Daniel Wu 作品集網站 - TypeScript 版本
 * 主要應用程式類別，包含所有互動功能
 */
class AdvancedPortfolioApp {
    constructor() {
        this.currentPage = 'hero';
        this.eyeTimers = [];
        this.expandedSection = null;
        this.portfolioItems = [];
        this.keyboardShortcuts = [];
        this.cursorState = {
            x: 0,
            y: 0,
            isHovering: false,
            scale: 1
        };
        this.pageState = {
            currentPage: 'hero',
            expandedSection: null,
            isAnimating: false,
            isLoaded: false
        };
        this.filterConfig = {
            activeFilter: 'school',
            transitionDuration: 300,
            staggerDelay: 100
        };
        this.init();
    }
    /**
     * 初始化應用程式
     */
    init() {
        this.setupKeyboardShortcuts();
        this.setupCircleCursor();
        this.setupEyeAnimations();
        this.setupPageNavigation();
        this.setupSubPageExpansion();
        this.setupScrollArrow();
        this.setupPortfolioFilter();
        this.setupScrollAnimations();
        this.setupContactForm();
        this.setupKeyboardNavigation();
        this.setupLoadingAnimation();
        this.setupResponsiveDesign();
        this.pageState.isLoaded = true;
        console.log('TypeScript Portfolio app initialized successfully');
    }
    /**
     * 設置鍵盤快捷鍵
     */
    setupKeyboardShortcuts() {
        this.keyboardShortcuts = [
            {
                key: 'Escape',
                action: () => this.collapseSection()
            },
            {
                key: '1',
                action: () => this.navigateToPage('about')
            },
            {
                key: '2',
                action: () => this.navigateToPage('portfolio')
            },
            {
                key: '3',
                action: () => this.navigateToPage('contact')
            }
        ];
    }
    /**
     * 設置圓形游標
     */
    setupCircleCursor() {
        const circleCursor = document.querySelector('.circle-cursor');
        if (!circleCursor) {
            console.warn('Circle cursor element not found');
            return;
        }
        // 游標跟隨
        document.addEventListener('mousemove', (e) => {
            this.cursorState.x = e.clientX;
            this.cursorState.y = e.clientY;
            circleCursor.style.left = `${this.cursorState.x}px`;
            circleCursor.style.top = `${this.cursorState.y}px`;
        });
        // 懸停效果
        this.setupCursorHoverEffects(circleCursor);
        // 響應式處理
        this.setupCursorResponsive(circleCursor);
    }
    /**
     * 設置游標懸停效果
     */
    setupCursorHoverEffects(cursor) {
        const interactiveElements = document.querySelectorAll('.nav-item, .name-part, .portfolio-item, .filter-btn');
        interactiveElements.forEach((element) => {
            const el = element;
            el.addEventListener('mouseenter', () => {
                this.cursorState.isHovering = true;
                this.cursorState.scale = 1.2;
                cursor.style.transform = 'translate(-50%, -50%) scale(1.2)';
            });
            el.addEventListener('mouseleave', () => {
                this.cursorState.isHovering = false;
                this.cursorState.scale = 1;
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }
    /**
     * 設置游標響應式設計
     */
    setupCursorResponsive(cursor) {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaQueryChange = (e) => {
            if (e.matches) {
                cursor.style.display = 'none';
            }
            else {
                cursor.style.display = 'block';
            }
        };
        mediaQuery.addListener(handleMediaQueryChange);
        // 初始檢查
        if (mediaQuery.matches) {
            cursor.style.display = 'none';
        }
    }
    /**
     * 設置眼睛動畫
     */
    setupEyeAnimations() {
        const eyes = document.querySelectorAll('.eye');
        eyes.forEach((eye) => {
            const eyeElement = eye;
            this.startRandomBlink(eyeElement);
        });
    }
    /**
     * 開始隨機眨眼動畫
     */
    startRandomBlink(eye) {
        const blink = () => {
            if (this.pageState.isAnimating)
                return;
            eye.style.transform = 'scaleY(0.1)';
            setTimeout(() => {
                eye.style.transform = 'scaleY(1)';
            }, 150);
            // 隨機間隔 2-5 秒
            const nextBlink = Math.random() * 3000 + 2000;
            const timer = setTimeout(blink, nextBlink);
            this.eyeTimers.push(timer);
        };
        blink();
    }
    /**
     * 設置頁面導航
     */
    setupPageNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetPage = item.dataset.page;
                if (targetPage) {
                    this.navigateToPage(targetPage);
                }
            });
        });
        // 點擊外部關閉展開區塊
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                this.collapseSection();
            }
        });
    }
    /**
     * 導航到指定頁面
     */
    navigateToPage(page) {
        if (this.pageState.isAnimating)
            return;
        this.currentPage = page;
        this.pageState.currentPage = page;
        this.updateActiveNavItem(page);
        const targetElement = document.getElementById(page);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    /**
     * 更新活動導航項目
     */
    updateActiveNavItem(activePage) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item) => {
            const element = item;
            if (element.dataset.page === activePage) {
                element.classList.add('active');
            }
            else {
                element.classList.remove('active');
            }
        });
    }
    /**
     * 設置子頁面展開
     */
    setupSubPageExpansion() {
        const subPages = document.querySelectorAll('.sub-page');
        subPages.forEach((subPage) => {
            subPage.addEventListener('click', (e) => {
                if (this.isInteractiveElement(e.target)) {
                    return;
                }
                const section = subPage.dataset.section;
                if (section) {
                    this.expandSection(subPage, section);
                }
            });
        });
        // 點擊外部關閉
        document.addEventListener('click', (e) => {
            if (this.expandedSection && !e.target.closest('.sub-page')) {
                this.collapseSection();
            }
        });
    }
    /**
     * 檢查是否為互動元素
     */
    isInteractiveElement(element) {
        const interactiveSelectors = [
            '.contact-form', '.filter-btn', '.portfolio-item',
            '.view-project', 'input', 'textarea', 'button', 'a'
        ];
        return interactiveSelectors.some(selector => element.closest(selector) !== null);
    }
    /**
     * 展開指定區塊
     */
    expandSection(subPage, section) {
        if (this.pageState.isAnimating)
            return;
        // 關閉當前展開區塊
        if (this.expandedSection && this.expandedSection !== subPage) {
            this.collapseSection();
        }
        // 展開新區塊
        this.expandedSection = subPage;
        this.pageState.expandedSection = section;
        this.pageState.isAnimating = true;
        subPage.classList.add('expanded');
        // 添加提示
        setTimeout(() => {
            subPage.classList.add('show-hint');
        }, 30000);
        // 動畫完成後重置狀態
        setTimeout(() => {
            this.pageState.isAnimating = false;
        }, 1500);
    }
    /**
     * 關閉展開區塊
     */
    collapseSection() {
        if (!this.expandedSection || this.pageState.isAnimating)
            return;
        this.pageState.isAnimating = true;
        this.expandedSection.classList.remove('expanded');
        this.expandedSection.classList.remove('show-hint');
        this.expandedSection = null;
        this.pageState.expandedSection = null;
        setTimeout(() => {
            this.pageState.isAnimating = false;
        }, 500);
    }
    /**
     * 設置滾動箭頭
     */
    setupScrollArrow() {
        const scrollArrow = document.querySelector('.scroll-arrow');
        if (scrollArrow) {
            scrollArrow.addEventListener('click', () => {
                this.scrollToNextPage();
            });
        }
    }
    /**
     * 滾動到下一頁
     */
    scrollToNextPage() {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    /**
     * 設置作品集篩選
     */
    setupPortfolioFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        // 初始化作品集項目
        this.initializePortfolioItems(portfolioItems);
        // 設置篩選按鈕
        filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.handleFilterButtonClick(btn, filterButtons);
            });
        });
    }
    /**
     * 初始化作品集項目
     */
    initializePortfolioItems(items) {
        this.portfolioItems = Array.from(items).map((item, index) => {
            const element = item;
            const category = element.dataset.category;
            return {
                element,
                category,
                title: element.dataset.title || '',
                description: element.dataset.description || '',
                isVisible: category === 'school',
                animationDelay: index * 100
            };
        });
        // 設置初始顯示狀態
        this.filterPortfolioItems('school');
    }
    /**
     * 處理篩選按鈕點擊
     */
    handleFilterButtonClick(clickedBtn, allButtons) {
        // 移除所有活動狀態
        allButtons.forEach((btn) => {
            btn.classList.remove('active');
        });
        // 添加活動狀態
        clickedBtn.classList.add('active');
        // 獲取篩選類別
        const filter = clickedBtn.dataset.filter;
        if (filter) {
            this.filterPortfolioItems(filter);
            this.filterConfig.activeFilter = filter;
        }
    }
    /**
     * 篩選作品集項目
     */
    filterPortfolioItems(filter) {
        this.portfolioItems.forEach((item, index) => {
            const shouldShow = item.category === filter;
            if (shouldShow) {
                setTimeout(() => {
                    item.element.style.visibility = 'visible';
                    item.element.style.display = 'block';
                    item.isVisible = true;
                }, index * this.filterConfig.staggerDelay);
            }
            else {
                item.element.style.visibility = 'hidden';
                item.element.style.display = 'none';
                item.isVisible = false;
            }
        });
    }
    /**
     * 設置滾動動畫
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);
        // 觀察需要動畫的元素
        const animateElements = document.querySelectorAll('.page-section, .portfolio-item, .contact-item');
        animateElements.forEach((el) => {
            observer.observe(el);
        });
    }
    /**
     * 設置聯絡表單
     */
    setupContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(contactForm);
            });
        }
    }
    /**
     * 處理表單提交
     */
    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        // 驗證表單
        const validation = this.validateForm(data);
        if (!validation.isValid) {
            this.showFormMessage(validation.errors.join(', '), 'error');
            return;
        }
        // 模擬表單提交
        console.log('TypeScript Form submitted:', data);
        // 顯示成功訊息
        this.showFormMessage('Message sent successfully via TypeScript!', 'success');
        form.reset();
    }
    /**
     * 驗證表單
     */
    validateForm(data) {
        const errors = [];
        if (!data.name.trim()) {
            errors.push('Name is required');
        }
        if (!data.email.trim()) {
            errors.push('Email is required');
        }
        else if (!this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }
        if (!data.subject.trim()) {
            errors.push('Subject is required');
        }
        if (!data.message.trim()) {
            errors.push('Message is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * 驗證電子郵件格式
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * 顯示表單訊息
     */
    showFormMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        const form = document.querySelector('.contact-form');
        if (form) {
            form.parentNode?.insertBefore(messageEl, form.nextSibling);
            setTimeout(() => {
                messageEl.remove();
            }, 3000);
        }
    }
    /**
     * 設置鍵盤導航
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const shortcut = this.keyboardShortcuts.find(s => s.key === e.key &&
                (!s.ctrlKey || e.ctrlKey) &&
                (!s.shiftKey || e.shiftKey) &&
                (!s.altKey || e.altKey));
            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        });
    }
    /**
     * 設置載入動畫
     */
    setupLoadingAnimation() {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    }
    /**
     * 設置響應式設計
     */
    setupResponsiveDesign() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaQueryChange = (e) => {
            if (e.matches) {
                this.handleMobileLayout();
            }
            else {
                this.handleDesktopLayout();
            }
        };
        mediaQuery.addListener(handleMediaQueryChange);
        // 初始檢查
        if (mediaQuery.matches) {
            this.handleMobileLayout();
        }
        else {
            this.handleDesktopLayout();
        }
    }
    /**
     * 處理手機版佈局
     */
    handleMobileLayout() {
        const circleCursor = document.querySelector('.circle-cursor');
        if (circleCursor) {
            circleCursor.style.display = 'none';
        }
    }
    /**
     * 處理桌面版佈局
     */
    handleDesktopLayout() {
        const circleCursor = document.querySelector('.circle-cursor');
        if (circleCursor) {
            circleCursor.style.display = 'block';
        }
    }
    /**
     * 銷毀應用程式
     */
    destroy() {
        // 清除所有定時器
        this.eyeTimers.forEach(timer => clearTimeout(timer));
        this.eyeTimers = [];
        // 重置狀態
        this.collapseSection();
        this.pageState.isLoaded = false;
        console.log('TypeScript Portfolio app destroyed');
    }
}
// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    const app = new AdvancedPortfolioApp();
    // 將應用程式實例存儲在全局變數中，便於除錯
    window.portfolioApp = app;
});
//# sourceMappingURL=app.js.map