// Daniel Wu Portfolio - Advanced Interactive Features
class AdvancedPortfolioApp {
    constructor() {
        this.currentPage = 'hero';
        this.eyeTimers = [];
        this.expandedSection = null;
        
        this.init();
    }

    init() {
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
    }

    // Circle Cursor
    setupCircleCursor() {
        const circleCursor = document.querySelector('.circle-cursor');
        
        if (circleCursor) {
            document.addEventListener('mousemove', (e) => {
                circleCursor.style.left = e.clientX + 'px';
                circleCursor.style.top = e.clientY + 'px';
            });

            // Circle hover effect
            const interactiveElements = document.querySelectorAll('.nav-item, .name-part');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    circleCursor.style.transform = 'translate(-50%, -50%) scale(1.2)';
                });
                
                el.addEventListener('mouseleave', () => {
                    circleCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                });
            });

            // Hide on small screens
            const mediaQuery = window.matchMedia('(max-width: 768px)');
            const handleMediaQueryChange = (e) => {
                if (e.matches) {
                    circleCursor.style.display = 'none';
                } else {
                    circleCursor.style.display = 'block';
                }
            };
            mediaQuery.addListener(handleMediaQueryChange);
            handleMediaQueryChange(mediaQuery);
        }
    }


    // Eye Disappear Animations
    setupEyeAnimations() {
        const eyes = document.querySelectorAll('.eye');
        
        eyes.forEach((eye, index) => {
            // Each eye disappears independently every 2 seconds
            const disappearInterval = setInterval(() => {
                this.disappearEye(eye);
            }, 2000 + (index * 200)); // Small delay between eyes
            
            this.eyeTimers.push(disappearInterval);
        });
    }

    // Eye Disappear Function
    disappearEye(eye) {
        // Make eye disappear
        eye.classList.add('disappearing');
        
        // Make eye reappear after 0.5 seconds
        setTimeout(() => {
            eye.classList.remove('disappearing');
        }, 500);
    }

    // No color changes - all colors are now fixed

    // Page Navigation
    setupPageNavigation() {
        // Scroll detection for page switching
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Determine current page based on scroll position
            if (currentScrollY < windowHeight / 2) {
                this.switchToPage('hero');
            } else {
                this.switchToPage('navigation');
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Switch Page
    switchToPage(pageName) {
        if (this.currentPage !== pageName) {
            this.currentPage = pageName;
            
            // Update active page
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetPage = document.querySelector(`#${pageName}`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }
    }

    // Navigation Item Expansion
    setupNavItemExpansion() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const section = item.dataset.section;
                
                if (this.expandedSection === section) {
                    // Collapse if already expanded
                    this.collapseSection();
                } else {
                    // Expand new section
                    this.expandSection(section);
                }
            });
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                this.collapseSection();
            }
        });
    }

    // Expand Section
    expandSection(sectionName) {
        // Collapse any currently expanded section
        this.collapseSection();
        
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('expanded');
            this.expandedSection = sectionName;
        }
    }

    // Collapse Section
    collapseSection() {
        if (this.expandedSection) {
            const navItem = document.querySelector(`[data-section="${this.expandedSection}"]`);
            if (navItem) {
                navItem.classList.remove('expanded');
            }
            this.expandedSection = null;
        }
    }

    // Hover effects are now handled by CSS

    // Portfolio Category Interactions
    setupPortfolioInteractions() {
        const portfolioCategories = document.querySelectorAll('.portfolio-category');
        
        portfolioCategories.forEach(category => {
            category.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryName = category.dataset.category;
                this.showCategoryDetails(categoryName);
            });
        });
    }

    // Show Category Details
    showCategoryDetails(category) {
        // Create modal for category details
        const modal = document.createElement('div');
        modal.className = 'category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${category.toUpperCase()}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>This is the ${category} section. Here you can add detailed content about your ${category} experiences and projects.</p>
                    <div class="modal-image">
                        <img src="https://via.placeholder.com/400x300/F5E6D3/333333?text=${category.toUpperCase()}" alt="${category}">
                    </div>
                </div>
            </div>
        `;
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: #FFE135;
            padding: 2rem;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
            border: 3px solid #000;
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 100);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                modalContent.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
        });
    }

    // Sub-page expansion functionality
    setupSubPageExpansion() {
        const subPages = document.querySelectorAll('.sub-page');
        
        subPages.forEach((subPage) => {
            subPage.addEventListener('click', (e) => {
                // Don't trigger if clicking on form elements
                if (e.target.closest('.contact-form') ||
                    e.target.closest('.filter-buttons') ||
                    e.target.closest('.portfolio-item') ||
                    e.target.closest('.view-project') ||
                    e.target.closest('input') ||
                    e.target.closest('textarea') ||
                    e.target.closest('button') ||
                    e.target.closest('a')) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                const section = subPage.dataset.section;
                
                if (subPage.classList.contains('expanded')) {
                    // Collapse the section
                    this.collapseSection();
                } else {
                    // Expand the section
                    this.expandSection(subPage, section);
                }
            });
        });
        
        // Click anywhere to close
        document.addEventListener('click', (e) => {
            if (this.expandedSection) {
                // Don't close if clicking on sub-page title (let title handler manage it)
                if (e.target.closest('.sub-page-title')) {
                    return;
                }
                
                // Don't close if clicking on interactive elements
                const isInteractiveElement = e.target.closest('button, a, input, textarea, select, video, .filter-btn, .social-icon, .contact-link, .view-project, .submit-btn, .portfolio-item, .skill-item');
                
                if (!isInteractiveElement) {
                    // Close on any other click (including content area)
                    this.collapseSection();
                }
            }
        });
    }
    
    expandSection(subPage, section) {
        // Close any currently expanded section
        this.collapseSection();
        
        // Expand the new section
        subPage.classList.add('expanded');
        this.expandedSection = subPage;
        
        // Show hint after 10 minutes (600,000 milliseconds)
        // For testing: change to 30000 (30 seconds) to see the effect quickly
        setTimeout(() => {
            if (subPage.classList.contains('expanded')) {
                subPage.classList.add('show-hint');
            }
        }, 600000);
        
        // Auto-play videos when section expands
        setTimeout(() => {
            this.playVideosInSection(subPage);
        }, 500); // Wait for animation to complete
        
        // For contact section, don't prevent body scroll so user can still scroll
        if (section !== 'contact') {
            document.body.style.overflow = 'hidden';
        }
    }
    
    collapseSection() {
        if (this.expandedSection) {
            // Pause and reset videos before collapsing
            this.pauseVideosInSection(this.expandedSection);
            
            this.expandedSection.classList.remove('expanded', 'show-hint');
            this.expandedSection = null;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    // Video control functions
    playVideosInSection(section) {
        const videos = section.querySelectorAll('video');
        videos.forEach(video => {
            video.muted = true; // Mute by default to allow autoplay
            video.play().catch(error => {
                console.log('Video autoplay prevented:', error);
            });
        });
    }
    
    pauseVideosInSection(section) {
        const videos = section.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0; // Reset to beginning
        });
    }

    // Scroll Arrow functionality
    setupScrollArrow() {
        const scrollArrow = document.getElementById('scrollArrow');
        
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

    // Portfolio Filter functionality
    setupPortfolioFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        // Initialize: hide all items except 'school' (Academic)
        portfolioItems.forEach(item => {
            if (item.getAttribute('data-category') !== 'school') {
                item.style.display = 'none';
                item.style.visibility = 'hidden';
            } else {
                item.style.display = 'block';
                item.style.visibility = 'visible';
                item.classList.add('animate');
            }
        });

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (category === filter) {
                        // Show item
                        item.style.display = 'block';
                        item.style.visibility = 'visible';
                        
                        // Trigger animation after a brief delay
                        setTimeout(() => {
                            item.classList.add('animate');
                        }, 100);
                    } else {
                        // Hide item
                        item.classList.remove('animate');
                        setTimeout(() => {
                            item.style.display = 'none';
                            item.style.visibility = 'hidden';
                        }, 300);
                    }
                });
            });
        });
    }

    // Scroll Animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll('.animate-title, .animate-fade-up, .animate-slide-left, .animate-slide-right, .animate-slide-up');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Contact Form functionality
    setupContactForm() {
        const contactForm = document.querySelector('.contact-form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(contactForm);
                const name = formData.get('name');
                const email = formData.get('email');
                const subject = formData.get('subject');
                const message = formData.get('message');
                
                // Simple validation
                if (!name || !email || !subject || !message) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // Simulate form submission
                const submitBtn = contactForm.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<span>Sending...</span>';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    submitBtn.innerHTML = '<span>Message Sent!</span>';
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        contactForm.reset();
                    }, 2000);
                }, 1500);
            });
        }
    }


    // Loading Animation
    setupLoadingAnimation() {
        window.addEventListener('load', () => {
            const nameParts = document.querySelectorAll('.name-part');
            const marqueeContainer = document.querySelector('.marquee-container');
            
            // Staggered fade-in animation - 2 seconds total
            nameParts.forEach((part, index) => {
                setTimeout(() => {
                    part.classList.add('fade-in');
                }, index * 200); // Back to 200ms for 2-second timing
            });

            // Marquee appears with same interval timing
            setTimeout(() => {
                if (marqueeContainer) {
                    marqueeContainer.classList.add('fade-in');
                    // Ensure marquee animation starts immediately
                    marqueeContainer.style.animationPlayState = 'running';
                }
            }, 800); // 200ms after last name part

            // Add loaded class to body
            document.body.classList.add('loaded');
        });
    }

    // Marquee is now fixed speed (3s) and continuous

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key to close expanded section
            if (e.key === 'Escape' && this.expandedSection) {
                this.collapseSection();
            }
            
            // Arrow keys for navigation (optional)
            if (e.key === 'ArrowDown' && !this.expandedSection) {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Cleanup
    destroy() {
        // Clear eye timers
        this.eyeTimers.forEach(timer => {
            clearInterval(timer);
        });
        
        // Remove event listeners
        document.removeEventListener('click', this.collapseSection);
    }
}

// Utility Functions
const utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AdvancedPortfolioApp();
    
    // Add portfolio interactions setup
    setTimeout(() => {
        app.setupPortfolioInteractions();
    }, 1000);
    
    // Add loading state management
    document.body.classList.add('loading');
    
    // Performance optimization - marquee is now fixed speed
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
});

// Handle window resize
window.addEventListener('resize', utils.debounce(() => {
    // Handle responsive adjustments
    const circleCursor = document.querySelector('.circle-cursor');
    if (window.innerWidth <= 768 && circleCursor) {
        circleCursor.style.display = 'none';
    } else if (circleCursor) {
        circleCursor.style.display = 'block';
    }
}, 250));

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedPortfolioApp;
}