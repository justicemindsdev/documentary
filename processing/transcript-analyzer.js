class TranscriptAnalyzer {
    constructor() {
        // Remove expensive API calls - work directly with transcript data
        this.segmentTypes = {
            'key_moment': { color: '#e74c3c', intensity: 8 },
            'revelation': { color: '#f39c12', intensity: 9 },
            'conflict': { color: '#c0392b', intensity: 7 },
            'insight': { color: '#3498db', intensity: 6 },
            'emotional': { color: '#9b59b6', intensity: 8 }
        };
    }

    /**
     * Analyzes transcript data and extracts meaningful documentary segments
     * Now works directly with transcript without expensive AI calls
     */
    async analyzeTranscript(transcriptData, customPrompt = '') {
        console.log('🎬 Starting focused transcript analysis...');
        console.log('📊 Transcript entries:', transcriptData.length);

        try {
            // Process transcript to standardized format
            const processedTranscript = this.processTranscriptData(transcriptData);
            console.log('✅ Processed transcript entries:', processedTranscript.length);

            // Extract segments using intelligent text analysis (no API calls)
            const segments = this.extractSegmentsFromText(processedTranscript, customPrompt);
            console.log('🎭 Generated segments:', segments.length);

            // Enhance segments with timing and context
            const enhancedSegments = this.enhanceSegments(segments, processedTranscript);
            console.log('✨ Enhanced segments with timing and context');

            return enhancedSegments;

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            return this.createBasicSegments(transcriptData);
        }
    }

    /**
     * Process various transcript formats to standardized format
     */
    processTranscriptData(data) {
        if (!Array.isArray(data)) {
            // Handle string input (SRT, VTT, or plain text)
            return this.parseTextTranscript(data);
        }

        // Handle array input (Grain format or other structured data)
        return data.map((entry, index) => ({
            start: this.parseTime(entry.start || entry.startTime || index * 5000),
            end: this.parseTime(entry.end || entry.endTime || (index * 5000) + 4000),
            text: entry.text || entry.content || '',
            speaker: entry.speaker || entry.participant || 'Speaker',
            index: index
        })).filter(entry => entry.text.trim().length > 0);
    }

    /**
     * Parse text-based transcripts (SRT, VTT, plain text)
     */
    parseTextTranscript(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const entries = [];
        let currentTime = 0;

        // Try to detect SRT format
        if (text.includes('-->')) {
            return this.parseSRTFormat(text);
        }

        // Parse as plain text with estimated timing
        lines.forEach((line, index) => {
            if (line.trim().length > 10) { // Skip very short lines
                const words = line.trim().split(' ').length;
                const duration = Math.max(2000, words * 300); // ~300ms per word

                entries.push({
                    start: currentTime,
                    end: currentTime + duration,
                    text: line.trim(),
                    speaker: this.detectSpeaker(line) || 'Speaker',
                    index: index
                });

                currentTime += duration + 500; // 500ms pause between segments
            }
        });

        return entries;
    }

    /**
     * Parse SRT format specifically
     */
    parseSRTFormat(srtText) {
        const blocks = srtText.split(/\n\s*\n/);
        const entries = [];

        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                const timeLine = lines[1];
                const textLines = lines.slice(2);
                
                if (timeLine.includes('-->')) {
                    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
                    const start = this.srtTimeToMs(startStr);
                    const end = this.srtTimeToMs(endStr);
                    const text = textLines.join(' ');

                    entries.push({
                        start: start,
                        end: end,
                        text: text,
                        speaker: this.detectSpeaker(text) || 'Speaker',
                        index: entries.length
                    });
                }
            }
        });

        return entries;
    }

    /**
     * Convert SRT time format to milliseconds
     */
    srtTimeToMs(timeStr) {
        const parts = timeStr.replace(',', '.').split(':');
        if (parts.length === 3) {
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseFloat(parts[2]) || 0;
            return (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
        return 0;
    }

    /**
     * Detect speaker from text patterns
     */
    detectSpeaker(text) {
        // Look for speaker patterns like "John: text" or "[John] text"
        const speakerMatch = text.match(/^(\[?[A-Z][a-z]+\]?):?\s*/);
        if (speakerMatch) {
            return speakerMatch[1].replace(/[\[\]:]/g, '');
        }
        return null;
    }

    /**
     * Extract segments using intelligent text analysis (no API calls)
     */
    extractSegmentsFromText(transcript, customPrompt) {
        const segments = [];
        const minSegmentLength = 3; // Minimum 3 transcript entries per segment
        const maxSegmentLength = 15; // Maximum 15 entries per segment

        // Group transcript into meaningful segments based on content patterns
        let currentSegment = [];
        let segmentStart = 0;

        for (let i = 0; i < transcript.length; i++) {
            const entry = transcript[i];
            currentSegment.push(entry);

            // Check if we should end the current segment
            const shouldEndSegment = 
                currentSegment.length >= minSegmentLength && (
                    currentSegment.length >= maxSegmentLength ||
                    this.isNaturalBreak(entry, transcript[i + 1]) ||
                    this.isTopicChange(currentSegment)
                );

            if (shouldEndSegment || i === transcript.length - 1) {
                if (currentSegment.length >= minSegmentLength) {
                    const segment = this.createSegmentFromEntries(currentSegment, segments.length);
                    if (segment) {
                        segments.push(segment);
                    }
                }
                currentSegment = [];
                segmentStart = i + 1;
            }
        }

        return segments;
    }

    /**
     * Check if there's a natural break between entries
     */
    isNaturalBreak(current, next) {
        if (!next) return true;

        // Long pause between entries
        const pause = next.start - current.end;
        if (pause > 3000) return true; // 3+ second pause

        // Speaker change
        if (current.speaker !== next.speaker) return true;

        // Sentence ending patterns
        const text = current.text.trim();
        if (text.match(/[.!?]$/) && next.text.match(/^[A-Z]/)) return true;

        return false;
    }

    /**
     * Check if there's a topic change within the segment
     */
    isTopicChange(entries) {
        if (entries.length < 5) return false;

        const recentText = entries.slice(-3).map(e => e.text).join(' ').toLowerCase();
        const earlierText = entries.slice(0, 3).map(e => e.text).join(' ').toLowerCase();

        // Look for topic transition words
        const transitionWords = ['however', 'but', 'meanwhile', 'on the other hand', 'speaking of', 'anyway'];
        return transitionWords.some(word => recentText.includes(word));
    }

    /**
     * Create a segment from a group of transcript entries
     */
    createSegmentFromEntries(entries, index) {
        if (entries.length === 0) return null;

        const startTime = entries[0].start;
        const endTime = entries[entries.length - 1].end;
        const fullText = entries.map(e => e.text).join(' ');
        const speakers = [...new Set(entries.map(e => e.speaker))];

        // Analyze content to determine category and title
        const analysis = this.analyzeContent(fullText);
        
        // Extract key quotes (sentences with emotional weight)
        const keyQuotes = this.extractKeyQuotes(fullText);

        return {
            title: analysis.title,
            description: analysis.description,
            start_ms: startTime,
            end_ms: endTime,
            category: analysis.category,
            key_quotes: keyQuotes,
            speakers: speakers,
            content: fullText,
            entries: entries.length,
            intensity: analysis.intensity
        };
    }

    /**
     * Analyze content to determine category, title, and description
     */
    analyzeContent(text) {
        const lowerText = text.toLowerCase();
        
        // Determine category based on content patterns
        let category = 'insight';
        let intensity = 6;
        
        if (this.containsEmotionalWords(lowerText)) {
            category = 'emotional';
            intensity = 8;
        } else if (this.containsConflictWords(lowerText)) {
            category = 'conflict';
            intensity = 7;
        } else if (this.containsRevelationWords(lowerText)) {
            category = 'revelation';
            intensity = 9;
        } else if (this.containsKeyMomentWords(lowerText)) {
            category = 'key_moment';
            intensity = 8;
        }

        // Generate title based on content
        const title = this.generateTitle(text, category);
        
        // Generate description
        const description = this.generateDescription(text, category);

        return { category, title, description, intensity };
    }

    /**
     * Check for emotional content
     */
    containsEmotionalWords(text) {
        const emotionalWords = ['feel', 'emotion', 'heart', 'love', 'fear', 'angry', 'sad', 'happy', 'pain', 'hurt', 'cry', 'tears'];
        return emotionalWords.some(word => text.includes(word));
    }

    /**
     * Check for conflict content
     */
    containsConflictWords(text) {
        const conflictWords = ['problem', 'issue', 'challenge', 'difficult', 'struggle', 'fight', 'argue', 'disagree', 'conflict'];
        return conflictWords.some(word => text.includes(word));
    }

    /**
     * Check for revelation content
     */
    containsRevelationWords(text) {
        const revelationWords = ['realize', 'understand', 'discover', 'found out', 'learned', 'truth', 'secret', 'hidden'];
        return revelationWords.some(word => text.includes(word));
    }

    /**
     * Check for key moment indicators
     */
    containsKeyMomentWords(text) {
        const keyWords = ['important', 'significant', 'crucial', 'turning point', 'moment', 'decision', 'change'];
        return keyWords.some(word => text.includes(word));
    }

    /**
     * Generate appropriate title based on content
     */
    generateTitle(text, category) {
        const words = text.split(' ').slice(0, 50); // First 50 words
        
        // Look for meaningful phrases
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
        if (sentences.length > 0) {
            const firstSentence = sentences[0].trim();
            const titleWords = firstSentence.split(' ').slice(0, 6);
            if (titleWords.length >= 3) {
                return titleWords.join(' ').replace(/[^\w\s]/g, '');
            }
        }

        // Fallback titles based on category
        const fallbackTitles = {
            'emotional': 'Personal Reflection',
            'conflict': 'Facing Challenges',
            'revelation': 'Key Discovery',
            'key_moment': 'Pivotal Moment',
            'insight': 'Important Discussion'
        };

        return fallbackTitles[category] || 'Documentary Segment';
    }

    /**
     * Generate description based on content
     */
    generateDescription(text, category) {
        const wordCount = text.split(' ').length;
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
        
        const descriptions = {
            'emotional': `A deeply personal moment revealing authentic emotions and human experience. Contains ${wordCount} words across ${sentences.length} key statements.`,
            'conflict': `A challenging situation that highlights important tensions and difficulties. Features ${wordCount} words of crucial dialogue.`,
            'revelation': `A moment of discovery or realization that advances the narrative. Captures ${wordCount} words of significant insight.`,
            'key_moment': `A pivotal point in the story that shapes the overall narrative. Documents ${wordCount} words of essential content.`,
            'insight': `An important discussion that provides valuable perspective. Features ${wordCount} words of meaningful dialogue.`
        };

        return descriptions[category] || `A significant segment containing ${wordCount} words of important content.`;
    }

    /**
     * Extract key quotes from text
     */
    extractKeyQuotes(text) {
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
        const quotes = [];

        // Take first and last meaningful sentences
        if (sentences.length > 0) {
            quotes.push(sentences[0].trim() + '.');
            if (sentences.length > 1) {
                quotes.push(sentences[sentences.length - 1].trim() + '.');
            }
        }

        return quotes.slice(0, 3); // Maximum 3 quotes
    }

    /**
     * Enhance segments with precise timing and context for algorithmic video cutting
     */
    enhanceSegments(segments, transcript) {
        return segments.map((segment, index) => {
            const duration = Math.round((segment.end_ms - segment.start_ms) / 1000);
            const cutTiming = this.calculateOptimalCutTiming(segment, transcript);
            const textOverlays = this.generateTextOverlays(segment);
            
            return {
                id: `segment_${index + 1}`,
                title: segment.title,
                description: segment.description,
                startTime: segment.start_ms,
                endTime: segment.end_ms,
                displayStart: this.msToTimeDisplay(segment.start_ms),
                displayEnd: this.msToTimeDisplay(segment.end_ms),
                category: segment.category,
                intensity: segment.intensity,
                speakers: segment.speakers || ['Speaker'],
                keyQuotes: segment.key_quotes || [],
                actualContent: segment.content || '',
                transcriptEntries: segment.entries || 1,
                duration: duration,
                wordCount: (segment.content || '').split(' ').length,
                documentaryValue: `Authentic content extracted from transcript analysis`,
                
                // Enhanced algorithmic cutting data
                cutTiming: cutTiming,
                textOverlays: textOverlays,
                videoEditing: {
                    fadeInDuration: this.calculateFadeInDuration(segment),
                    fadeOutDuration: this.calculateFadeOutDuration(segment),
                    naturalCutPoints: this.findNaturalCutPoints(segment, transcript),
                    speechPauses: this.identifySpeechPauses(segment, transcript),
                    emotionalBeats: this.mapEmotionalBeats(segment),
                    cinematicTransitions: this.suggestCinematicTransitions(segment)
                }
            };
        });
    }

    /**
     * Calculate optimal cut timing for algorithmic video processing
     */
    calculateOptimalCutTiming(segment, transcript) {
        const entries = transcript.filter(e => 
            e.start >= segment.start_ms && e.end <= segment.end_ms
        );
        
        return {
            preRoll: 500, // 500ms before speech starts
            postRoll: 300, // 300ms after speech ends
            breathPauses: this.findBreathPauses(entries),
            sentenceBoundaries: this.findSentenceBoundaries(entries),
            speakerChanges: this.findSpeakerChanges(entries),
            optimalCutFrame: segment.start_ms + 200 // Slight delay for natural feel
        };
    }

    /**
     * Generate BBC-style text overlays with typewriter effects
     */
    generateTextOverlays(segment) {
        const overlays = [];
        
        // Title overlay at segment start
        overlays.push({
            type: 'title',
            text: segment.title,
            startTime: segment.start_ms + 1000,
            duration: 3000,
            style: 'bbc-title',
            animation: 'typewriter',
            position: 'lower-third',
            fontSize: '2.5rem',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.8)',
            typewriterSpeed: 50 // ms per character
        });

        // Key quote overlay
        if (segment.key_quotes && segment.key_quotes.length > 0) {
            const midPoint = segment.start_ms + ((segment.end_ms - segment.start_ms) / 2);
            overlays.push({
                type: 'quote',
                text: `"${segment.key_quotes[0]}"`,
                startTime: midPoint,
                duration: 4000,
                style: 'bbc-quote',
                animation: 'fade-typewriter',
                position: 'center',
                fontSize: '1.8rem',
                color: '#f8f8f8',
                backgroundColor: 'rgba(0,0,0,0.6)',
                typewriterSpeed: 30
            });
        }

        // Speaker identification
        if (segment.speakers && segment.speakers.length > 0) {
            overlays.push({
                type: 'speaker',
                text: segment.speakers[0],
                startTime: segment.start_ms + 500,
                duration: 2000,
                style: 'bbc-speaker',
                animation: 'slide-in',
                position: 'lower-left',
                fontSize: '1.2rem',
                color: '#ffffff',
                backgroundColor: 'rgba(40,40,40,0.9)'
            });
        }

        return overlays;
    }

    /**
     * Find natural breath pauses for cutting
     */
    findBreathPauses(entries) {
        const pauses = [];
        
        for (let i = 0; i < entries.length - 1; i++) {
            const currentEnd = entries[i].end;
            const nextStart = entries[i + 1].start;
            const pauseDuration = nextStart - currentEnd;
            
            if (pauseDuration > 200 && pauseDuration < 2000) { // 200ms-2s pauses
                pauses.push({
                    startTime: currentEnd,
                    endTime: nextStart,
                    duration: pauseDuration,
                    type: 'breath',
                    cutQuality: pauseDuration > 500 ? 'excellent' : 'good'
                });
            }
        }
        
        return pauses;
    }

    /**
     * Find sentence boundaries for natural cuts
     */
    findSentenceBoundaries(entries) {
        const boundaries = [];
        
        entries.forEach(entry => {
            const text = entry.text;
            const sentenceEnders = /[.!?]+/g;
            let match;
            
            while ((match = sentenceEnders.exec(text)) !== null) {
                const position = match.index;
                const relativeTime = (position / text.length) * (entry.end - entry.start);
                
                boundaries.push({
                    timestamp: entry.start + relativeTime,
                    type: 'sentence',
                    punctuation: match[0],
                    cutQuality: 'excellent'
                });
            }
        });
        
        return boundaries;
    }

    /**
     * Find speaker changes for cuts
     */
    findSpeakerChanges(entries) {
        const changes = [];
        
        for (let i = 1; i < entries.length; i++) {
            if (entries[i].speaker !== entries[i-1].speaker) {
                changes.push({
                    timestamp: entries[i].start,
                    fromSpeaker: entries[i-1].speaker,
                    toSpeaker: entries[i].speaker,
                    type: 'speaker_change',
                    cutQuality: 'good'
                });
            }
        }
        
        return changes;
    }

    /**
     * Map emotional beats throughout segment
     */
    mapEmotionalBeats(segment) {
        const beats = [];
        const duration = segment.end_ms - segment.start_ms;
        const quarterPoints = [0.25, 0.5, 0.75];
        
        quarterPoints.forEach((point, index) => {
            const timestamp = segment.start_ms + (duration * point);
            beats.push({
                timestamp: timestamp,
                intensity: segment.intensity + (Math.random() * 2 - 1), // Slight variation
                emotion: this.inferEmotionFromCategory(segment.category),
                visualCue: this.suggestVisualCue(segment.category, point)
            });
        });
        
        return beats;
    }

    /**
     * Suggest cinematic transitions
     */
    suggestCinematicTransitions(segment) {
        const transitions = {
            intro: {
                type: 'fade-in',
                duration: 1000,
                curve: 'ease-in'
            },
            outro: {
                type: this.intensity > 7 ? 'dramatic-fade' : 'soft-fade',
                duration: 800,
                curve: 'ease-out'
            }
        };

        // Add category-specific transitions
        switch (segment.category) {
            case 'dramatic':
                transitions.midpoint = {
                    type: 'quick-cut',
                    timestamp: segment.start_ms + ((segment.end_ms - segment.start_ms) * 0.6),
                    effect: 'zoom-in'
                };
                break;
            case 'emotional':
                transitions.midpoint = {
                    type: 'slow-zoom',
                    timestamp: segment.start_ms + ((segment.end_ms - segment.start_ms) * 0.4),
                    effect: 'emotional-close-up'
                };
                break;
        }

        return transitions;
    }

    /**
     * Calculate optimal fade durations
     */
    calculateFadeInDuration(segment) {
        return segment.intensity > 7 ? 500 : 1000; // Faster fades for high intensity
    }

    calculateFadeOutDuration(segment) {
        return segment.category === 'emotional' ? 1500 : 800; // Longer fades for emotional content
    }

    /**
     * Infer emotion from category
     */
    inferEmotionFromCategory(category) {
        const emotionMap = {
            'emotional': 'contemplative',
            'dramatic': 'intense',
            'revelation': 'surprising',
            'conflict': 'tense',
            'key_moment': 'significant',
            'insight': 'thoughtful'
        };
        return emotionMap[category] || 'neutral';
    }

    /**
     * Suggest visual cues for emotional beats
     */
    suggestVisualCue(category, timePoint) {
        const cues = {
            'emotional': ['close-up', 'soft-lighting', 'slight-zoom'],
            'dramatic': ['tight-frame', 'high-contrast', 'quick-cut'],
            'revelation': ['slow-zoom', 'reveal-shot', 'lighting-change'],
            'conflict': ['cross-cutting', 'tension-hold', 'shadow-play']
        };
        
        const categoryCues = cues[category] || ['standard-shot'];
        return categoryCues[Math.floor(timePoint * categoryCues.length)];
    }

    /**
     * Create powerful, meaningful segments with deep content analysis
     */
    createBasicSegments(transcript) {
        console.log('🔄 Creating powerful documentary segments...');
        
        const processedTranscript = this.processTranscriptData(transcript);
        const segments = [];
        
        // Analyze the full content first for powerful insights
        const fullText = processedTranscript.map(e => e.text).join(' ');
        const powerfulMoments = this.identifyPowerfulMoments(fullText, processedTranscript);
        
        // Create segments based on powerful moments
        powerfulMoments.forEach((moment, index) => {
            const relatedEntries = processedTranscript.filter(entry => 
                entry.start >= moment.startTime && entry.end <= moment.endTime
            );
            
            if (relatedEntries.length === 0) return;
            
            const content = relatedEntries.map(entry => entry.text).join(' ');
            const speakers = [...new Set(relatedEntries.map(e => e.speaker))];
            
            segments.push({
                id: `powerful_${index + 1}`,
                title: moment.title,
                description: moment.description,
                startTime: moment.startTime,
                endTime: moment.endTime,
                displayStart: this.msToTimeDisplay(moment.startTime),
                displayEnd: this.msToTimeDisplay(moment.endTime),
                category: moment.category,
                intensity: moment.intensity,
                speakers: speakers,
                keyQuotes: moment.keyQuotes,
                actualContent: content,
                transcriptEntries: relatedEntries.length,
                duration: Math.round((moment.endTime - moment.startTime) / 1000),
                wordCount: content.split(' ').length,
                documentaryValue: moment.documentaryValue,
                cutTiming: this.calculateOptimalCutTiming({ 
                    start_ms: moment.startTime, 
                    end_ms: moment.endTime 
                }, processedTranscript),
                textOverlays: this.generateTextOverlays({ 
                    title: moment.title,
                    start_ms: moment.startTime,
                    end_ms: moment.endTime,
                    key_quotes: moment.keyQuotes,
                    speakers: speakers
                })
            });
        });
        
        // If no powerful moments found, create smart default segments
        if (segments.length === 0) {
            return this.createSmartDefaultSegments(processedTranscript);
        }
        
        console.log('✅ Created', segments.length, 'powerful documentary segments');
        return segments;
    }

    /**
     * Identify powerful, meaningful moments in the transcript
     */
    identifyPowerfulMoments(fullText, transcript) {
        const moments = [];
        const textLower = fullText.toLowerCase();
        
        // Look for powerful storytelling patterns
        const powerPatterns = [
            {
                patterns: ['never told anyone', 'first time', 'secret', 'confession'],
                category: 'revelation',
                intensity: 9,
                titlePrefix: 'The Untold Truth',
                description: 'A powerful revelation that changes everything we thought we knew.'
            },
            {
                patterns: ['turning point', 'changed everything', 'moment I realized', 'suddenly understood'],
                category: 'key_moment',
                intensity: 8,
                titlePrefix: 'The Turning Point',
                description: 'The critical moment that transformed the entire situation.'
            },
            {
                patterns: ['struggled with', 'difficult', 'challenge', 'hardest part'],
                category: 'conflict',
                intensity: 7,
                titlePrefix: 'Facing the Challenge',
                description: 'The human struggle that reveals true character and determination.'
            },
            {
                patterns: ['learned that', 'discovered', 'found out', 'investigation revealed'],
                category: 'insight',
                intensity: 6,
                titlePrefix: 'The Discovery',
                description: 'New insights that illuminate the deeper truth of the story.'
            },
            {
                patterns: ['felt', 'emotional', 'heartbreaking', 'overwhelming'],
                category: 'emotional',
                intensity: 8,
                titlePrefix: 'The Human Cost',
                description: 'A deeply personal moment that shows the emotional reality.'
            }
        ];

        // Find moments for each pattern
        powerPatterns.forEach(pattern => {
            pattern.patterns.forEach(phrase => {
                const phraseIndex = textLower.indexOf(phrase);
                if (phraseIndex !== -1) {
                    // Find the transcript entry containing this phrase
                    let wordCount = 0;
                    let targetEntry = null;
                    
                    for (const entry of transcript) {
                        const entryWordCount = entry.text.split(' ').length;
                        if (wordCount <= phraseIndex && phraseIndex < wordCount + entryWordCount) {
                            targetEntry = entry;
                            break;
                        }
                        wordCount += entryWordCount;
                    }
                    
                    if (targetEntry) {
                        const startTime = Math.max(0, targetEntry.start - 2000); // 2s before
                        const endTime = targetEntry.end + 10000; // 10s after for context
                        
                        // Extract meaningful quote around the phrase
                        const contextText = this.extractContextAroundPhrase(fullText, phraseIndex, 100);
                        const quote = this.extractPowerfulQuote(contextText);
                        
                        moments.push({
                            startTime: startTime,
                            endTime: Math.min(endTime, transcript[transcript.length - 1]?.end || endTime),
                            title: `${pattern.titlePrefix}: "${quote.substring(0, 30)}..."`,
                            description: pattern.description,
                            category: pattern.category,
                            intensity: pattern.intensity,
                            keyQuotes: [quote],
                            documentaryValue: `Captures ${pattern.category} moment with authentic emotional impact`,
                            phrase: phrase,
                            context: contextText
                        });
                    }
                }
            });
        });

        // Remove duplicates and sort by power/intensity
        const uniqueMoments = this.removeDuplicateMoments(moments);
        return uniqueMoments.sort((a, b) => b.intensity - a.intensity).slice(0, 8); // Top 8 most powerful
    }

    /**
     * Extract context around a powerful phrase
     */
    extractContextAroundPhrase(text, phraseIndex, contextLength) {
        const start = Math.max(0, phraseIndex - contextLength);
        const end = Math.min(text.length, phraseIndex + contextLength);
        return text.substring(start, end).trim();
    }

    /**
     * Extract a powerful quote from context
     */
    extractPowerfulQuote(contextText) {
        // Find the most complete sentence
        const sentences = contextText.split(/[.!?]/).filter(s => s.trim().length > 10);
        if (sentences.length > 0) {
            // Return the longest, most meaningful sentence
            return sentences.reduce((longest, current) => 
                current.length > longest.length ? current : longest
            ).trim() + '.';
        }
        return contextText.substring(0, 80) + '...';
    }

    /**
     * Remove duplicate or overlapping moments
     */
    removeDuplicateMoments(moments) {
        const unique = [];
        const timeThreshold = 10000; // 10 seconds
        
        moments.forEach(moment => {
            const hasOverlap = unique.some(existing => 
                Math.abs(moment.startTime - existing.startTime) < timeThreshold ||
                (moment.startTime < existing.endTime && moment.endTime > existing.startTime)
            );
            
            if (!hasOverlap) {
                unique.push(moment);
            }
        });
        
        return unique;
    }

    /**
     * Create smart default segments when no powerful moments found
     */
    createSmartDefaultSegments(transcript) {
        console.log('📝 Creating smart default segments...');
        
        const segments = [];
        const totalDuration = transcript[transcript.length - 1]?.end || 60000;
        const segmentCount = Math.min(6, Math.max(3, Math.floor(transcript.length / 4)));
        const segmentDuration = totalDuration / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            const startTime = i * segmentDuration;
            const endTime = Math.min((i + 1) * segmentDuration, totalDuration);
            
            const segmentEntries = transcript.filter(entry => 
                entry.start >= startTime && entry.end <= endTime
            );
            
            if (segmentEntries.length === 0) continue;
            
            const content = segmentEntries.map(e => e.text).join(' ');
            const firstSentence = content.split(/[.!?]/)[0] + '.';
            
            segments.push({
                id: `smart_${i + 1}`,
                title: `Key Discussion ${i + 1}`,
                description: `Important dialogue revealing crucial information and context.`,
                startTime: startTime,
                endTime: endTime,
                displayStart: this.msToTimeDisplay(startTime),
                displayEnd: this.msToTimeDisplay(endTime),
                category: i === 0 ? 'context' : i === segmentCount - 1 ? 'insight' : 'key_moment',
                intensity: 6 + (i % 3), // Vary intensity
                speakers: [...new Set(segmentEntries.map(e => e.speaker))],
                keyQuotes: [firstSentence],
                actualContent: content,
                transcriptEntries: segmentEntries.length,
                duration: Math.round((endTime - startTime) / 1000),
                wordCount: content.split(' ').length,
                documentaryValue: 'Essential narrative content with authentic dialogue'
            });
        }
        
        return segments;
    }

    /**
     * Parse time values to milliseconds
     */
    parseTime(timeValue) {
        if (typeof timeValue === 'number') {
            return timeValue;
        }
        if (typeof timeValue === 'string') {
            // Handle various time formats
            if (timeValue.includes(':')) {
                return this.srtTimeToMs(timeValue);
            }
            return parseInt(timeValue) || 0;
        }
        return 0;
    }

    /**
     * Convert milliseconds to display format (MM:SS)
     */
    msToTimeDisplay(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranscriptAnalyzer;
} else {
    window.TranscriptAnalyzer = TranscriptAnalyzer;
}
