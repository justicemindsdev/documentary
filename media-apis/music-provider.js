/**
 * Music Provider - Documentary Scoring System
 * Intelligent music matching for emotional documentary content
 */

class MusicProvider {
    constructor() {
        this.providers = {
            epidemicSound: new EpidemicSoundAPI(),
            artlist: new ArtlistAPI(),
            audiostock: new AudiostockAPI(),
            youtube: new YouTubeAudioAPI(),
            mubert: new MubertAPI() // AI-generated music
        };
        
        this.musicCache = new Map();
        this.compositionEngine = new DocumentaryComposer();
        this.audioProcessor = new AudioProcessor();
    }

    /**
     * Generate comprehensive music scoring for documentary
     */
    async createDocumentaryScore(emotionalAnalysis, themes, pace) {
        console.log('🎵 Creating documentary music score...');
        
        try {
            // 1. Analyze musical requirements
            const musicRequirements = this.analyzeMusicRequirements(emotionalAnalysis, themes, pace);
            
            // 2. Search for appropriate tracks
            const musicTracks = await this.searchDocumentaryMusic(musicRequirements);
            
            // 3. Create dynamic composition
            const composition = await this.compositionEngine.createDynamicScore(musicTracks, emotionalAnalysis);
            
            // 4. Generate transitions and stems
            const processedScore = await this.audioProcessor.processForDocumentary(composition);
            
            return {
                primary_score: processedScore.primary,
                ambient_beds: processedScore.ambient,
                emotional_stings: processedScore.stings,
                transitions: processedScore.transitions,
                metadata: {
                    total_duration: processedScore.totalDuration,
                    mood_progression: processedScore.moodProgression,
                    sync_points: processedScore.syncPoints
                }
            };
            
        } catch (error) {
            console.error('Music scoring error:', error);
            return this.generateFallbackScore(emotionalAnalysis);
        }
    }

    /**
     * Analyze what type of music is needed based on content
     */
    analyzeMusicRequirements(emotionalAnalysis, themes, pace) {
        const requirements = {
            primary_mood: 'contemplative',
            secondary_moods: [],
            energy_level: 'medium',
            instrumentation: [],
            genre_preferences: ['documentary', 'cinematic', 'ambient'],
            emotional_progression: [],
            sync_requirements: []
        };

        // Analyze themes for musical direction
        if (themes.includes('legal-system') || themes.includes('justice')) {
            requirements.instrumentation.push('piano', 'strings', 'subtle-percussion');
            requirements.genre_preferences.unshift('legal-drama', 'serious-documentary');
            requirements.primary_mood = 'serious-contemplative';
        }

        if (themes.includes('personal-journey') || themes.includes('transformation')) {
            requirements.instrumentation.push('acoustic-guitar', 'cello', 'soft-piano');
            requirements.secondary_moods.push('hopeful', 'inspiring');
            requirements.genre_preferences.unshift('human-story', 'emotional-journey');
        }

        if (themes.includes('emotional') || themes.includes('inspiring')) {
            requirements.instrumentation.push('strings', 'piano', 'warm-pads');
            requirements.secondary_moods.push('uplifting', 'emotional-climax');
        }

        // Analyze emotional progression
        requirements.emotional_progression = emotionalAnalysis.emotions.map(emotion => ({
            time: emotion.startTime,
            mood: this.mapEmotionToMusicMood(emotion.emotion),
            intensity: emotion.intensity,
            duration: emotion.endTime - emotion.startTime
        }));

        // Set energy level based on pace
        requirements.energy_level = {
            'fast': 'high',
            'medium': 'medium',
            'slow': 'low'
        }[pace] || 'medium';

        return requirements;
    }

    /**
     * Map emotional states to musical moods
     */
    mapEmotionToMusicMood(emotion) {
        const mapping = {
            'neutral': 'contemplative',
            'revelation': 'dramatic-discovery',
            'challenging': 'tense-reflective',
            'hopeful': 'uplifting-inspiring',
            'significant': 'important-building'
        };
        
        return mapping[emotion] || 'contemplative';
    }

