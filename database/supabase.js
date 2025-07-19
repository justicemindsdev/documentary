// Supabase Integration
            async saveProjectToSupabase(projectData) {
                try {
                    const { data, error } = await supabase
                        .from('documentary_projects')
                        .insert([projectData]);

                    if (error) throw error;
                    
                    this.addToVideoLibrary(projectData);
                    return data;
                } catch (error) {
                    console.error('Error saving to Supabase:', error);
                    return null;
                }
            }

            addToVideoLibrary(projectData) {
                const videoLibrary = document.getElementById('videoLibrary');
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.innerHTML = `
                    <div class="video-title">${projectData.title}</div>
                    <div class="video-meta">${projectData.total_clips} segments</div>
                    <div class="video-actions">
                        <button class="action-btn" onclick="documentaryMaker.playVideo('${projectData.title}')">Play</button>
                        <button class="action-btn" onclick="documentaryMaker.shareVideo('${projectData.title}')">Share</button>
                        <button class="action-btn" onclick="documentaryMaker.editVideo('${projectData.title}')">Edit</button>
                    </div>
                `;
                videoLibrary.insertBefore(videoItem, videoLibrary.firstChild);
            }

            async loadVideoLibrary() {
                try {
                    const { data, error }