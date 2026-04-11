/**
 * Moodify - 品牌声音页
 * Voice Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initPrincipleCards();
    initColorCards();
    initFinalAnimation();
});

/**
 * Principle Cards Animation
 */
function initPrincipleCards() {
    const cards = document.querySelectorAll('.principle-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200);
            }
        });
    }, {
        threshold: 0.3
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Color Cards Animation
 */
function initColorCards() {
    const colorCards = document.querySelectorAll('.color-card');
    
    colorCards.forEach((card, index) => {
        const swatch = card.querySelector('.color-swatch');
        if (!swatch) return;
        
        // Add hover scale effect
        card.addEventListener('mouseenter', () => {
            swatch.style.transform = 'scale(1.1)';
            swatch.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', () => {
            swatch.style.transform = 'scale(1)';
            swatch.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
    });
}

/**
 * Final Animation
 */
function initFinalAnimation() {
    const finalContent = document.querySelector('.final-content');
    
    if (!finalContent) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate waves
                const waves = document.querySelectorAll('.final-wave');
                waves.forEach((wave, index) => {
                    wave.style.opacity = '0';
                    setTimeout(() => {
                        wave.style.transition = 'opacity 1s ease';
                        wave.style.opacity = (0.1 + index * 0.1).toString();
                    }, index * 300);
                });
            }
        });
    }, {
        threshold: 0.5
    });
    
    observer.observe(finalContent);
}

/**
 * Voice Diagram Interactive
 */
function initVoiceDiagram() {
    const diagram = document.querySelector('.voice-diagram');
    const marker = document.querySelector('.moodify-marker');
    
    if (!diagram || !marker) return;
    
    diagram.addEventListener('click', (e) => {
        const rect = diagram.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Move marker to click position
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
    });
}

// Initialize voice diagram
setTimeout(initVoiceDiagram, 1000);

/**
 * Slogan Animation
 */
function initSloganAnimation() {
    const slogans = document.querySelectorAll('.slogan-en, .slogan-cn');
    
    slogans.forEach(slogan => {
        slogan.style.opacity = '0';
        slogan.style.transform = 'translateY(20px)';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    slogan.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    slogan.style.opacity = '1';
                    slogan.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.5
        });
        
        observer.observe(slogan);
    });
}

initSloganAnimation();

/**
 * Sound Wave Easter Egg
 */
function initSoundWaveEasterEgg() {
    const soundWaves = document.querySelectorAll('.sound-waves .wave');
    
    soundWaves.forEach(wave => {
        wave.addEventListener('click', () => {
            wave.style.animation = 'none';
            wave.offsetHeight; // Trigger reflow
            wave.style.animation = 'soundWave 0.3s ease-in-out 3';
        });
    });
}

setTimeout(initSoundWaveEasterEgg, 2000);
