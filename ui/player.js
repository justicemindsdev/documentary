togglePlay() {
            const video = document.getElementById('mainVideo');
            const playBtn = document.getElementById('playBtn');
            
            if (video.paused) {
                video.play();
                playBtn.textContent = '⏸';
            } else {
                video.pause();
                playBtn.textContent = '▶';
            }
        }

        function seek(event) {
            const video = document.getElementById('mainVideo');
            const rect = event.target.getBoundingClientRect();
            const percent = (event.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
        }