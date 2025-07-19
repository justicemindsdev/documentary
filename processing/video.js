handleVideoUpload(e.target.files[0]);
                });

                document.getElementById('transcriptFile').addEventListener('change', (e) => {
                    this.handleTranscriptUpload(e.target.files[0]);
                });

                document.getElementById('documentsFile').addEventListener('change', (e) => {
                    this.handleDocumentsUpload(Array.from(e.target.files));
                });

                // Video player events
                const mainVideo = document.getElementById('mainVideo');
                mainVideo.addEventListener('timeupdate', () => this.updateProgress());
                mainVideo.addEventListener('ended', () => this.handleVideoEnd());
                mainVideo.addEventListener('loadedmetadata', () => this.updateDuration());

                // Show transcript input on click
                document.getElementById('transcriptUpload').addEventListener('dblclick', () => {
                    document.getElementById('transcriptText').style.display = 'block';
                    document.getElementById('transcriptText').focus();
                });

                // Process transcript text
                document.getElementById('transcriptText').addEventListener('blur', (e) => {
                    if (e.target.value.trim()) {
                        this.transcript = this.parseTranscript(e.target.value);
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
                        } else if (line.trim() && !line.match(/^\d+$/)) {
                            currentEntry.text = (currentEntry.text || '') + ' ' + line.trim();
                            if (!line.trim()) {
                                if (currentEntry.start !== undefined) {
                                    parsed.push({...currentEntry});
                                    currentEntry = {};
                                }
                            }
                        }
                    }
                } else {
                    // Plain text - estimate timing
                    const words = text.split(' ');
                    const wordsPerSecond = 2.5;
                    
                    for (let i = 0; i < words.length; i += 20) {
                        const chunk = words.slice(i, i + 20).join(' ');
                        const startTime = (i / wordsPerSecond) * 1000;
                        const endTime = ((i + 20) / wordsPerSecond) * 1000;
                        
                        parsed.push({
                            start: startTime,
                            end: endTime,
                            text: chunk
                        });
                    }
                }
                
                return parsed;
            }

            timeToMs(timeString) {
                const parts = timeString.replace(',', '.').split(':');
                if (parts.length === 3) {
                    const [hours, minutes, seconds] = parts;
                    return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds)) * 1000;
                }
                return 0;
            }

            msToTimeDisplay(ms) {
                const totalSeconds = Math.floor(ms / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            updateUploadStatus(elementId, message, status) {
                const element = document.getElementById(elementId);
                const icon = element.querySelector('.upload-icon');
                const h3 = element.querySelector('h3');
                
                if (status === 'success') {
                    icon.textContent = '✅';
                    h3.textContent = message;
                    element.style.borderColor = '#4CAF50';
                    element.style.background = 'rgba(76, 175, 80, 0.1)';
                } else if (status === 'error') {
                    icon.textContent = '❌';
                    h3.textContent = message;
                    element.style.borderColor = '#f44336';
                    element.style.background = 'rgba(244, 67, 54, 0.1)';
                }
            }

            updateDocumentaryTitle(title) {
                document.getElementById('docTitle').textContent = title;
            }

            selectOptimalModel(taskType) {
                const modelPreferences = {
                    'analysis': 'deepseek',
                    'creative': 'gpt-4o',
                    'reasoning': 'claude-3.7',
                    'bulk': 'deepseek',
                    'complex': 'o1-preview'
                };
                
                return modelPreferences[taskType] || 'deepseek';
            }

            updateModelStatus() {
                const statusElement = document.getElementById('currentModel');
                const model = AI_MODELS[this.currentModel];
                statusElement.textContent = `${model.description}`;
            }

            async generateDocumentaryClips() {
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
                    });
                    
                } catch (error) {
                    console.error('Error generating clips:', error);
                    alert('Error generating clips. Please try again.');
                } finally {
                    this.hideProcessing();
                    document.getElementById('generateClips').disabled = false;
                }
            }

            async analyzeTranscriptWithAI(customPrompt) {
                const model = AI_MODELS[this.currentModel];
                
                const systemPrompt = `You are a professional documentary editor with expertise in BBC, Netflix, and ITV production standards. 

Your task is to analyze the provided transcript and create SURGICAL, FRAME-PERFECT clips for a professional documentary.

CRITICAL REQUIREMENTS:
1. PRECISION TIMING: Return timestamps in milliseconds (hh:mm:ss:ms format)
2. CONTEXTUAL UNDERSTANDING: Identify emotional beats, narrative arcs, and dramatic moments
3. PROFESSIONAL STANDARDS: Follow BBC/Netflix documentary pacing and structure
4. SURGICAL CUTS: Make cuts at natural speech pauses, breath points, and sentence boundaries
5. NARRATIVE FLOW: Ensure clips tell a coherent story with clear beginning, middle, end

CLIP TYPES TO IDENTIFY:
- Emotional highlights and personal revelations
- Key evidence and factual moments
- Dramatic conflicts and resolutions
- Character development moments
- Establishing context and background
- Climactic revelations

RESPONSE FORMAT (JSON ONLY):
{
  "clips": [
    {
      "title": "Viral-style title with emotional hook",
      "description": "Detailed description explaining why this moment is significant",
      "startTime": milliseconds_precise,
      "endTime": milliseconds_precise,
      "displayStart": "MM:SS",
      "displayEnd": "MM:SS",
      "category": "emotional/factual/dramatic/context",
      "intensity": 1-10,
      "speakers": ["speaker names"],
      "keyQuotes": ["memorable quotes from this segment"],
      "transitionNote": "How to transition into/out of this clip"
    }
  ]
}`;

                const userPrompt = `
TRANSCRIPT TO ANALYZE:
${JSON.stringify(this.transcript)}

CUSTOM DIRECTION: ${customPrompt || 'Create a compelling documentary focusing on the most impactful moments'}

ADDITIONAL CONTEXT:
${this.documents.map(doc => `Document: ${doc.name}\nContent: ${doc.content}`).join('\n\n')}

Generate 8-12 clips that would create a professional BBC/Netflix quality documentary.`;

                try {
                    const response = await fetch(model.url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: model.model,
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: userPrompt }
                            ],
                            temperature: 0.8,
                            max_tokens: 4000
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.statusText}`);
                    }

                    const data = await response.json();
                    const content = data.choices[0].message.content;
                    
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);
                        return result.clips || [];
                    }
                    
                    throw new Error('Failed to parse AI response');
                    
                } catch (error) {
                    console.error('AI API Error:', error);
                    
                    if (this.currentModel !== 'deepseek') {
                        this.currentModel = 'deepseek';
                        return await this.analyzeTranscriptWithAI(customPrompt);
                    }
                    
                    return this.generateDemoClips();
                }
            }

            generateDemoClips() {
                return [
                    {
                        title: "Opening Statement",
                        description: "Critical opening moments that set the documentary tone",
                        startTime: 0,
                        endTime: 30000,
                        displayStart: "00:00",
                        displayEnd: "00:30",
                        category: "context",
                        intensity: 7,
                        speakers: ["Narrator"],
                        keyQuotes: ["This is where our story begins..."],
                        transitionNote: "Fade in from black with documentary music"
                    },
                    {
                        title: "Key Revelation",
                        description: "Dramatic moment of truth that changes everything",
                        startTime: 120000,
                        endTime: 180000,
                        displayStart: "02:00",
                        displayEnd: "03:00",
                        category: "dramatic",
                        intensity: 9,
                        speakers: ["Main Subject"],
                        keyQuotes: ["I never told anyone this before..."],
                        transitionNote: "Cut to close-up during emotional peak"
                    }
                ];
            }

            displayClips(clips) {
                const clipsGrid = document.getElementById('clipsGrid');
                const clipTimeline = document.getElementById('clipTimeline');
                
                clipsGrid.innerHTML = '';
                clipTimeline.innerHTML = '';
                
                clips.forEach((clip, index) => {
                    // Create timeline marker
                    const marker = document.createElement('div');
                    marker.className = 'clip-marker';
                    marker.onclick = () => this.jumpToClip(index);
                    marker.innerHTML = `
                        <div class="clip-marker-title">${clip.title}</div>
                        <div class="clip-marker-time">${clip.displayStart}</div>
                    `;
                    clipTimeline.appendChild(marker);

                    // Create clip card
                    const clipCard = document.createElement('div');
                    clipCard.className = 'clip-card';
                    clipCard.innerHTML = `
                        <div class="clip-thumbnail">
                            <div class="play-overlay">▶</div>
                        </div>
                        <div class="clip-content">
                            <h3 class="clip-card-title">${clip.title}</h3>
                            <div class="clip-card-time">${clip.displayStart} - ${clip.displayEnd}</div>
                            <p class="clip-card-summary">${clip.description}</p>
                            <div class="clip-card-transcript">"${clip.keyQuotes ? clip.keyQuotes[0] : 'Key quote from this segment'}"</div>
                            <div class="clip-actions">
                                <button class="action-btn" onclick="documentaryMaker.jumpToClip(${index})">▶ Play</button>
                                <button class="action-btn" onclick="documentaryMaker.addToLibrary(${index})">💾 Save</button>
                                <button class="action-btn" onclick="documentaryMaker.shareClip(${index})">🔗 Share</button>
                                <button class="action-btn" onclick="documentaryMaker.exportClip(${index})">📤 Export</button>
                            </div>
                        </div>
                    `;
                    
                    clipCard.addEventListener('click', () => this.jumpToClip(index));
                    clipsGrid.appendChild(clipCard);
                });
                
                document.getElementById('clipsSection').classList.remove('hidden');
            }

            jumpToClip(index) {
                const clip = this.clips[index];
                const video = document.getElementById('mainVideo');
                
                if (video.src) {
                    video.currentTime = clip.startTime / 1000;
                    video.play();
                    document.getElementById('playBtn').textContent = '⏸';
                    
                    // Update active marker
                    document.querySelectorAll('.clip-marker').forEach((marker, i) => {
                        marker.classList.toggle('active', i === index);
                    });
                    
                    this.currentClip = index;
                }
            }

            updateProgress() {
                const video = document.getElementById('mainVideo');
                const progressFill = document.getElementById('progressFill');
                const timeDisplay = document.getElementById('timeDisplay');
                
                if (video.duration) {
                    const percent = (video.currentTime / video.duration) * 100;
                    progressFill.style.width = percent + '%';
                    
                    const current = this.msToTimeDisplay(video.currentTime * 1000);
                    const total = this.msToTimeDisplay(video.duration * 1000);
                    timeDisplay.textContent = `${current} / ${total}`;
                }
            }

            updateDuration() {
                const video = document.getElementById('mainVideo');
                if (video.duration) {
                    const duration = this.msToTimeDisplay(video.duration * 1000);
                    document.getElementById('totalDuration').textContent = duration;
                }