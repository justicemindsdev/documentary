// Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case ' ':
                case 'k':
                    togglePlay();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    const video = document.getElementById('mainVideo');
                    video.currentTime += 5;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    const video2 = document.getElementById('mainVideo');
                    video2.currentTime -= 5;
                    e.preventDefault();
                    break;
                case 'm':
                    const video3 = document.getElementById('mainVideo');
                    video3.muted = !video3.muted;
                    e.preventDefault();
                    break;
                case 'f':
                    const video4 = document.getElementById('mainVideo');
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        video4.requestFullscreen();
                    }
                    e.preventDefault();
                    break;
            }
        });
    