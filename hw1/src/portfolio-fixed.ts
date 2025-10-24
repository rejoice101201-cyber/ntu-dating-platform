/**
 * Daniel Wu 作品集網站 - 修復版 TypeScript
 * 包含所有原始功能
 */

// 類型定義
type PageType = 'hero' | 'about' | 'portfolio' | 'contact';
type SectionType = 'about' | 'portfolio' | 'contact';
type PortfolioCategory = 'school' | 'lab' | 'hobby';

interface EyeAnimation {
  element: HTMLElement;
  timer?: number;
  isBlinking: boolean;
}

interface PortfolioItem {
  element: HTMLElement;
  category: PortfolioCategory;
  title: string;
  description: string;
  isVisible: boolean;
  animationDelay: number;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

class AdvancedPortfolioApp {
  private currentPage: PageType = 'hero';
  private eyeTimers: number[] = [];
  private expandedSection: HTMLElement | null = null;
  private portfolioItems: PortfolioItem[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
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
    this.setupPortfolioInteractions();
    
    console.log('Fixed TypeScript Portfolio app initialized successfully');
  }

  // Circle Cursor
  private setupCircleCursor(): void {
    const circleCursor = document.querySelector('.circle-cursor') as HTMLElement;
    
    if (circleCursor) {
      document.addEventListener('mousemove', (e: MouseEvent) => {
        circleCursor.style.left = e.clientX + 'px';
        circleCursor.style.top = e.clientY + 'px';
      });

      // Circle hover effect
      const interactiveElements = document.querySelectorAll('.nav-item, .name-part');
      interactiveElements.forEach((el: Element) => {
        const element = el as HTMLElement;
        element.addEventListener('mouseenter', () => {
          circleCursor.style.transform = 'translate(-50%, -50%) scale(1.2)';
        });
        
        element.addEventListener('mouseleave', () => {
          circleCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
      });

      // Hide on small screens
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      const handleMediaQueryChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          circleCursor.style.display = 'none';
        } else {
          circleCursor.style.display = 'block';
        }
      };

      mediaQuery.addListener(handleMediaQueryChange);
      
      // Initial check
      if (mediaQuery.matches) {
        circleCursor.style.display = 'none';
      } else {
        circleCursor.style.display = 'block';
      }
    }
  }

  // Eye Animations
  private setupEyeAnimations(): void {
    const eyes = document.querySelectorAll('.eye');
    
    eyes.forEach((eye: Element) => {
      const eyeElement = eye as HTMLElement;
      this.startRandomBlink(eyeElement);
    });
  }

  private startRandomBlink(eye: HTMLElement): void {
    const blink = (): void => {
      eye.style.transform = 'scaleY(0.1)';
      setTimeout(() => {
        eye.style.transform = 'scaleY(1)';
      }, 150);
      
      // Random interval between 2-5 seconds
      const nextBlink = Math.random() * 3000 + 2000;
      const timer = setTimeout(blink, nextBlink);
      this.eyeTimers.push(timer);
    };
    
    blink();
  }

  // Page Navigation
  private setupPageNavigation(): void {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach((item: Element) => {
      item.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        
        const targetPage = (item as HTMLElement).dataset.page;
        if (targetPage) {
          this.navigateToPage(targetPage as PageType);
        }
      });
    });