    /**
     * Search for documentary music across providers
     */
    async searchDocumentaryMusic(requirements) {
        const musicTracks = {
            primary_themes: [],
            ambient_beds: [],
            emotional_stings: [],
            transition_elements: []
        };

        // Search for primary theme music
        try {
            const primaryResults = await this.providers.epidemicSound.search({
                mood: requirements.primary_mood,
                genre: 'documentary',
                instrumentation: requirements.instrumentation,
                energy: requirements.energy_level,
                duration: 'medium-long'
            });
            musicTracks.primary_themes = primaryResults;
        } catch (error) {
            console.warn('Primary music search failed:', error);
        }

        // Search for ambient beds
        try {
            const ambientResults = await this.providers.artlist.search({
                type: 'ambient-bed',
                mood: 'subtle-emotional',
                instrumentation: ['soft-piano', 'strings', 'ambient-pads'],
                energy: 'low'
            });
            musicTracks.ambient_beds = ambientResults;
        } catch (error) {
            console.warn('Ambient music search failed:', error);
        }

        // Search for emotional stings
        try {
            const stingResults = await this.providers.audiostock.search({
                type: 'sting',
                duration: 'short',
                moods: requirements.secondary_moods,
                instrumentation: ['orchestra', 'piano', 'strings']
            });
            musicTracks.emotional_stings = stingResults;
        } catch (error) {
            console.warn('Sting music search failed:', error);
        }

        // Generate AI music for custom transitions
        try {
            const aiMusic = await this.providers.mubert.generateCustom({
                style: 'documentary-transitions',
                mood: requirements.primary_mood,
                duration: 30, // seconds
                instrumentation: requirements.instrumentation
            });
            musicTracks.transition_elements = aiMusic;
        } catch (error) {
            console.warn('AI music generation failed:', error);
        }

        // Add fallback tracks
        musicTracks.primary_themes.push(...this.generateFallbackTracks('primary', requirements));
        musicTracks.ambient_beds.push(...this.generateFallbackTracks('ambient', requirements));
        musicTracks.emotional_stings.push(...this.generateFallbackTracks('stings', requirements));

        return musicTracks;
    }

    /**
     * Generate fallback music tracks for demo
     */
    generateFallbackTracks(type, requirements) {
        const tracks = [];
        
        if (type === 'primary') {
            tracks.push({
                id: `primary_${Date.now()}`,
                title: 'Documentary Main Theme',
                artist: 'BBC Composer Collection',
                duration: 180, // 3 minutes
                url: '/bbc_documentary_system/media/music/primary_theme.mp3',
                mood: requirements.primary_mood,
                energy: requirements.energy_level,
                instrumentation: requirements.instrumentation,
                stems: {
                    full_mix: '/media/music/primary_theme_full.mp3',
                    no_drums: '/media/music/primary_theme_no_drums.mp3',
                    minimal: '/media/music/primary_theme_minimal.mp3'
                },
                license: 'royalty_free',
                provider: 'bbc_collection'
            });
        }
        
        if (type === 'ambient') {
            tracks.push({
                id: `ambient_${Date.now()}`,
                title: 'Contemplative Underscore',
                artist: 'Documentary Soundscapes',
                duration: 240, // 4 minutes (loopable)
                url: '/bbc_documentary_system/media/music/ambient_bed.mp3',
                mood: 'contemplative',
                energy: 'low',
                instrumentation: ['soft-piano', 'strings', 'ambient-pads'],
                loop_points: { start: 0, end: 240 },
                license: 'creative_commons',
                provider: 'artlist_collection'
            });
        }
        
        if (type === 'stings') {
            tracks.push({
                id: `sting_revelation_${Date.now()}`,
                title: 'Dramatic Revelation',
                artist: 'Emotional Impact Library',
                duration: 8, // 8 seconds
                url: '/bbc_documentary_system/media/music/revelation_sting.mp3',
                mood: 'dramatic-discovery',
                energy: 'high',
                instrumentation: ['orchestra', 'piano'],
                trigger_emotion: 'revelation',
                license: 'epidemic_sound',
                provider: 'emotional_library'
            }, {
                id: `sting_hopeful_${Date.now()}`,
                title: 'Rising Hope',
                artist: 'Inspiring Moments',
                duration: 12,
                url: '/bbc_documentary_system/media/music/hopeful_rise.mp3',
                mood: 'uplifting-inspiring',
                energy: 'medium-high',
                instrumentation: ['strings', 'piano', 'soft-percussion'],
                trigger_emotion: 'hopeful',
                license: 'artlist',
                provider: 'inspiring_collection'
            });
        }
        
        return tracks;
    }

