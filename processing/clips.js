generateDocumentaryClips() {
                if (!this.video || !this.transcript.length) {
                    alert('Please upload both video and transcript files');
                    return;
                }

                const customPrompt = document.getElementById('customPrompt').value.trim();
                
                this.showProcessing('Analyzing content with surgical precision...', 'Using advanced AI to identify narrative moments');
                document.getElementById('generateClips').disabled = true;

                try {
                    this.currentModel = this.selectOptimalModel('creative');
                    this.updateModelStatus();

                    const clips = await this.analyzeTranscriptWithAI(customPrompt);
                    this.clips = clips;
                    this.displayClips(clips);
                    this.updateMetadata(clips);
                    
                    // Save to Supabase
                    await this.saveProjectToSupabase({
                        title: document.getElementById('docTitle').textContent,
                        clips_data: JSON.stringify(clips),
                        total_clips: clips.length,
                        created_at: new Date().toISOString()
                    }