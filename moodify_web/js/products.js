/**
 * Moodify - 产品形态页
 * Products Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initEmotionHover();
    initMockupInteraction();
    initAlbumCoverAnimation();
});

/**
 * Emotion Layer Hover Effect
 */
function initEmotionHover() {
    const layers = document.querySelectorAll('.emotion-layer');
    
    layers.forEach(layer => {
        layer.addEventListener('mouseenter', () => {
            const subtitle = layer.querySelector('.layer-subtitles');
            if (subtitle) {
                subtitle.style.opacity = '1';
            }
        });
        
        layer.addEventListener('mouseleave', () => {
            const subtitle = layer.querySelector('.layer-subtitles');
            if (subtitle) {
                subtitle.style.opacity = '0.7';
            }
        });
    });
}

/**
 * Mockup Interaction
 */
function initMockupInteraction() {
    const emotions = document.querySelectorAll('.mockup-emotion');
    const playingTitle = document.querySelector('.playing-title');
    
    emotions.forEach(emotion => {
        emotion.addEventListener('click', () => {
            // Remove active class from all
            emotions.forEach(e => e.classList.remove('active'));
            // Add active class to clicked
            emotion.classList.add('active');
            
            // Update playing title
            if (playingTitle) {
                const emotionText = emotion.querySelector('span').textContent;
                playingTitle.textContent = `${emotionText} · 无力`;
            }
        });
    });
    
    // Play button interaction
    const playButton = document.querySelector('.control-icon.play');
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (playButton.textContent === '▶') {
                playButton.textContent = '❚❚';
            } else {
                playButton.textContent = '▶';
            }
        });
    }
}

/**
 * Album Cover Animation
 */
function initAlbumCoverAnimation() {
    const cover = document.querySelector('.album-cover');
    
    if (!cover) return;
    
    cover.addEventListener('mouseenter', () => {
        cover.style.transform = 'scale(1.02) rotate(1deg)';
    });
    
    cover.addEventListener('mouseleave', () => {
        cover.style.transform = 'scale(1) rotate(0deg)';
    });
}

/**
 * Scene Tags Animation
 */
function initSceneTags() {
    const tags = document.querySelectorAll('.scene-tag');
    
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.background = 'rgba(107, 122, 143, 0.2)';
            tag.style.borderColor = 'rgba(107, 122, 143, 0.4)';
        });
        
        tag.addEventListener('mouseleave', () => {
            tag.style.background = 'rgba(107, 122, 143, 0.1)';
            tag.style.borderColor = 'rgba(107, 122, 143, 0.2)';
        });
    });
}

initSceneTags();