    /**
     * Generate fallback score when full system fails
     */
    generateFallbackScore(emotionalAnalysis) {
        return {
            primary_score: {
                track: this.generateFallbackTracks('primary', { primary_mood: 'contemplative' })[0],
                timeline: [
                    { time: 0, volume: 0.3, fade: 'in' },
                    { time: 60000, volume: 0.2, fade: 'maintain' },
                    { time: 120000, volume: 0.4, fade: 'build' }
                ]
            },
            ambient_beds: {
                track: this.generateFallbackTracks('ambient', {})[0],
                timeline: [
                    { time: 0, volume: 0.1, fade: 'in' },
                    { time: 180000, volume: 0.1, fade: 'out' }
                ]
            },
            emotional_stings: this.generateFallbackTracks('stings', {}),
            transitions: {
                crossfade_duration: 2000,
                silence_gaps: 500
            }
        };
    }
}

/**
 * Documentary Composition Engine
 * Creates dynamic music compositions that sync with emotional beats
 */
class DocumentaryComposer {
    constructor() {
        this.timeline = [];
        this.syncPoints = [];
        this.moodProgression = [];
    }

    async createDynamicScore(musicTracks, emotionalAnalysis) {
        console.log('🎼 Composing dynamic documentary score...');
        
        const composition = {
            primary: null,
            ambient: null,
            stings: [],
            transitions: [],
            totalDuration: 0,
            moodProgression: [],
            syncPoints: []
        };

        // Select primary theme
        composition.primary = this.selectPrimaryTheme(musicTracks.primary_themes, emotionalAnalysis);
        
        // Create ambient bed
        composition.ambient = this.createAmbientBed(musicTracks.ambient_beds, emotionalAnalysis);
        
        // Place emotional stings
        composition.stings = this.placeEmotionalStings(musicTracks.emotional_stings, emotionalAnalysis);
        
        // Create smooth transitions
        composition.transitions = this.createTransitions(musicTracks.transition_elements, emotionalAnalysis);
        
        // Calculate total duration
        composition.totalDuration = Math.max(
            ...emotionalAnalysis.emotions.map(e => e.endTime)
        );
        
        // Map mood progression
        composition.moodProgression = this.mapMoodProgression(emotionalAnalysis);
        
        // Create sync points for precise timing
        composition.syncPoints = this.createSyncPoints(emotionalAnalysis);
        
        return composition;
    }

    selectPrimaryTheme(themes, emotionalAnalysis) {
        if (!themes.length) return null;
        
        // Select based on overall emotional tone
        const overallIntensity = emotionalAnalysis.emotions.reduce((sum, e) => sum + e.intensity, 0) / emotionalAnalysis.emotions.length;
        
        return {
            track: themes[0], // For demo, select first
            timeline: this.createPrimaryTimeline(themes[0], emotionalAnalysis),
            volume_automation: this.createVolumeAutomation(emotionalAnalysis)
        };
    }

    createPrimaryTimeline(track, emotionalAnalysis) {
        const timeline = [];
        
        // Fade in at start
        timeline.push({
            time: 0,
            action: 'fade_in',
            duration: 3000,
            target_volume: 0.3
        });
        
        // Volume changes based on emotional intensity
        emotionalAnalysis.emotions.forEach(emotion => {
            const volume = this.mapIntensityToVolume(emotion.intensity);
            timeline.push({
                time: emotion.startTime,
                action: 'volume_change',
                duration: 2000,
                target_volume: volume
            });
        });
        
        // Fade out at end
        const lastEmotion = emotionalAnalysis.emotions[emotionalAnalysis.emotions.length - 1];
        timeline.push({
            time: lastEmotion.endTime - 5000,
            action: 'fade_out',
            duration: 5000,
            target_volume: 0
        });
        
        return timeline;
    }

