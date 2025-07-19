parseTranscript(e.target.value);
                        this.updateUploadStatus('transcriptUpload', '✅ Transcript Added', 'success');
                    }
                });
            }

            setupDragAndDrop() {
                const uploadBoxes = document.querySelectorAll('.upload-box');
                
                uploadBoxes.forEach(box => {
                    box.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        box.classList.add('dragover');
                    });

                    box.addEventListener('dragleave', () => {
                        box.classList.remove('dragover');
                    });

                    box.addEventListener('drop', (e) => {
                        e.preventDefault();
                        box.classList.remove('dragover');
                        
                        const files = Array.from(e.dataTransfer.files);
                        if (box.id === 'videoUpload') {
                            this.handleVideoUpload(files[0]);
                        } else if (box.id === 'transcriptUpload') {
                            this.handleTranscriptUpload(files[0]);
                        } else if (box.id === 'documentsUpload') {
                            this.handleDocumentsUpload(files);
                        }
                    });
                });
            }

            async handleVideoUpload(file) {
                if (!file) return;
                
                this.video = file;
                const videoUrl = URL.createObjectURL(file);
                
                const mainVideo = document.getElementById('mainVideo');
                mainVideo.src = videoUrl;
                
                this.updateUploadStatus('videoUpload', `✅ ${file.name}`, 'success');
                this.updateDocumentaryTitle(`Documentary: ${file.name.replace(/\.[^/.]+$/, "")}`);
            }

            async handleTranscriptUpload(file) {
                if (!file) return;
                
                try {
                    let text;
                    
                    if (file.type === 'application/pdf') {
                        text = `PDF transcript from ${file.name}. This would be extracted using PDF.js library in production.`;
                        this.updateUploadStatus('transcriptUpload', `✅ PDF ${file.name} (Demo mode)`, 'success');
                    } else {
                        text = await file.text();
                        this.updateUploadStatus('transcriptUpload', `✅ ${file.name}`, 'success');
                    }
                    
                    this.transcript = this.parseTranscript(text);
                } catch (error) {
                    this.updateUploadStatus('transcriptUpload', `❌ Error reading file`, 'error');
                }
            }

            async handleDocumentsUpload(files) {
                if (!files.length) return;
                
                for (const file of files) {
                    try {
                        if (file.type === 'application/pdf') {
                            this.documents.push({
                                name: file.name,
                                content: 'PDF content placeholder'
                            });
                        }
                    } catch (error) {
                        console.error('Error processing document:', error);
                    }
                }
                
                this.updateUploadStatus('documentsUpload', `✅ ${files.length} documents`, 'success');
            }

            parseTranscript(text) {
                const lines = text.split('\n');
                const parsed = [];
                
                if (text.includes('-->')) {
                    // SRT or VTT format
                    let currentEntry = {};
                    
                    for (const line of lines) {
                        if (line.includes('-->')) {
                            const [start, end] = line.split('-->').map(t => t.trim());
                            currentEntry.start = this.timeToMs(start);
                            currentEntry.end = this.timeToMs(end);
                        }