/**
 * Moodify - 音乐边界页
 * Boundary Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initQuadrantHover();
    initDosRowHighlight();
    initStructureAnimation();
});

/**
 * Quadrant Hover Effect
 */
function initQuadrantHover() {
    const quadrants = document.querySelectorAll('.quadrant');
    
    quadrants.forEach(quadrant => {
        const visual = quadrant.querySelector('.quadrant-visual');
        if (!visual) return;
        
        quadrant.addEventListener('mouseenter', () => {
            visual.style.transform = 'scale(1.1)';
            visual.style.transition = 'transform 0.5s ease';
        });
        
        quadrant.addEventListener('mouseleave', () => {
            visual.style.transform = 'scale(1)';
        });
    });
}

/**
 * Do's Row Highlight
 */
function initDosRowHighlight() {
    const dosRows = document.querySelectorAll('.dos-row');
    
    dosRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(255, 255, 255, 0.03)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });
    });
}

/**
 * Structure Phase Animation
 */
function initStructureAnimation() {
    const phases = document.querySelectorAll('.structure-phase');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.5
    });
    
    phases.forEach(phase => {
        observer.observe(phase);
    });
}

/**
 * Looping Sound Wave Effect
 */
function createSoundWave(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    
    container.appendChild(canvas);
    
    let offset = 0;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(168, 184, 201, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / 2 + Math.sin((x + offset) * 0.1) * 15;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        offset += 0.5;
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Initialize sound wave for breathing visual
const breathingWave = document.querySelector('.breathing-wave');
if (breathingWave) {
    createSoundWave(breathingWave);
}