    createAmbientBed(ambientTracks, emotionalAnalysis) {
        if (!ambientTracks.length) return null;
        
        return {
            track: ambientTracks[0],
            timeline: [
                { time: 0, action: 'fade_in', duration: 5000, target_volume: 0.1 },
                { time: emotionalAnalysis.emotions[emotionalAnalysis.emotions.length - 1].endTime - 3000, action: 'fade_out', duration: 3000, target_volume: 0 }
            ],
            loop: true
        };
    }

    placeEmotionalStings(stings, emotionalAnalysis) {
        const placedStings = [];
        
        // Find high-intensity moments for stings
        const highIntensityMoments = emotionalAnalysis.emotions.filter(e => e.intensity >= 8);
        
        highIntensityMoments.forEach(moment => {
            const appropriateSting = stings.find(s => s.trigger_emotion === moment.emotion);
            if (appropriateSting) {
                placedStings.push({
                    track: appropriateSting,
                    placement: {
                        time: moment.startTime + 1000, // Slight delay for impact
                        volume: 0.6,
                        fade_in: 500,
                        fade_out: 1000
                    }
                });
            }
        });
        
        return placedStings;
    }

    createTransitions(transitionElements, emotionalAnalysis) {
        const transitions = [];
        
        // Create transitions between major emotional shifts
        for (let i = 0; i < emotionalAnalysis.emotions.length - 1; i++) {
            const current = emotionalAnalysis.emotions[i];
            const next = emotionalAnalysis.emotions[i + 1];
            
            if (Math.abs(current.intensity - next.intensity) > 3) {
                transitions.push({
                    time: next.startTime - 1000,
                    duration: 2000,
                    type: next.intensity > current.intensity ? 'build' : 'release',
                    element: transitionElements[0] || null
                });
            }
        }
        
        return transitions;
    }

    mapIntensityToVolume(intensity) {
        // Map 1-10 intensity to 0.1-0.5 volume for background music
        return 0.1 + (intensity / 10) * 0.4;
    }

    mapMoodProgression(emotionalAnalysis) {
        return emotionalAnalysis.emotions.map(emotion => ({
            time: emotion.startTime,
            mood: emotion.emotion,
            intensity: emotion.intensity,
            musical_direction: this.getMusicDirection(emotion.emotion, emotion.intensity)
        }));
    }

    getMusicDirection(emotion, intensity) {
        const directions = {
            'neutral': 'maintain',
            'revelation': 'dramatic_build',
            'challenging': 'tense_sustain',
            'hopeful': 'uplifting_rise',
            'significant': 'important_emphasis'
        };
        
        return directions[emotion] || 'maintain';
    }

    createSyncPoints(emotionalAnalysis) {
        return emotionalAnalysis.emotions
            .filter(e => e.intensity >= 7)
            .map(e => ({
                time: e.startTime,
                type: 'emotional_peak',
                emotion: e.emotion,
                intensity: e.intensity,
                sync_required: true
            }));
    }
}

/**
 * Audio Processing for Documentary Integration
 */
class AudioProcessor {
    constructor() {
        this.outputFormat = {
            sampleRate: 48000,
            bitDepth: 24,
            channels: 2
        };
    }

    async processForDocumentary(composition) {
        console.log('🎛️ Processing audio for documentary integration...');
        
        // In production, this would use Web Audio API or similar
        return {
            primary: this.processTrack(composition.primary, 'primary'),
            ambient: this.processTrack(composition.ambient, 'ambient'),
            stings: composition.stings.map(s => this.processTrack(s, 'sting')),
            transitions: composition.transitions.map(t => this.processTransition(t)),
            totalDuration: composition.totalDuration,
            moodProgression: composition.moodProgression,
            syncPoints: composition.syncPoints
        };
    }

    processTrack(trackComposition, type) {
        if (!trackComposition) return null;
        
        const processed = {
            ...trackComposition,
            processed: true,
            audio_settings: {
                eq: this.getEQSettings(type),
                compression: this.getCompressionSettings(type),
                reverb: this.getReverbSettings(type)
            },
            ducking: type === 'primary' ? this.createDuckingAutomation() : null
        };
        
        return processed;
    }

