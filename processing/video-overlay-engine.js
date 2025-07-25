/**
 * BBC Documentary Video Overlay Engine
 * Handles typewriter text animations and cinematic overlays
 */

class VideoOverlayEngine {
    constructor(videoElement) {
        this.video = videoElement;
        this.overlayContainer = null;
        this.activeOverlays = new Map();
        this.typewriterQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        // Create overlay container
        this.createOverlayContainer();
        
        // Bind video events
        this.video.addEventListener('timeupdate', () => this.handleTimeUpdate());
        this.video.addEventListener('play', () => this.resumeAnimations());
        this.video.addEventListener('pause', () => this.pauseAnimations());
        
        console.log('🎭 Video Overlay Engine initialized');
    }

    createOverlayContainer() {
        // Remove existing container if present
        const existing = this.video.parentElement.querySelector('.video-overlay-container');
        if (existing) existing.remove();

        // Create new overlay container
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.className = 'video-overlay-container';
        
        // Position relative to video
        const videoRect = this.video.getBoundingClientRect();
        this.overlayContainer.style.position = 'absolute';
        this.overlayContainer.style.top = '0';
        this.overlayContainer.style.left = '0';
        this.overlayContainer.style.width = '100%';
        this.overlayContainer.style.height = '100%';
        this.overlayContainer.style.pointerEvents = 'none';
        this.overlayContainer.style.zIndex = '10';

        // Insert into video parent
        this.video.parentElement.style.position = 'relative';
        this.video.parentElement.appendChild(this.overlayContainer);
    }

    /**
     * Load segment overlays for automatic display
     */
    loadSegmentOverlays(segments) {
        console.log(`🎬 Loading overlays for ${segments.length} segments`);
        
        segments.forEach(segment => {
            if (segment.textOverlays && segment.textOverlays.length > 0) {
                segment.textOverlays.forEach(overlay => {
                    this.scheduleOverlay(overlay);
                });
            }
        });
    }

    /**
     * Schedule an overlay to appear at specific time
     */
    scheduleOverlay(overlayData) {
        const timeKey = Math.floor(overlayData.startTime / 100); // 100ms precision
        
        if (!this.activeOverlays.has(timeKey)) {
            this.activeOverlays.set(timeKey, []);
        }
        
        this.activeOverlays.get(timeKey).push(overlayData);
    }

    /**
     * Handle video time updates to trigger overlays
     */
    handleTimeUpdate() {
        const currentTime = Math.floor(this.video.currentTime * 1000); // Convert to ms
        const timeKey = Math.floor(currentTime / 100);
        
        // Check for overlays to display
        if (this.activeOverlays.has(timeKey)) {
            const overlays = this.activeOverlays.get(timeKey);
            overlays.forEach(overlay => this.displayOverlay(overlay));
            this.activeOverlays.delete(timeKey); // Remove after displaying
        }

        // Clean up expired overlays
        this.cleanupExpiredOverlays(currentTime);
    }

    /**
     * Display an overlay with animation
     */
    async displayOverlay(overlayData) {
        const overlayElement = this.createOverlayElement(overlayData);
        this.overlayContainer.appendChild(overlayElement);

        // Apply animation based on type
        switch (overlayData.animation) {
            case 'typewriter':
                await this.animateTypewriter(overlayElement, overlayData);
                break;
            case 'fade-typewriter':
                await this.animateFadeTypewriter(overlayElement, overlayData);
                break;
            case 'slide-in':
                this.animateSlideIn(overlayElement, overlayData);
                break;
            case 'dramatic-slide':
                this.animateDramaticSlide(overlayElement, overlayData);
                break;
            default:
                this.animateFadeIn(overlayElement, overlayData);
        }

        // Schedule removal
        setTimeout(() => {
            this.removeOverlay(overlayElement);
        }, overlayData.duration);
    }

    /**
     * Create overlay DOM element
     */
    createOverlayElement(overlayData) {
        const element = document.createElement('div');
        element.className = `overlay-element ${overlayData.style}`;
        element.style.position = 'absolute';
        element.style.fontSize = overlayData.fontSize || '1rem';
        element.style.color = overlayData.color || '#ffffff';
        element.style.zIndex = '11';

        // Position based on overlay data
        this.positionOverlay(element, overlayData.position);

        // Set background if specified
        if (overlayData.backgroundColor) {
            element.style.background = overlayData.backgroundColor;
            element.style.padding = '10px 20px';
            element.style.borderRadius = '8px';
        }

        return element;
    }

    /**
     * Position overlay on screen
     */
    positionOverlay(element, position) {
        switch (position) {
            case 'lower-third':
                element.style.bottom = '20%';
                element.style.left = '50px';
                element.style.right = '50px';
                break;
            case 'center':
                element.style.top = '50%';
                element.style.left = '50%';
                element.style.transform = 'translate(-50%, -50%)';
                break;
            case 'lower-left':
                element.style.bottom = '15%';
                element.style.left = '50px';
                break;
            case 'upper-right':
                element.style.top = '30px';
                element.style.right = '30px';
                break;
            case 'upper-left':
                element.style.top = '30px';
                element.style.left = '50px';
                break;
            default:
                element.style.bottom = '25%';
                element.style.left = '50px';
                element.style.right = '50px';
        }
    }

