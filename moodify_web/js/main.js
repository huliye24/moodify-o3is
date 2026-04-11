/**
 * Moodify - 情绪的潮汐
 * Main JavaScript v2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initTidalAnimation();
    initAmbientParticles();
    initParallax();
    initSmoothScroll();
    initKeyboardNavigation();
    initHoverEffects();
    initListenButton();
    
    // Console Easter Egg
    consoleEasterEgg();
});

/**
 * Listen Button
 */
function initListenButton() {
    const listenBtn = document.getElementById('listen-btn');
    
    if (!listenBtn) return;
    
    listenBtn.addEventListener('click', () => {
        // Show player
        if (window.moodifyPlayer) {
            window.moodifyPlayer.show();
        }
        
        // Hide listen button
        listenBtn.classList.add('hidden');
    });
    
    // Hide when player is shown
    const originalShow = window.moodifyPlayer?.show;
    if (window.moodifyPlayer) {
        window.moodifyPlayer.show = function() {
            listenBtn.classList.add('hidden');
            this.player.classList.add('visible');
        };
    }
}

/**
 * Navigation v2
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page');

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#') || href.endsWith('.html')) {
                e.preventDefault();
                const targetId = href;
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    smoothScrollTo(targetSection);
                } else if (href.endsWith('.html')) {
                    window.location.href = href;
                }
            }
        });
    });

    // Update active nav link on scroll
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}` || 
                        (id === 'hero' && link.getAttribute('href') === 'index.html')) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Smooth scroll with easing
 */
function smoothScrollTo(target) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    const duration = 1000;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeOutQuart(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeOutQuart(t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

/**
 * Scroll Animations v2
 */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.belief-item, .layer-content, .philosophy-content, .mirror-content, .ending-content, .manifesto, .layer-essence, .layer-response, .tidal-nature');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });
    
    // Add stagger class to beliefs
    const beliefsContainer = document.querySelector('.beliefs');
    if (beliefsContainer) {
        beliefsContainer.classList.add('fade-in-stagger');
    }
}

/**
 * Tidal Stage Animation v2
 */
function initTidalAnimation() {
    const stages = document.querySelectorAll('.tidal-stage');
    
    if (stages.length === 0) return;

    let currentIndex = 0;

    const animateStages = () => {
        stages.forEach((stage, index) => {
            stage.classList.remove('active');
            if (index === currentIndex) {
                stage.classList.add('active');
            }
        });
        
        currentIndex = (currentIndex + 1) % stages.length;
    };

    // Start animation after a delay
    setTimeout(animateStages, 2000);
    setInterval(animateStages, 4000);
    
    // Click to activate specific stage
    stages.forEach((stage, index) => {
        stage.addEventListener('click', () => {
            currentIndex = index;
            stages.forEach((s, i) => {
                s.classList.remove('active');
                if (i === index) s.classList.add('active');
            });
        });
    });
}

/**
 * Ambient Particles v2
 */
function initAmbientParticles() {
    const container = document.querySelector('.ambient-particles');
    
    if (!container) return;

    // Create more particles with varying sizes
    for (let i = 0; i < 8; i++) {
        createParticle(container, i);
    }
}

function createParticle(container, index) {
    const particle = document.createElement('div');
    const size = 2 + Math.random() * 4;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = 10 + Math.random() * 15;
    const delay = -Math.random() * duration;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, var(--color-awaken), transparent);
        border-radius: 50%;
        opacity: 0;
        left: ${x}%;
        top: ${y}%;
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
        animation-fill-mode: forwards;
    `;
    
    container.appendChild(particle);
}

// Add dynamic particle animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes floatParticle {
        0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0;
        }
        10% { opacity: 0.4; }
        50% { 
            transform: translate(${20 + Math.random() * 40}px, ${-30 - Math.random() * 50}px) scale(1.2); 
            opacity: 0.6;
        }
        90% { opacity: 0.3; }
    }
`;
document.head.appendChild(particleStyle);

/**
 * Parallax Effect v2
 */
function initParallax() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateParallax() {
    const scrolled = window.pageYOffset;
    const fogLayers = document.querySelectorAll('.fog-layer');
    
    fogLayers.forEach((layer, index) => {
        const speed = 0.05 + (index * 0.03);
        const y = scrolled * speed;
        layer.style.transform = `translateY(${y}px)`;
    });
    
    // Parallax for other elements
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
        const heroOpacity = 1 - (scrolled / (window.innerHeight * 0.8));
        heroContent.style.opacity = Math.max(0, heroOpacity);
        heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
}

/**
 * Smooth Scroll Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScrollTo(target);
            }
        });
    });
}

/**
 * Hover Effects v2
 */
function initHoverEffects() {
    // Belief items
    document.querySelectorAll('.belief-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('.belief-icon');
            if (icon) {
                icon.style.transform = 'scale(1.15) rotate(5deg)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('.belief-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Tidal stages
    document.querySelectorAll('.tidal-stage').forEach(stage => {
        stage.addEventListener('mouseenter', () => {
            stage.style.transform = 'scale(1.1)';
        });
        
        stage.addEventListener('mouseleave', () => {
            if (!stage.classList.contains('active')) {
                stage.style.transform = 'scale(1)';
            }
        });
    });
}

/**
 * Keyboard Navigation v2
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'j') {
            e.preventDefault();
            scrollToNextSection();
        } else if (e.key === 'ArrowUp' || e.key === 'k') {
            e.preventDefault();
            scrollToPrevSection();
        } else if (e.key === 'Home') {
            e.preventDefault();
            smoothScrollTo(document.querySelector('#hero') || document.body);
        } else if (e.key === 'End') {
            e.preventDefault();
            const sections = document.querySelectorAll('.page');
            if (sections.length > 0) {
                smoothScrollTo(sections[sections.length - 1]);
            }
        }
    });
}

function scrollToNextSection() {
    const sections = Array.from(document.querySelectorAll('.page'));
    const currentScroll = window.pageYOffset;
    
    for (const section of sections) {
        const sectionTop = section.offsetTop;
        if (sectionTop > currentScroll + 150) {
            smoothScrollTo(section);
            break;
        }
    }
}

function scrollToPrevSection() {
    const sections = Array.from(document.querySelectorAll('.page'));
    const currentScroll = window.pageYOffset;
    
    for (let i = sections.length - 1; i >= 0; i--) {
        const sectionTop = sections[i].offsetTop;
        if (sectionTop < currentScroll - 150) {
            smoothScrollTo(sections[i]);
            break;
        }
    }
}

/**
 * Console Easter Egg
 */
function consoleEasterEgg() {
    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║   Moodify - 情绪的潮汐，终将抵达彼岸                           ║
    ║                                                               ║
    ║   Stay in the flow, stay in the soul.                        ║
    ║                                                               ║
    ║   不为抵达，只为停留。                                          ║
    ║                                                               ║
    ║   感谢你在这里。                                                ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
`);
}
