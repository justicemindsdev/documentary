e// Load configuration with production credentials
const AI_MODELS = {
    deepseek: { 
        description: 'Active Forensic Intelligence',
        model: 'anthropic/claude-3.5-sonnet',
        url: 'https://openrouter.ai/api/v1/chat/completions'
    },
    claude: {
        description: 'Claude 3.5 Sonnet',
        model: 'anthropic/claude-3.5-sonnet',
        url: 'https://openrouter.ai/api/v1/chat/completions'
    },
    gpt4: {
        description: 'GPT-4o Latest',
        model: 'openai/chatgpt-4o-latest',
        url: 'https://openrouter.ai/api/v1/chat/completions'
    }
};

// Production API Configuration - credentials loaded from environment
const API_KEY = window.CONFIG?.OPENROUTER_API_KEY || window.CONFIG?.API_KEY || 'demo-key';

// Initialize Supabase (credentials from config)
const supabase = window.supabase ? window.supabase.createClient(
    window.CONFIG?.SUPABASE?.URL || 'https://demo.supabase.co',
    window.CONFIG?.SUPABASE?.KEY || 'demo-key'
) : null;

        class BBCDocumentaryMaker {
            constructor() {
                this.video = null;
                this.transcript = '';
                this.documents = [];
                this.clips = [];
                this.currentModel = 'deepseek';
                this.currentClip = 0;
                this.isPlayingTrailer = false;
                this.videoLibrary = [];
                this.sidebarCollapsed = false;
                this.currentProjectId = null;
                this.currentProjectName = null;
                
                // Initialize media intelligence systems
                this.mediaIntelligence = new MediaIntelligenceEngine();
                this.brollProvider = new BRollProvider();
                this.musicProvider = new MusicProvider();
                
                // Initialize new processing systems
                this.overlayEngine = null;
                this.jsonExporter = new DocumentaryJSONExporter();
                
                this.initializeEventListeners();
                this.updateModelStatus();
                this.loadVideoLibrary();
                this.setupDragAndDrop();
                this.checkGenerateButtonState(); // Initialize button state
                
                console.log('🎬 BBC Documentary Maker with AI Media Intelligence and Algorithmic Cutting initialized');
            }

            initializeEventListeners() {
                // File upload handlers with debugging
                const videoFileInput = document.getElementById('videoFile');
                const transcriptFileInput = document.getElementById('transcriptFile');
                const documentsFileInput = document.getElementById('documentsFile');
                
                if (!videoFileInput || !transcriptFileInput || !documentsFileInput) {
                    console.error('❌ Upload input elements not found in DOM');
                    return;
                }
                
                videoFileInput.addEventListener('change', (e) => {
                    console.log('🎬 Video file selected:', e.target.files[0]?.name);
                    this.handleVideoUpload(e.target.files[0]);
                });

                transcriptFileInput.addEventListener('change', (e) => {
                    console.log('📝 Transcript file selected:', e.target.files[0]?.name);
                    this.handleTranscriptUpload(e.target.files[0]);
                });

                documentsFileInput.addEventListener('change', (e) => {
                    console.log('📄 Documents selected:', e.target.files.length);
                    this.handleDocumentsUpload(Array.from(e.target.files));
                });

                // Video player events
                const mainVideo = document.getElementById('mainVideo');
                mainVideo.addEventListener('timeupdate', () => this.updateProgress());
                mainVideo.addEventListener('ended', () => this.handleVideoEnd());
                mainVideo.addEventListener('loadedmetadata', () => this.updateDuration());

                // Show transcript input on click
                const transcriptUpload = document.getElementById('transcriptUpload');
                const transcriptText = document.getElementById('transcriptText');
                
                if (transcriptUpload && transcriptText) {
                    transcriptUpload.addEventListener('dblclick', () => {
                        console.log('📝 Opening transcript text area');
                        transcriptText.style.display = 'block';
                        transcriptText.focus();
                    });

                    // Process transcript text
                    transcriptText.addEventListener('blur', (e) => {
                        const text = e.target.value.trim();
                        if (text) {
                            console.log('📝 Processing pasted transcript, length:', text.length);
                            this.transcript = this.parseTranscript(text);
                            this.updateUploadStatus('transcriptUpload', '✅ Transcript Added', 'success');
                            console.log('✅ Transcript processed:', this.transcript.length, 'entries');
                            this.checkGenerateButtonState();
                        }
                    });

                    // Also process on Enter key
                    transcriptText.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            e.target.blur(); // Trigger processing
                        }
                    });
                }
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
                console.log('🎬 Starting video upload:', file?.name);
                
                if (!file) {
                    console.error('❌ No video file provided');
                    return;
                }
                
                try {
                    this.video = file;
                    const videoUrl = URL.createObjectURL(file);
                    console.log('✅ Video URL created:', videoUrl);
                    
                    const mainVideo = document.getElementById('mainVideo');
                    if (!mainVideo) {
                        console.error('❌ Main video element not found');
                        return;
                    }
                    
                    mainVideo.src = videoUrl;
                    
                    // Initialize overlay engine when video is loaded
                    mainVideo.addEventListener('loadedmetadata', () => {
                        this.overlayEngine = new VideoOverlayEngine(mainVideo);
                        console.log('🎭 Video overlay engine initialized');
                    });
                    
                    mainVideo.addEventListener('error', (e) => {
                        console.error('❌ Video load error:', e);
                        this.updateUploadStatus('videoUpload', `❌ Error loading video`, 'error');
                    });
                    
                    this.updateUploadStatus('videoUpload', `✅ ${file.name}`, 'success');
                    this.updateDocumentaryTitle(`Documentary: ${file.name.replace(/\.[^/.]+$/, "")}`);
                    
                    console.log('✅ Video upload completed successfully');
                } catch (error) {
                    console.error('❌ Video upload error:', error);
                    this.updateUploadStatus('videoUpload', `❌ Upload failed`, 'error');
                }
            }

            async handleTranscriptUpload(file) {
                console.log('📝 Starting transcript upload:', file?.name);
                
                if (!file) {
                    console.error('❌ No transcript file provided');
                    return;
                }
                
                try {
                    let text;
                    
                    if (file.type === 'application/pdf') {
                        text = `PDF transcript from ${file.name}. This would be extracted using PDF.js library in production.`;
                        console.log('📄 PDF file detected, using demo content');
                        this.updateUploadStatus('transcriptUpload', `✅ PDF ${file.name} (Demo mode)`, 'success');
                    } else {
                        text = await file.text();
                        console.log('📝 Text extracted, length:', text.length);
                        this.updateUploadStatus('transcriptUpload', `✅ ${file.name}`, 'success');
                    }
                    
                    this.transcript = this.parseTranscript(text);
                    console.log('✅ Transcript parsed, entries:', this.transcript.length);
                    
                    // Enable generate button if we have both video and transcript
                    this.checkGenerateButtonState();
                    
                } catch (error) {
                    console.error('❌ Transcript upload error:', error);
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
                console.log('🎬 Starting documentary clip generation...');
                
                const customPrompt = document.getElementById('customPrompt').value.trim();
                
                // Check if we have transcript data
                if (!this.transcript || this.transcript.length === 0) {
                    console.error('❌ No transcript data available');
                    alert('Please upload a transcript or paste text content first.');
                    return;
                }
                
                console.log('📊 Transcript data:', this.transcript.length, 'entries');

                this.showProcessing('🎬 Analyzing transcript content...', 'Processing your content for documentary segments');
                document.getElementById('generateClips').disabled = true;

                try {
                    // Use the improved transcript analyzer (no expensive API calls)
                    const analyzer = new TranscriptAnalyzer();
                    
                    this.showProcessing('📊 Extracting meaningful segments...', 'Identifying key moments and themes');
                    const segments = await analyzer.analyzeTranscript(this.transcript, customPrompt);
                    
                    if (segments && segments.length > 0) {
                        this.clips = segments;
                        this.showProcessing('✨ Finalizing documentary...', 'Preparing clips for display');
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        this.displayClips(segments);
                        this.updateMetadata(segments);
                        
                        // Load overlays into video player
                        if (this.overlayEngine) {
                            this.overlayEngine.loadSegmentOverlays(segments);
                        }
                        
                        // Save to local library
                        this.addToVideoLibrary({
                            title: document.getElementById('docTitle').textContent,
                            total_clips: segments.length,
                            created_at: new Date().toISOString()
                        });
                        
                        // Add export JSON button
                        this.addExportJSONButton(segments);
                        
                        console.log('✅ Documentary generated successfully:', segments.length, 'segments');
                    } else {
                        throw new Error('No segments could be generated from the transcript');
                    }
                    
                } catch (error) {
                    console.error('Error generating documentary:', error);
                    alert('Error generating documentary. Please check your transcript and try again.');
                } finally {
                    this.hideProcessing();
                    document.getElementById('generateClips').disabled = false;
                }
            }

            createDemoMediaAnalysis() {
                return {
                    themes: ['Legal Justice', 'Personal Transformation', 'Advocacy', 'Survivor Support', 'System Reform'],
                    emotions: [
                        { emotion: 'contemplative', intensity: 7, timestamp: 0 },
                        { emotion: 'determined', intensity: 8, timestamp: 30000 },
                        { emotion: 'revelatory', intensity: 9, timestamp: 60000 },
                        { emotion: 'inspiring', intensity: 8, timestamp: 90000 },
                        { emotion: 'hopeful', intensity: 8, timestamp: 120000 }
                    ],
                    pace: 'measured and deliberate',
                    visualStyle: {
                        colorPalette: ['deep blue', 'warm gold', 'soft white'],
                        composition: 'intimate documentary style'
                    },
                    musicMood: {
                        primary: 'contemplative and building',
                        secondary: 'hopeful resolution'
                    },
                    brollSuggestions: [
                        { query: 'courthouse exterior', category: 'legal', priority: 'high' },
                        { query: 'justice scales', category: 'symbolic', priority: 'high' },
                        { query: 'sunrise new beginning', category: 'emotional', priority: 'medium' },
                        { query: 'hope light window', category: 'atmospheric', priority: 'medium' },
                        { query: 'road ahead future', category: 'journey', priority: 'high' }
                    ]
                };
            }

            createDemoBrollResults() {
                return {
                    high_priority: [
                        {
                            title: 'Courthouse Justice Exterior',
                            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMkMyQzJDIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q291cnRob3VzZTwvdGV4dD4KPC9zdmc+',
                            search_query: 'courthouse exterior justice',
                            suggestion_category: 'legal'
                        },
                        {
                            title: 'Justice Scales Symbolic',
                            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjM5QzEyIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SnVzdGljZSBTY2FsZXM8L3RleHQ+Cjwvc3ZnPg==',
                            search_query: 'justice scales',
                            suggestion_category: 'symbolic'
                        }
                    ],
                    medium_priority: [
                        {
                            title: 'Hope and Light',
                            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjM0Y4M0Y4Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SG9wZSAmIExpZ2h0PC90ZXh0Pgo8L3N2Zz4=',
                            search_query: 'hope light window',
                            suggestion_category: 'atmospheric'
                        }
                    ],
                    low_priority: [
                        {
                            title: 'Future Journey',
                            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMTBCOTgxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RnV0dXJlIEpvdXJuZXk8L3RleHQ+Cjwvc3ZnPg==',
                            search_query: 'road ahead future',
                            suggestion_category: 'journey'
                        }
                    ],
                    metadata: {
                        total_results: 4,
                        search_time_ms: 1200
                    }
                };
            }

            createDemoMusicScore() {
                return {
                    emotional_stings: [
                        { timestamp: 60000, mood: 'revelation', duration: 3000 },
                        { timestamp: 120000, mood: 'hope', duration: 2000 }
                    ],
                    metadata: {
                        mood_progression: [
                            { timestamp: 0, mood: 'contemplative' },
                            { timestamp: 30000, mood: 'building' },
                            { timestamp: 60000, mood: 'dramatic' },
                            { timestamp: 90000, mood: 'inspiring' },
                            { timestamp: 120000, mood: 'hopeful' }
                        ]
                    }
                };
            }

            async analyzeTranscriptWithEnhancedAI(customPrompt, mediaAnalysis) {
                const model = AI_MODELS[this.currentModel];
                
                const enhancedSystemPrompt = `You are a professional documentary editor with expertise in BBC, Netflix, and ITV production standards, now enhanced with AI media intelligence.

MEDIA ANALYSIS CONTEXT:
- Detected Themes: ${mediaAnalysis.themes.join(', ')}
- Emotional Flow: ${mediaAnalysis.emotions.map(e => `${e.emotion}(${e.intensity})`).join(', ')}
- Pace: ${mediaAnalysis.pace}
- Visual Style: ${JSON.stringify(mediaAnalysis.visualStyle)}
- Music Mood: ${mediaAnalysis.musicMood.primary}

Your task is to create SURGICAL, FRAME-PERFECT clips that work seamlessly with the detected B-roll footage and music score.

ENHANCED REQUIREMENTS:
1. PRECISION TIMING: Align with emotional beats and music transitions
2. B-ROLL INTEGRATION: Consider that we have footage for: ${mediaAnalysis.brollSuggestions.map(s => s.query).join(', ')}
3. MUSIC SYNCHRONIZATION: Clips should work with ${mediaAnalysis.musicMood.primary} musical mood
4. VISUAL COHERENCE: Match the detected color palette and composition style
5. NARRATIVE ARC: Create compelling story progression

RESPONSE FORMAT (JSON ONLY):
{
  "clips": [
    {
      "title": "Compelling title that hooks viewers",
      "description": "Why this moment is cinematically significant",
      "startTime": milliseconds_precise,
      "endTime": milliseconds_precise,
      "displayStart": "MM:SS",
      "displayEnd": "MM:SS",
      "category": "emotional/factual/dramatic/context",
      "intensity": 1-10,
      "speakers": ["speaker names"],
      "keyQuotes": ["memorable quotes"],
      "transitionNote": "How to transition with B-roll",
      "brollSuggestion": "Which B-roll category works best",
      "musicCue": "Musical timing or mood for this segment"
    }
  ]
}`;

                const userPrompt = `
TRANSCRIPT TO ANALYZE:
${JSON.stringify(this.transcript)}

CUSTOM DIRECTION: ${customPrompt || 'Create a compelling documentary focusing on personal transformation and legal advocacy, incorporating available B-roll and music'}

ADDITIONAL CONTEXT:
${this.documents.map(doc => `Document: ${doc.name}\nContent: ${doc.content}`).join('\n\n')}

Generate 8-12 clips optimized for the available media assets.`;

                try {
                    // For demo purposes, return enhanced clips with media integration
                    return this.generateEnhancedDemoClips(mediaAnalysis);
                    
                } catch (error) {
                    console.error('Enhanced AI API Error:', error);
                    return this.generateEnhancedDemoClips(mediaAnalysis);
                }
            }

            generateEnhancedDemoClips(mediaAnalysis) {
                return [
                    {
                        title: "The Legal Awakening",
                        description: "Ben Chris reveals the moment his understanding of justice fundamentally changed, setting the stage for a powerful documentary about legal transformation.",
                        startTime: 0,
                        endTime: 30000,
                        displayStart: "00:00",
                        displayEnd: "00:30",
                        category: "context",
                        intensity: 7,
                        speakers: ["Ben Chris"],
                        keyQuotes: ["This is Ben Chris, and I want to tell you about a journey that changed everything"],
                        transitionNote: "Open with courthouse B-roll, fade to interview",
                        brollSuggestion: "courthouse exterior",
                        musicCue: "contemplative piano intro"
                    },
                    {
                        title: "Systemic Failures Exposed",
                        description: "A critical examination of how the legal system failed survivors, revealing deep structural problems that demand attention.",
                        startTime: 30000,
                        endTime: 60000,
                        displayStart: "00:30",
                        displayEnd: "01:00",
                        category: "factual",
                        intensity: 8,
                        speakers: ["Ben Chris"],
                        keyQuotes: ["Their stories revealed systemic issues that went deeper than I ever imagined"],
                        transitionNote: "Cut to justice scales B-roll during revelation",
                        brollSuggestion: "justice scales",
                        musicCue: "building tension strings"
                    },
                    {
                        title: "The Untold Truth",
                        description: "In this powerful moment, Ben Chris shares something he's never revealed before - the personal transformation that changed his approach to legal work.",
                        startTime: 60000,
                        endTime: 90000,
                        displayStart: "01:00",
                        displayEnd: "01:30",
                        category: "dramatic",
                        intensity: 9,
                        speakers: ["Ben Chris"],
                        keyQuotes: ["I never told anyone this before, but there was a moment when I realized..."],
                        transitionNote: "Close-up during confession, sunrise B-roll for transformation",
                        brollSuggestion: "sunrise new beginning",
                        musicCue: "dramatic revelation sting"
                    },
                    {
                        title: "Partnership for Change",
                        description: "The collaboration with Survivors UK that opened new perspectives on advocacy and justice beyond traditional frameworks.",
                        startTime: 90000,
                        endTime: 120000,
                        displayStart: "01:30",
                        displayEnd: "02:00",
                        category: "inspiring",
                        intensity: 7,
                        speakers: ["Ben Chris"],
                        keyQuotes: ["Working with Survivors UK opened my eyes to the importance of advocacy"],
                        transitionNote: "Hope and light imagery with collaborative B-roll",
                        brollSuggestion: "hope light window",
                        musicCue: "uplifting inspiration"
                    },
                    {
                        title: "Mission of Transformation",
                        description: "The ongoing commitment to building a legal system that truly serves those who need it most - a call to action for systemic change.",
                        startTime: 120000,
                        endTime: 150000,
                        displayStart: "02:00",
                        displayEnd: "02:30",
                        category: "inspiring",
                        intensity: 8,
                        speakers: ["Ben Chris"],
                        keyQuotes: ["Every case, every story, every step forward is part of building a legal system"],
                        transitionNote: "End with journey/future B-roll and rising music",
                        brollSuggestion: "road ahead future",
                        musicCue: "hopeful crescendo finale"
                    }
                ];
            }

            displayEnhancedClips(clips, brollResults, musicScore, mediaAnalysis) {
                const clipsGrid = document.getElementById('clipsGrid');
                const clipTimeline = document.getElementById('clipTimeline');
                
                clipsGrid.innerHTML = '';
                clipTimeline.innerHTML = '';
                
                clips.forEach((clip, index) => {
                    // Create enhanced timeline marker
                    const marker = document.createElement('div');
                    marker.className = 'clip-marker enhanced';
                    marker.onclick = () => this.jumpToClip(index);
                    marker.innerHTML = `
                        <div class="clip-marker-title">${clip.title}</div>
                        <div class="clip-marker-time">${clip.displayStart}</div>
                        <div class="clip-marker-intensity" style="width: ${clip.intensity * 10}%; background: ${this.getIntensityColor(clip.intensity)}"></div>
                    `;
                    clipTimeline.appendChild(marker);

                    // Find matching B-roll
                    const matchingBroll = this.findMatchingBroll(clip, brollResults);
                    
                    // Create enhanced clip card
                    const clipCard = document.createElement('div');
                    clipCard.className = 'clip-card enhanced';
                    clipCard.innerHTML = `
                        <div class="clip-thumbnail">
                            ${matchingBroll ? `<img src="${matchingBroll.thumbnail}" alt="B-roll preview" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                            <div class="play-overlay">▶</div>
                            <div class="intensity-badge" style="background: ${this.getIntensityColor(clip.intensity)}">${clip.intensity}/10</div>
                        </div>
                        <div class="clip-content">
                            <h3 class="clip-card-title">${clip.title}</h3>
                            <div class="clip-card-time">${clip.displayStart} - ${clip.displayEnd}</div>
                            <p class="clip-card-summary">${clip.description}</p>
                            <div class="clip-card-transcript">"${clip.keyQuotes ? clip.keyQuotes[0] : 'Key quote from this segment'}"</div>
                            
                            <div class="media-enhancements">
                                ${matchingBroll ? `<div class="broll-tag">🎬 ${matchingBroll.title}</div>` : ''}
                                <div class="music-tag">🎵 ${clip.musicCue || 'Background score'}</div>
                                <div class="transition-tag">✨ ${clip.transitionNote || 'Standard transition'}</div>
                            </div>
                            
                            <div class="clip-actions">
                                <button class="action-btn" onclick="documentaryMaker.jumpToClip(${index})">▶ Play</button>
                                <button class="action-btn" onclick="documentaryMaker.previewWithBroll(${index})">🎬 Preview</button>
                                <button class="action-btn" onclick="documentaryMaker.addToLibrary(${index})">💾 Save</button>
                                <button class="action-btn" onclick="documentaryMaker.exportClip(${index})">📤 Export</button>
                            </div>
                        </div>
                    `;
                    
                    clipCard.addEventListener('click', () => this.jumpToClip(index));
                    clipsGrid.appendChild(clipCard);
                });
                
                document.getElementById('clipsSection').classList.remove('hidden');
                
                // Display media intelligence summary
                this.displayMediaIntelligenceSummary(mediaAnalysis, brollResults, musicScore);
            }

            findMatchingBroll(clip, brollResults) {
                // Find B-roll that matches the clip's suggestion
                const allBroll = [
                    ...brollResults.high_priority,
                    ...brollResults.medium_priority,
                    ...brollResults.low_priority
                ];
                
                return allBroll.find(broll => 
                    broll.search_query.includes(clip.brollSuggestion) ||
                    broll.suggestion_category === clip.category
                ) || allBroll[0]; // Fallback to first available
            }

            getIntensityColor(intensity) {
                if (intensity >= 8) return '#E74C3C'; // High intensity - red
                if (intensity >= 6) return '#F39C12'; // Medium intensity - orange
                return '#3498DB'; // Low intensity - blue
            }

            displayMediaIntelligenceSummary(mediaAnalysis, brollResults, musicScore) {
                // Add a summary panel showing the AI analysis
                const summaryPanel = document.createElement('div');
                summaryPanel.className = 'media-intelligence-summary';
                summaryPanel.innerHTML = `
                    <div class="summary-header">
                        <h3>🤖 AI Media Intelligence Summary</h3>
                    </div>
                    <div class="summary-content">
                        <div class="analysis-section">
                            <h4>📊 Content Analysis</h4>
                            <p><strong>Themes:</strong> ${mediaAnalysis.themes.join(', ')}</p>
                            <p><strong>Pace:</strong> ${mediaAnalysis.pace}</p>
                            <p><strong>Emotional Progression:</strong> ${mediaAnalysis.emotions.length} emotional beats detected</p>
                        </div>
                        <div class="analysis-section">
                            <h4>🎬 B-Roll Assets</h4>
                            <p><strong>Total Results:</strong> ${brollResults.metadata.total_results} clips found</p>
                            <p><strong>High Priority:</strong> ${brollResults.high_priority.length} clips</p>
                            <p><strong>Categories:</strong> Legal, Journey, Emotional, Symbolic</p>
                        </div>
                        <div class="analysis-section">
                            <h4>🎵 Music Score</h4>
                            <p><strong>Primary Mood:</strong> ${musicScore.metadata ? musicScore.metadata.mood_progression[0]?.mood : 'Contemplative'}</p>
                            <p><strong>Emotional Stings:</strong> ${musicScore.emotional_stings?.length || 0} positioned</p>
                            <p><strong>Dynamic Range:</strong> Full orchestral with dialogue ducking</p>
                        </div>
                    </div>
                `;
                
                // Insert before clips section
                const clipsSection = document.getElementById('clipsSection');
                clipsSection.parentNode.insertBefore(summaryPanel, clipsSection);
            }

            async previewWithBroll(clipIndex) {
                const clip = this.clips[clipIndex];
                alert(`🎬 B-roll Preview: "${clip.title}"\n\nThis would show a preview combining:\n- Original footage: ${clip.displayStart} - ${clip.displayEnd}\n- B-roll: ${clip.brollSuggestion}\n- Music: ${clip.musicCue}\n- Transition: ${clip.transitionNote}`);
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
            }

            updateMetadata(clips) {
                document.getElementById('clipsCount').textContent = clips.length;
                
                const totalMs = clips.reduce((sum, clip) => sum + (clip.endTime - clip.startTime), 0);
                document.getElementById('totalDuration').textContent = this.msToTimeDisplay(totalMs);
                
                const avgIntensity = clips.reduce((sum, clip) => sum + (clip.intensity || 7), 0) / clips.length;
                document.getElementById('confidenceScore').textContent = Math.round(avgIntensity * 10) + '%';
                
                const categories = [...new Set(clips.map(clip => clip.category))];
                document.getElementById('themesCount').textContent = categories.length;
            }

            handleVideoEnd() {
                this.isPlayingTrailer = false;
                document.getElementById('playBtn').textContent = '▶';
                
                document.querySelectorAll('.clip-marker').forEach(item => {
                    item.classList.remove('active');
                });
            }

            showProcessing(text, subtext) {
                document.getElementById('processingText').textContent = text;
                document.getElementById('processingSubtext').textContent = subtext;
                document.getElementById('processingOverlay').style.display = 'flex';
            }

            hideProcessing() {
                document.getElementById('processingOverlay').style.display = 'none';
            }

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
                    const { data, error } = await supabase
                        .from('documentary_projects')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    
                    this.videoLibrary = data || [];
                } catch (error) {
                    console.error('Error loading video library:', error);
                }
            }

            clearCurrentProject() {
                // Clear current project data
                this.video = null;
                this.transcript = '';
                this.documents = [];
                this.clips = [];
                this.currentClip = 0;
                
                // Reset UI elements
                const mainVideo = document.getElementById('mainVideo');
                mainVideo.src = '';
                
                // Reset upload status
                const uploadBoxes = ['videoUpload', 'transcriptUpload', 'documentsUpload'];
                uploadBoxes.forEach(boxId => {
                    const element = document.getElementById(boxId);
                    const icon = element.querySelector('.upload-icon');
                    const h3 = element.querySelector('h3');
                    
                    // Reset to original state
                    element.style.borderColor = '';
                    element.style.background = '';
                    
                    if (boxId === 'videoUpload') {
                        icon.textContent = '🎬';
                        h3.textContent = 'Video Content';
                    } else if (boxId === 'transcriptUpload') {
                        icon.textContent = '📝';
                        h3.textContent = 'Transcript';
                    } else if (boxId === 'documentsUpload') {
                        icon.textContent = '📄';
                        h3.textContent = 'Documents';
                    }
                });
                
                // Clear transcript text area
                const transcriptText = document.getElementById('transcriptText');
                transcriptText.value = '';
                transcriptText.style.display = 'none';
                
                // Clear custom prompt
                document.getElementById('customPrompt').value = '';
                
                // Hide clips section
                document.getElementById('clipsSection').classList.add('hidden');
                
                // Reset metadata
                document.getElementById('clipsCount').textContent = '0';
                document.getElementById('totalDuration').textContent = '0m';
                document.getElementById('confidenceScore').textContent = '--';
                document.getElementById('themesCount').textContent = '0';
                
                // Reset progress bar
                document.getElementById('progressFill').style.width = '0%';
                document.getElementById('timeDisplay').textContent = '0:00 / 0:00';
                document.getElementById('playBtn').textContent = '▶';
            }

            addToLibrary(clipIndex) {
                const clip = this.clips[clipIndex];
                const projectId = this.currentProjectId || 'default';
                
                // Find project container
                let projectContainer = document.getElementById(projectId);
                if (!projectContainer) {
                    // Create default container if it doesn't exist
                    const videoLibrary = document.getElementById('videoLibrary');
                    const container = document.createElement('div');
                    container.className = 'project-videos';
                    container.id = 'default';
                    videoLibrary.appendChild(container);
                    projectContainer = container;
                }
                
                // Add clip to project
                const clipItem = document.createElement('div');
                clipItem.className = 'video-item';
                clipItem.innerHTML = `
                    <div class="video-title">${clip.title}</div>
                    <div class="video-meta">${clip.displayStart} - ${clip.displayEnd}</div>
                    <div class="video-actions">
                        <button class="action-btn" onclick="documentaryMaker.jumpToClip(${clipIndex})">Play</button>
                        <button class="action-btn" onclick="documentaryMaker.shareClip(${clipIndex})">Share</button>
                        <button class="action-btn" onclick="documentaryMaker.exportClip(${clipIndex})">Export</button>
                    </div>
                `;
                projectContainer.appendChild(clipItem);
                
                alert(`Clip "${clip.title}" saved to ${this.currentProjectName || 'current project'}`);
            }

            shareClip(clipIndex) {
                const clip = this.clips[clipIndex];
                const shareText = `Check out this documentary clip: "${clip.title}" - ${clip.description}`;
                
                if (navigator.share) {
                    navigator.share({
                        title: clip.title,
                        text: shareText,
                        url: window.location.href
                    });
                } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Clip details copied to clipboard!');
                }
            }

            exportClip(clipIndex) {
                const clip = this.clips[clipIndex];
                alert(`Export clip "${clip.title}"\nStart: ${clip.displayStart}\nEnd: ${clip.displayEnd}\n\nIn production, this would export the video segment.`);
            }

            /**
             * Preview clip with overlays
             */
            previewWithOverlays(clipIndex) {
                const clip = this.clips[clipIndex];
                
                if (this.overlayEngine) {
                    // Jump to clip and show overlays
                    this.jumpToClip(clipIndex);
                    
                    // Add preview overlay
                    this.overlayEngine.addEmergencyOverlay(
                        `Preview: ${clip.title}`,
                        'bbc-title',
                        3000
                    );
                    
                    console.log(`🎭 Previewing clip "${clip.title}" with overlays`);
                } else {
                    alert('Overlay engine not initialized. Please upload a video first.');
                }
            }

            /**
             * Add export JSON button to interface
             */
            addExportJSONButton(segments) {
                // Check if button already exists
                if (document.getElementById('exportJSONBtn')) return;
                
                const clipsSection = document.getElementById('clipsSection');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'export-controls';
                buttonContainer.style.cssText = 'margin: 20px 0; text-align: center; padding: 20px; background: rgba(0,0,0,0.1); border-radius: 10px;';
                
                buttonContainer.innerHTML = `
                    <h3 style="color: #ffffff; margin-bottom: 15px;">🎬 Algorithmic Video Processing</h3>
                    <button id="exportJSONBtn" class="action-btn" style="background: #c41e3a; color: white; padding: 12px 25px; margin: 0 10px; border: none; border-radius: 25px; font-weight: bold; cursor: pointer;">
                        📄 Export Processing JSON
                    </button>
                    <button id="exportSummaryBtn" class="action-btn" style="background: #2196F3; color: white; padding: 12px 25px; margin: 0 10px; border: none; border-radius: 25px; font-weight: bold; cursor: pointer;">
                        📊 View Summary
                    </button>
                    <button id="clearOverlaysBtn" class="action-btn" style="background: #FF9800; color: white; padding: 12px 25px; margin: 0 10px; border: none; border-radius: 25px; font-weight: bold; cursor: pointer;">
                        🧹 Clear Overlays
                    </button>
                `;
                
                clipsSection.appendChild(buttonContainer);
                
                // Add event listeners
                document.getElementById('exportJSONBtn').addEventListener('click', () => {
                    this.exportProcessingJSON(segments);
                });
                
                document.getElementById('exportSummaryBtn').addEventListener('click', () => {
                    this.showProcessingSummary(segments);
                });
                
                document.getElementById('clearOverlaysBtn').addEventListener('click', () => {
                    if (this.overlayEngine) {
                        this.overlayEngine.clearAllOverlays();
                        alert('All overlays cleared');
                    }
                });
            }

            /**
             * Export processing JSON for algorithmic video cutting
             */
            exportProcessingJSON(segments) {
                console.log('📄 Exporting processing JSON...');
                
                const videoMetadata = {
                    title: document.getElementById('docTitle').textContent,
                    format: 'mp4',
                    frameRate: 25,
                    resolution: '1920x1080'
                };
                
                const jsonData = this.jsonExporter.downloadJSON(segments, 'bbc_documentary_processing');
                
                // Show success message
                alert(`✅ Processing JSON exported successfully!\n\nFile contains:\n- ${segments.length} segments\n- ${jsonData.text_overlays.total_overlays} text overlays\n- ${jsonData.transitions.total_transitions} transitions\n- Complete algorithmic cutting instructions`);
            }

            /**
             * Show processing summary
             */
            showProcessingSummary(segments) {
                const summary = this.jsonExporter.exportSummary(segments);
                
                const summaryHTML = `
                    <div style="background: rgba(0,0,0,0.9); color: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 20px auto;">
                        <h2 style="color: #c41e3a; text-align: center; margin-bottom: 20px;">🎬 Processing Summary</h2>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                                <h4>📊 Content Analysis</h4>
                                <p><strong>Total Segments:</strong> ${summary.total_segments}</p>
                                <p><strong>Duration:</strong> ${Math.round(summary.total_duration / 1000)}s</p>
                                <p><strong>Complexity:</strong> ${summary.processing_complexity}</p>
                            </div>
                            
                            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                                <h4>🎭 Visual Elements</h4>
                                <p><strong>Text Overlays:</strong> ${summary.total_overlays}</p>
                                <p><strong>Transitions:</strong> ${summary.total_transitions}</p>
                                <p><strong>Est. Render Time:</strong> ${summary.estimated_render_time}s</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <p style="color: #cccccc;">Ready for algorithmic video processing with frame-perfect cuts and BBC-style overlays.</p>
                        </div>
                    </div>
                `;
                
                // Create modal
                const modal = document.createElement('div');
                modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;';
                modal.innerHTML = summaryHTML;
                
                // Close on click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });
                
                document.body.appendChild(modal);
            }

            /**
             * Check if generate button should be enabled
             */
            checkGenerateButtonState() {
                const generateBtn = document.getElementById('generateClips');
                if (generateBtn) {
                    const hasTranscript = this.transcript && this.transcript.length > 0;
                    generateBtn.disabled = !hasTranscript;
                    
                    if (hasTranscript) {
                        generateBtn.style.opacity = '1';
                        generateBtn.textContent = '🎬 Generate Documentary Clips';
                        console.log('✅ Generate button enabled');
                    } else {
                        generateBtn.style.opacity = '0.5';
                        generateBtn.textContent = '📝 Upload Transcript First';
                    }
                }
            }
        }

// Global functions for HTML onclick handlers
function generateDocumentaryClips() {
    documentaryMaker.generateDocumentaryClips();
}

function togglePlay() {
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
    const progressBar = event.target;
    const clickX = event.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    
    if (video.duration) {
        video.currentTime = video.duration * percentage;
    }
}

function playTrailer() {
    const video = document.getElementById('mainVideo');
    if (video.src) {
        video.currentTime = 0;
        video.play();
        document.getElementById('playBtn').textContent = '⏸';
    } else {
        alert('Please upload a video first');
    }
}

function exportCurrentView() {
    alert('Export functionality would be implemented here');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('toggleIcon');
    
    sidebar.classList.toggle('collapsed');
    toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '›' : '‹';
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('mobile-open');
}

function newProject() {
    // Create a new project without clearing previous ones
    const projectName = prompt('Enter project name:', `Project ${Date.now()}`);
    if (!projectName) return;
    
    // Create new project container in sidebar
    const videoLibrary = document.getElementById('videoLibrary');
    const projectContainer = document.createElement('div');
    projectContainer.className = 'project-container';
    projectContainer.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${projectName}</h3>
            <span class="project-date">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="project-videos" id="project-${Date.now()}">
            <!-- Videos for this project will appear here -->
        </div>
    `;
    
    // Insert at the top of video library
    videoLibrary.insertBefore(projectContainer, videoLibrary.firstChild);
    
    // Clear current working area for new project
    documentaryMaker.clearCurrentProject();
    documentaryMaker.currentProjectId = `project-${Date.now()}`;
    documentaryMaker.currentProjectName = projectName;
    
    // Update UI to show new project
    documentaryMaker.updateDocumentaryTitle(`New Project: ${projectName}`);
}

function importVideo() {
    document.getElementById('videoFile').click();
}

function openSettings() {
    alert('Settings panel would be implemented here');
}

function loadVideo(id) {
    console.log('Loading video:', id);
}

function playVideo(id) {
    console.log('Playing video:', id);
}

function shareVideo(id) {
    console.log('Sharing video:', id);
}

function editVideo(id) {
    console.log('Editing video:', id);
}

function shareTwitter() {
    window.open('https://twitter.com/intent/tweet?text=Check out this amazing documentary created with AI!', '_blank');
}

function shareFacebook() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
}

function shareInstagram() {
    alert('Instagram sharing would be implemented here');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
}

// Initialize the application
let documentaryMaker;

document.addEventListener('DOMContentLoaded', function() {
    documentaryMaker = new BBCDocumentaryMaker();
    
    // Add visual feedback for file uploads
    const uploadBoxes = document.querySelectorAll('.upload-box');
    uploadBoxes.forEach(box => {
        box.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    console.log('BBC Documentary Maker initialized successfully');
});