    /**
     * Typewriter animation effect
     */
    async animateTypewriter(element, overlayData) {
        const text = overlayData.text;
        const speed = overlayData.typewriterSpeed || 50;
        
        element.style.opacity = '1';
        element.style.overflow = 'hidden';
        element.style.whiteSpace = 'nowrap';
        element.style.borderRight = '2px solid #ffffff';
        element.style.width = '0';
        
        // Create character spans
        const chars = text.split('');
        let displayText = '';
        
        for (let i = 0; i < chars.length; i++) {
            displayText += chars[i];
            element.textContent = displayText;
            element.style.width = `${(i + 1) * 0.6}em`;
            
            await this.delay(speed);
            
            // Check if video is paused
            if (this.video.paused) {
                await this.waitForPlay();
            }
        }
        
        // Remove cursor after typing
        setTimeout(() => {
            element.style.borderRight = 'none';
        }, 500);
    }

    /**
     * Fade + typewriter combination
     */
    async animateFadeTypewriter(element, overlayData) {
        // First fade in
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.textContent = overlayData.text;
        
        // Fade in animation
        element.style.transition = 'all 0.5s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Wait for fade, then typewriter
        await this.delay(500);
        await this.animateTypewriter(element, overlayData);
    }

    /**
     * Slide in animation
     */
    animateSlideIn(element, overlayData) {
        element.textContent = overlayData.text;
        element.style.opacity = '0';
        element.style.transform = 'translateX(-30px)';
        element.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, 50);
    }

    /**
     * Dramatic slide effect
     */
    animateDramaticSlide(element, overlayData) {
        element.textContent = overlayData.text;
        element.style.transform = 'translateX(-100%)';
        element.style.opacity = '0';
        element.style.transition = 'all 2s ease-out';
        
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
            element.style.opacity = '1';
        }, 100);
    }

    /**
     * Simple fade in
     */
    animateFadeIn(element, overlayData) {
        element.textContent = overlayData.text;
        element.style.opacity = '0';
        element.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 50);
    }

    /**
     * Remove overlay element
     */
    removeOverlay(element) {
        if (element && element.parentNode) {
            element.style.transition = 'opacity 0.5s ease-out';
            element.style.opacity = '0';
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 500);
        }
    }

    /**
     * Clean up expired overlays
     */
    cleanupExpiredOverlays(currentTime) {
        const overlays = this.overlayContainer.querySelectorAll('.overlay-element');
        overlays.forEach(overlay => {
            const startTime = parseInt(overlay.dataset.startTime) || 0;
            const duration = parseInt(overlay.dataset.duration) || 5000;
            
            if (currentTime > startTime + duration) {
                this.removeOverlay(overlay);
            }
        });
    }

    /**
     * Pause all animations when video pauses
     */
    pauseAnimations() {
        const overlays = this.overlayContainer.querySelectorAll('.overlay-element');
        overlays.forEach(overlay => {
            overlay.style.animationPlayState = 'paused';
        });
    }

    /**
     * Resume animations when video plays
     */
    resumeAnimations() {
        const overlays = this.overlayContainer.querySelectorAll('.overlay-element');
        overlays.forEach(overlay => {
            overlay.style.animationPlayState = 'running';
        });
    }

    /**
     * Wait for video to play (for paused animations)
     */
    waitForPlay() {
        return new Promise(resolve => {
            const handler = () => {
                this.video.removeEventListener('play', handler);
                resolve();
            };
            this.video.addEventListener('play', handler);
        });
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Add emergency overlay (for manual triggering)
     */
    addEmergencyOverlay(text, style = 'bbc-title', duration = 3000) {
        const overlay = {
            type: 'emergency',
            text: text,
            startTime: this.video.currentTime * 1000,
            duration: duration,
            style: style,
            animation: 'typewriter',
            position: 'center',
            fontSize: '2rem',
            color: '#ffffff',
            backgroundColor: 'rgba(196, 30, 58, 0.9)',
            typewriterSpeed: 40
        };
        
        this.displayOverlay(overlay);
    }

    /**
     * Clear all overlays
     */
    clearAllOverlays() {
        if (this.overlayContainer) {
            this.overlayContainer.innerHTML = '';
        }
        this.activeOverlays.clear();
    }

    /**
     * Update overlay container size when video resizes
     */
    updateOverlayContainer() {
        if (this.overlayContainer) {
            const videoRect = this.video.getBoundingClientRect();
            this.overlayContainer.style.width = '100%';
            this.overlayContainer.style.height = '100%';
        }
    }

    /**
     * Export current overlays as JSON for external processing
     */
    exportOverlaysAsJSON() {
        const overlays = [];
        this.activeOverlays.forEach((overlayList, timeKey) => {
            overlayList.forEach(overlay => {
                overlays.push({
                    timestamp: timeKey * 100,
                    ...overlay
                });
            });
        });
        
        return {
            video_overlays: overlays,
            total_overlays: overlays.length,
            export_timestamp: new Date().toISOString(),
            format_version: '1.0'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoOverlayEngine;
} else {
    window.VideoOverlayEngine = VideoOverlayEngine;
}