    // Close expanded sections when clicking outside
    document.addEventListener('click', (e: Event) => {
      if (!(e.target as HTMLElement).closest('.nav-item')) {
        this.collapseSection();
      }
    });
  }

  private navigateToPage(page: PageType): void {
    this.currentPage = page;
    this.updateActiveNavItem(page);
    
    // Scroll to page
    const targetElement = document.getElementById(page);
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  private updateActiveNavItem(activePage: PageType): void {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item: Element) => {
      const element = item as HTMLElement;
      if (element.dataset.page === activePage) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
  }

  // Sub-page Expansion
  private setupSubPageExpansion(): void {
    const subPages = document.querySelectorAll('.sub-page');
    
    subPages.forEach((subPage: Element) => {
      subPage.addEventListener('click', (e: Event) => {
        // Don't trigger if clicking on form elements
        if ((e.target as HTMLElement).closest('.contact-form') ||
            (e.target as HTMLElement).closest('.filter-btn') ||
            (e.target as HTMLElement).closest('.portfolio-item') ||
            (e.target as HTMLElement).closest('.view-project') ||
            (e.target as HTMLElement).closest('input') ||
            (e.target as HTMLElement).closest('textarea') ||
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('a')) {
          return;
        }

        const section = (subPage as HTMLElement).dataset.section;
        if (section) {
          this.expandSection(subPage as HTMLElement, section as SectionType);
        }
      });
    });

    // Close expanded sections when clicking outside
    document.addEventListener('click', (e: Event) => {
      if (this.expandedSection) {
        // Don't close if clicking on sub-page title (let title handler manage it)
        if (!(e.target as HTMLElement).closest('.sub-page')) {
          this.collapseSection();
        }
      }
    });
  }

  private expandSection(subPage: HTMLElement, section: SectionType): void {
    // Collapse current section if different
    if (this.expandedSection && this.expandedSection !== subPage) {
      this.collapseSection();
    }

    // Expand new section
    this.expandedSection = subPage;
    subPage.classList.add('expanded');
    
    // Add hint after 10 minutes (changed to 30 seconds for testing)
    setTimeout(() => {
      subPage.classList.add('show-hint');
    }, 30000);
  }

  private collapseSection(): void {
    if (this.expandedSection) {
      this.expandedSection.classList.remove('expanded');
      this.expandedSection.classList.remove('show-hint');
      this.expandedSection = null;
    }
  }

  // Scroll Arrow
  private setupScrollArrow(): void {
    const scrollArrow = document.querySelector('.scroll-arrow');
    
    if (scrollArrow) {
      scrollArrow.addEventListener('click', () => {
        // Scroll to the second page (about section)
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }
  }

  // Portfolio Filter
  private setupPortfolioFilter(): void {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    // Initialize: hide all items except 'school' (Academic)
    portfolioItems.forEach((item: Element) => {
      const element = item as HTMLElement;
      if (element.dataset.category === 'school') {
        element.style.visibility = 'visible';
        element.style.display = 'block';
      } else {
        element.style.visibility = 'hidden';
        element.style.display = 'none';
      }
    });

    filterButtons.forEach((btn: Element) => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach((b: Element) => {
          b.classList.remove('active');
        });
        
        // Add active class to clicked button
        (btn as HTMLElement).classList.add('active');
        
        // Get filter category
        const filter = (btn as HTMLElement).dataset.filter;
        if (filter) {
          this.filterPortfolioItems(filter as PortfolioCategory);
        }
      });
    });
  }

  private filterPortfolioItems(filter: PortfolioCategory): void {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach((item: Element) => {
      const element = item as HTMLElement;
      const category = element.dataset.category;
      
      if (filter === category) {
        element.style.visibility = 'visible';
        element.style.display = 'block';
      } else {
        element.style.visibility = 'hidden';
        element.style.display = 'none';
      }
    });
  }

  // Portfolio Interactions
  public setupPortfolioInteractions(): void {
    const portfolioCategories = document.querySelectorAll('.portfolio-category');
    
    portfolioCategories.forEach((category: Element) => {
      category.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const categoryName = (category as HTMLElement).dataset.category;
        if (categoryName) {
          this.showCategoryDetails(categoryName);
        }
      });
    });
  }

  private showCategoryDetails(categoryName: string): void {
    console.log('Showing details for category:', categoryName);
    // Add category details logic here if needed
  }

  // Scroll Animations
  private setupScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.page-section, .portfolio-item, .contact-item');
    animateElements.forEach((el: Element) => {
      observer.observe(el);
    });
  }

  // Contact Form
  private setupContactForm(): void {
    const contactForm = document.querySelector('.contact-form') as HTMLFormElement;
    
    if (contactForm) {
      contactForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        this.handleFormSubmit(contactForm);
      });
    }
  }

  private handleFormSubmit(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const data: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string
    };

    // Simulate form submission
    console.log('Fixed TypeScript Form submitted:', data);
    
    // Show success message
    this.showFormMessage('Message sent successfully via Fixed TypeScript!', 'success');
    form.reset();
  }

  private showFormMessage(message: string, type: 'success' | 'error'): void {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    
    // Insert after form
    const form = document.querySelector('.contact-form');
    if (form) {
      form.parentNode?.insertBefore(messageEl, form.nextSibling);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        messageEl.remove();
      }, 3000);
    }
  }

  // Keyboard Navigation
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Escape':
          this.collapseSection();
          break;
        case '1':
          this.navigateToPage('about');
          break;
        case '2':
          this.navigateToPage('portfolio');
          break;
        case '3':
          this.navigateToPage('contact');
          break;
      }
    });
  }

  // Loading Animation
  private setupLoadingAnimation(): void {
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }

  // Cleanup
  public destroy(): void {
    // Clear all eye animation timers
    this.eyeTimers.forEach(timer => clearTimeout(timer));
    this.eyeTimers = [];
    
    // Reset expanded section
    this.collapseSection();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new AdvancedPortfolioApp();
  
  // Add portfolio interactions setup
  setTimeout(() => {
    app.setupPortfolioInteractions();
  }, 1000);
  
  // Add loading state management
  document.body.classList.add('loading');
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.destroy();
  });
  
  // Store app instance globally for debugging
  (window as any).app = app;
});