    getEQSettings(type) {
        const settings = {
            'primary': { lowCut: 80, highCut: 18000, midBoost: 0 },
            'ambient': { lowCut: 100, highCut: 15000, midBoost: -2 },
            'sting': { lowCut: 60, highCut: 20000, midBoost: 2 }
        };
        
        return settings[type] || settings.primary;
    }

    getCompressionSettings(type) {
        const settings = {
            'primary': { threshold: -12, ratio: 3, attack: 10, release: 100 },
            'ambient': { threshold: -18, ratio: 2, attack: 50, release: 200 },
            'sting': { threshold: -6, ratio: 4, attack: 5, release: 50 }
        };
        
        return settings[type] || settings.primary;
    }

    getReverbSettings(type) {
        const settings = {
            'primary': { roomSize: 0.3, damping: 0.5, wet: 0.2 },
            'ambient': { roomSize: 0.6, damping: 0.3, wet: 0.4 },
            'sting': { roomSize: 0.4, damping: 0.6, wet: 0.3 }
        };
        
        return settings[type] || settings.primary;
    }

    createDuckingAutomation() {
        // Duck music under dialogue
        return {
            enabled: true,
            threshold: -40, // dB
            reduction: -6, // dB
            attack: 50, // ms
            release: 300 // ms
        };
    }

    processTransition(transition) {
        return {
            ...transition,
            processed: true,
            audio_curve: this.createTransitionCurve(transition.type),
            crossfade_settings: {
                duration: transition.duration,
                curve: 'logarithmic'
            }
        };
    }

    createTransitionCurve(type) {
        const curves = {
            'build': 'exponential_rise',
            'release': 'logarithmic_fall',
            'crossfade': 'equal_power'
        };
        
        return curves[type] || 'linear';
    }
}

/**
 * Individual Music API Provider Classes
 */

class EpidemicSoundAPI {
    constructor() {
        this.apiKey = 'YOUR_EPIDEMIC_SOUND_KEY';
        this.baseUrl = 'https://api.epidemicsound.com';
    }

    async search(params) {
        // Mock Epidemic Sound response
        return [{
            id: `epidemic_${Date.now()}`,
            title: `${params.mood} Documentary Theme`,
            artist: 'Epidemic Sound',
            duration: 180,
            url: '/media/music/epidemic_documentary.mp3',
            mood: params.mood,
            genre: params.genre,
            stems_available: true
        }];
    }
}

class ArtlistAPI {
    constructor() {
        this.apiKey = 'YOUR_ARTLIST_KEY';
        this.baseUrl = 'https://api.artlist.io';
    }

    async search(params) {
        return [{
            id: `artlist_${Date.now()}`,
            title: 'Cinematic Underscore',
            artist: 'Artlist.io',
            duration: 240,
            url: '/media/music/artlist_ambient.mp3',
            type: params.type,
            mood: params.mood
        }];
    }
}

class AudiostockAPI {
    constructor() {
        this.apiKey = 'YOUR_AUDIOSTOCK_KEY';
        this.baseUrl = 'https://api.audiostock.jp';
    }

    async search(params) {
        return [{
            id: `audiostock_${Date.now()}`,
            title: 'Emotional Sting',
            artist: 'Audiostock',
            duration: 8,
            url: '/media/music/audiostock_sting.mp3',
            type: params.type
        }];
    }
}

class YouTubeAudioAPI {
    constructor() {
        this.apiKey = 'YOUR_YOUTUBE_API_KEY';
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    }

    async search(params) {
        return [{
            id: `youtube_${Date.now()}`,
            title: 'Free Documentary Music',
            artist: 'YouTube Audio Library',
            duration: 120,
            url: '/media/music/youtube_free.mp3',
            license: 'creative_commons'
        }];
    }
}

class MubertAPI {
    constructor() {
        this.apiKey = 'YOUR_MUBERT_KEY';
        this.baseUrl = 'https://api.mubert.com';
    }

    async generateCustom(params) {
        return [{
            id: `mubert_${Date.now()}`,
            title: 'AI Generated Transition',
            artist: 'Mubert AI',
            duration: params.duration,
            url: '/media/music/mubert_transition.mp3',
            style: params.style,
            generated: true
        }];
    }
}

// Export for use in main system
window.MusicProvider = MusicProvider;
