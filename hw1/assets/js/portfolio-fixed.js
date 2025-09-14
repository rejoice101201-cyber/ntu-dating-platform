/**
 * Daniel Wu 作品集網站 - 修復版 TypeScript
 * 包含所有原始功能
 */
var AdvancedPortfolioApp = /** @class */ (function () {
    function AdvancedPortfolioApp() {
        this.currentPage = 'hero';
        this.eyeTimers = [];
        this.expandedSection = null;
        this.portfolioItems = [];
        this.init();
    }
    AdvancedPortfolioApp.prototype.init = function () {
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
    };
    // Circle Cursor
    AdvancedPortfolioApp.prototype.setupCircleCursor = function () {
        var circleCursor = document.querySelector('.circle-cursor');
        if (circleCursor) {
            document.addEventListener('mousemove', function (e) {
                circleCursor.style.left = e.clientX + 'px';
                circleCursor.style.top = e.clientY + 'px';
            });
            // Circle hover effect
            var interactiveElements = document.querySelectorAll('.nav-item, .name-part');
            interactiveElements.forEach(function (el) {
                var element = el;
                element.addEventListener('mouseenter', function () {
                    circleCursor.style.transform = 'translate(-50%, -50%) scale(1.2)';
                });
                element.addEventListener('mouseleave', function () {
                    circleCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                });
            });
            // Hide on small screens
            var mediaQuery = window.matchMedia('(max-width: 768px)');
            var handleMediaQueryChange = function (e) {
                if (e.matches) {
                    circleCursor.style.display = 'none';
                }
                else {
                    circleCursor.style.display = 'block';
                }
            };
            mediaQuery.addListener(handleMediaQueryChange);
            // Initial check
            if (mediaQuery.matches) {
                circleCursor.style.display = 'none';
            }
            else {
                circleCursor.style.display = 'block';
            }
        }
    };
    // Eye Animations
    AdvancedPortfolioApp.prototype.setupEyeAnimations = function () {
        var _this = this;
        var eyes = document.querySelectorAll('.eye');
        eyes.forEach(function (eye) {
            var eyeElement = eye;
            _this.startRandomBlink(eyeElement);
        });
    };
    AdvancedPortfolioApp.prototype.startRandomBlink = function (eye) {
        var _this = this;
        var blink = function () {
            eye.style.transform = 'scaleY(0.1)';
            setTimeout(function () {
                eye.style.transform = 'scaleY(1)';
            }, 150);
            // Random interval between 2-5 seconds
            var nextBlink = Math.random() * 3000 + 2000;
            var timer = setTimeout(blink, nextBlink);
            _this.eyeTimers.push(timer);
        };
        blink();
    };
    // Page Navigation
    AdvancedPortfolioApp.prototype.setupPageNavigation = function () {
        var _this = this;
        var navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                var targetPage = item.dataset.page;
                if (targetPage) {
                    _this.navigateToPage(targetPage);
                }
            });
        });
        // Close expanded sections when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-item')) {
                _this.collapseSection();
            }
        });
    };
    AdvancedPortfolioApp.prototype.navigateToPage = function (page) {
        this.currentPage = page;
        this.updateActiveNavItem(page);
        // Scroll to page
        var targetElement = document.getElementById(page);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
    AdvancedPortfolioApp.prototype.updateActiveNavItem = function (activePage) {
        var navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(function (item) {
            var element = item;
            if (element.dataset.page === activePage) {
                element.classList.add('active');
            }
            else {
                element.classList.remove('active');
            }
        });
    };
    // Sub-page Expansion
    AdvancedPortfolioApp.prototype.setupSubPageExpansion = function () {
        var _this = this;
        var subPages = document.querySelectorAll('.sub-page');
        subPages.forEach(function (subPage) {
            subPage.addEventListener('click', function (e) {
                // Don't trigger if clicking on form elements
                if (e.target.closest('.contact-form') ||
                    e.target.closest('.filter-btn') ||
                    e.target.closest('.portfolio-item') ||
                    e.target.closest('.view-project') ||
                    e.target.closest('input') ||
                    e.target.closest('textarea') ||
                    e.target.closest('button') ||
                    e.target.closest('a')) {
                    return;
                }
                var section = subPage.dataset.section;
                if (section) {
                    _this.expandSection(subPage, section);
                }
            });
        });
        // Close expanded sections when clicking outside
        document.addEventListener('click', function (e) {
            if (_this.expandedSection) {
                // Don't close if clicking on sub-page title (let title handler manage it)
                if (!e.target.closest('.sub-page')) {
                    _this.collapseSection();
                }
            }
        });
    };
    AdvancedPortfolioApp.prototype.expandSection = function (subPage, section) {
        // Collapse current section if different
        if (this.expandedSection && this.expandedSection !== subPage) {
            this.collapseSection();
        }
        // Expand new section
        this.expandedSection = subPage;
        subPage.classList.add('expanded');
        // Add hint after 10 minutes (changed to 30 seconds for testing)
        setTimeout(function () {
            subPage.classList.add('show-hint');
        }, 30000);
    };
    AdvancedPortfolioApp.prototype.collapseSection = function () {
        if (this.expandedSection) {
            this.expandedSection.classList.remove('expanded');
            this.expandedSection.classList.remove('show-hint');
            this.expandedSection = null;
        }
    };
    // Scroll Arrow
    AdvancedPortfolioApp.prototype.setupScrollArrow = function () {
        var scrollArrow = document.querySelector('.scroll-arrow');
        if (scrollArrow) {
            scrollArrow.addEventListener('click', function () {
                // Scroll to the second page (about section)
                var aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    };
    // Portfolio Filter
    AdvancedPortfolioApp.prototype.setupPortfolioFilter = function () {
        var _this = this;
        var filterButtons = document.querySelectorAll('.filter-btn');
        var portfolioItems = document.querySelectorAll('.portfolio-item');
        // Initialize: hide all items except 'school' (Academic)
        portfolioItems.forEach(function (item) {
            var element = item;
            if (element.dataset.category === 'school') {
                element.style.visibility = 'visible';
                element.style.display = 'block';
            }
            else {
                element.style.visibility = 'hidden';
                element.style.display = 'none';
            }
        });
        filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                filterButtons.forEach(function (b) {
                    b.classList.remove('active');
                });
                // Add active class to clicked button
                btn.classList.add('active');
                // Get filter category
                var filter = btn.dataset.filter;
                if (filter) {
                    _this.filterPortfolioItems(filter);
                }
            });
        });
    };
    AdvancedPortfolioApp.prototype.filterPortfolioItems = function (filter) {
        var portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(function (item) {
            var element = item;
            var category = element.dataset.category;
            if (filter === category) {
                element.style.visibility = 'visible';
                element.style.display = 'block';
            }
            else {
                element.style.visibility = 'hidden';
                element.style.display = 'none';
            }
        });
    };
    // Portfolio Interactions
    AdvancedPortfolioApp.prototype.setupPortfolioInteractions = function () {
        var _this = this;
        var portfolioCategories = document.querySelectorAll('.portfolio-category');
        portfolioCategories.forEach(function (category) {
            category.addEventListener('click', function (e) {
                e.stopPropagation();
                var categoryName = category.dataset.category;
                if (categoryName) {
                    _this.showCategoryDetails(categoryName);
                }
            });
        });
    };
    AdvancedPortfolioApp.prototype.showCategoryDetails = function (categoryName) {
        console.log('Showing details for category:', categoryName);
        // Add category details logic here if needed
    };
    // Scroll Animations
    AdvancedPortfolioApp.prototype.setupScrollAnimations = function () {
        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);
        // Observe elements that should animate on scroll
        var animateElements = document.querySelectorAll('.page-section, .portfolio-item, .contact-item');
        animateElements.forEach(function (el) {
            observer.observe(el);
        });
    };
    // Contact Form
    AdvancedPortfolioApp.prototype.setupContactForm = function () {
        var _this = this;
        var contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();
                _this.handleFormSubmit(contactForm);
            });
        }
    };
    AdvancedPortfolioApp.prototype.handleFormSubmit = function (form) {
        var formData = new FormData(form);
        var data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        // Simulate form submission
        console.log('Fixed TypeScript Form submitted:', data);
        // Show success message
        this.showFormMessage('Message sent successfully via Fixed TypeScript!', 'success');
        form.reset();
    };
    AdvancedPortfolioApp.prototype.showFormMessage = function (message, type) {
        var _a;
        // Create message element
        var messageEl = document.createElement('div');
        messageEl.className = "form-message ".concat(type);
        messageEl.textContent = message;
        // Insert after form
        var form = document.querySelector('.contact-form');
        if (form) {
            (_a = form.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(messageEl, form.nextSibling);
            // Remove message after 3 seconds
            setTimeout(function () {
                messageEl.remove();
            }, 3000);
        }
    };
    // Keyboard Navigation
    AdvancedPortfolioApp.prototype.setupKeyboardNavigation = function () {
        var _this = this;
        document.addEventListener('keydown', function (e) {
            switch (e.key) {
                case 'Escape':
                    _this.collapseSection();
                    break;
                case '1':
                    _this.navigateToPage('about');
                    break;
                case '2':
                    _this.navigateToPage('portfolio');
                    break;
                case '3':
                    _this.navigateToPage('contact');
                    break;
            }
        });
    };
    // Loading Animation
    AdvancedPortfolioApp.prototype.setupLoadingAnimation = function () {
        window.addEventListener('load', function () {
            document.body.classList.add('loaded');
        });
    };
    // Cleanup
    AdvancedPortfolioApp.prototype.destroy = function () {
        // Clear all eye animation timers
        this.eyeTimers.forEach(function (timer) { return clearTimeout(timer); });
        this.eyeTimers = [];
        // Reset expanded section
        this.collapseSection();
    };
    return AdvancedPortfolioApp;
}());
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    var app = new AdvancedPortfolioApp();
    // Add portfolio interactions setup
    setTimeout(function () {
        app.setupPortfolioInteractions();
    }, 1000);
    // Add loading state management
    document.body.classList.add('loading');
    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
        app.destroy();
    });
    // Store app instance globally for debugging
    window.app = app;
});
