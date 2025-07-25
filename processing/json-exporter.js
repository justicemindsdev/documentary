/**
 * JSON Export System for Algorithmic Video Processing
 * Exports comprehensive cutting instructions for external video processors
 */

class DocumentaryJSONExporter {
    constructor() {
        this.exportVersion = '2.0';
        this.timestamp = new Date().toISOString();
    }

    /**
     * Export complete documentary data as JSON for algorithmic video cutting
     */
    exportDocumentaryJSON(segments, videoMetadata = {}) {
        console.log('🎬 Exporting documentary JSON for algorithmic processing...');
        
        const documentaryData = {
            metadata: this.generateMetadata(videoMetadata, segments),
            video_processing: this.generateVideoProcessingInstructions(segments),
            segments: this.exportSegments(segments),
            text_overlays: this.exportTextOverlays(segments),
            transitions: this.exportTransitionData(segments),
            audio_processing: this.generateAudioProcessingInstructions(segments),
            export_info: {
                version: this.exportVersion,
                export_timestamp: this.timestamp,
                total_segments: segments.length,
                processing_type: 'bbc_documentary_algorithmic'
            }
        };

        return documentaryData;
    }

    /**
     * Generate comprehensive metadata
     */
    generateMetadata(videoMetadata, segments) {
        const totalDuration = segments.length > 0 
            ? Math.max(...segments.map(s => s.endTime)) 
            : 0;
        
        const categories = [...new Set(segments.map(s => s.category))];
        const speakers = [...new Set(segments.flatMap(s => s.speakers || []))];
        
        return {
            project: {
                title: videoMetadata.title || 'BBC Documentary Project',
                description: 'Algorithmically processed documentary with precise cuts',
                genre: 'documentary',
                style: 'bbc_professional'
            },
            technical: {
                total_duration_ms: totalDuration,
                segment_count: segments.length,
                categories: categories,
                speakers: speakers,
                video_format: videoMetadata.format || 'mp4',
                frame_rate: videoMetadata.frameRate || 25,
                resolution: videoMetadata.resolution || '1920x1080'
            },
            analytics: {
                avg_segment_duration: segments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / segments.length,
                high_intensity_segments: segments.filter(s => s.intensity > 7).length,
                emotional_segments: segments.filter(s => s.category === 'emotional').length,
                dramatic_segments: segments.filter(s => s.category === 'dramatic').length
            }
        };
    }

    /**
     * Generate video processing instructions for algorithmic cutting
     */
    generateVideoProcessingInstructions(segments) {
        return {
            cutting_algorithm: 'bbc_documentary_precision',
            processing_rules: {
                respect_speech_pauses: true,
                avoid_mid_word_cuts: true,
                maintain_speaker_continuity: true,
                apply_natural_transitions: true,
                preserve_emotional_timing: true
            },
            global_settings: {
                default_fade_in: 500,
                default_fade_out: 300,
                cross_fade_duration: 250,
                silence_threshold: 200,
                minimum_segment_duration: 2000,
                maximum_segment_duration: 180000
            },
            quality_requirements: {
                cut_precision: 'frame_perfect',
                audio_sync: 'mandatory',
                overlay_sync: 'precise',
                transition_smoothness: 'professional'
            }
        };
    }

    /**
     * Export segment data with algorithmic cutting instructions
     */
    exportSegments(segments) {
        return segments.map((segment, index) => ({
            segment_id: segment.id || `seg_${index + 1}`,
            title: segment.title,
            description: segment.description,
            
            // Precise timing data
            timing: {
                start_ms: segment.startTime,
                end_ms: segment.endTime,
                duration_ms: segment.endTime - segment.startTime,
                display_start: segment.displayStart,
                display_end: segment.displayEnd
            },
            
            // Content analysis
            content: {
                category: segment.category,
                intensity: segment.intensity,
                speakers: segment.speakers || [],
                key_quotes: segment.keyQuotes || [],
                word_count: segment.wordCount || 0,
                transcript_entries: segment.transcriptEntries || 0
            },
            
            // Algorithmic cutting data
            cutting_instructions: {
                pre_roll: segment.cutTiming?.preRoll || 500,
                post_roll: segment.cutTiming?.postRoll || 300,
                optimal_cut_frame: segment.cutTiming?.optimalCutFrame || segment.startTime,
                breath_pauses: segment.cutTiming?.breathPauses || [],
                sentence_boundaries: segment.cutTiming?.sentenceBoundaries || [],
                speaker_changes: segment.cutTiming?.speakerChanges || []
            },
            
            // Video editing instructions
            video_editing: segment.videoEditing ? {
                fade_in_duration: segment.videoEditing.fadeInDuration,
                fade_out_duration: segment.videoEditing.fadeOutDuration,
                natural_cut_points: segment.videoEditing.naturalCutPoints || [],
                speech_pauses: segment.videoEditing.speechPauses || [],
                emotional_beats: segment.videoEditing.emotionalBeats || [],
                cinematic_transitions: segment.videoEditing.cinematicTransitions || {}
            } : null,
            
            // Processing priority
            processing_priority: this.calculateProcessingPriority(segment)
        }));
    }

    /**
     * Export text overlay instructions
     */
    exportTextOverlays(segments) {
        const allOverlays = [];
        
        segments.forEach((segment, segmentIndex) => {
            if (segment.textOverlays && segment.textOverlays.length > 0) {
                segment.textOverlays.forEach((overlay, overlayIndex) => {
                    allOverlays.push({
                        overlay_id: `overlay_${segmentIndex}_${overlayIndex}`,
                        segment_id: segment.id || `seg_${segmentIndex + 1}`,
                        
                        // Timing
                        start_time_ms: overlay.startTime,
                        duration_ms: overlay.duration,
                        end_time_ms: overlay.startTime + overlay.duration,
                        
                        // Content
                        text: overlay.text,
                        type: overlay.type,
                        
                        // Styling
                        style: {
                            font_family: this.getFontFamily(overlay.style),
                            font_size: overlay.fontSize,
                            color: overlay.color,
                            background_color: overlay.backgroundColor,
                            position: overlay.position
                        },
                        
                        // Animation
                        animation: {
                            type: overlay.animation,
                            typewriter_speed: overlay.typewriterSpeed || 50,
                            fade_duration: 500,
                            timing_curve: 'ease-in-out'
                        },
                        
                        // Processing instructions
                        rendering: {
                            z_index: 10,
                            alpha_blend: true,
                            anti_alias: true,
                            render_quality: 'high'
                        }
                    });
                });
            }
        });
        
        return {
            total_overlays: allOverlays.length,
            overlay_data: allOverlays,
            global_overlay_settings: {
                default_font: 'Georgia, serif',
                text_shadow: '2px 2px 4px rgba(0,0,0,0.8)',
                backdrop_filter: 'blur(2px)',
                responsive_scaling: true
            }
        };
    }

    /**
     * Export transition data between segments
     */
    exportTransitionData(segments) {
        const transitions = [];
        
        for (let i = 0; i < segments.length - 1; i++) {
            const currentSegment = segments[i];
            const nextSegment = segments[i + 1];
            
            const transition = {
                transition_id: `trans_${i}_${i + 1}`,
                from_segment: currentSegment.id || `seg_${i + 1}`,
                to_segment: nextSegment.id || `seg_${i + 2}`,
                
                // Timing
                start_time_ms: currentSegment.endTime - 500, // Start 500ms before segment ends
                duration_ms: 1000, // 1s transition
                end_time_ms: nextSegment.startTime + 500,
                
                // Transition type based on content
                type: this.determineTransitionType(currentSegment, nextSegment),
                
                // Visual effects
                effects: {
                    fade_type: this.determineFadeType(currentSegment, nextSegment),
                    zoom_effect: this.shouldApplyZoom(currentSegment, nextSegment),
                    color_grading: this.determineColorGrading(nextSegment),
                    motion_blur: currentSegment.intensity > 7
                },
                
                // Audio processing
                audio: {
                    cross_fade_duration: 250,
                    volume_curve: 'smooth',
                    apply_ducking: nextSegment.category === 'dramatic'
                }
            };
            
            transitions.push(transition);
        }
        
        return {
            total_transitions: transitions.length,
            transition_data: transitions,
            global_transition_settings: {
                default_duration: 750,
                blend_mode: 'normal',
                motion_blur_amount: 2,
                color_space: 'rec709'
            }
        };
    }

    /**
     * Generate audio processing instructions
     */
    generateAudioProcessingInstructions(segments) {
        return {
            global_audio: {
                normalize_levels: true,
                noise_reduction: 'light',
                dynamic_range_compression: 'documentary_standard',
                eq_preset: 'speech_clarity',
                limiter_threshold: -3
            },
            segment_audio: segments.map((segment, index) => ({
                segment_id: segment.id || `seg_${index + 1}`,
                processing: {
                    gain_adjustment: this.calculateGainAdjustment(segment),
                    high_pass_filter: segment.category === 'emotional' ? 80 : 100,
                    presence_boost: segment.intensity > 7 ? 2 : 1,
                    de_essing: segment.speakers && segment.speakers.length > 0,
                    noise_gate_threshold: -60
                }
            })),
            music_scoring: {
                apply_background_music: true,
                duck_for_speech: true,
                emotional_stings: segments
                    .filter(s => s.intensity > 8)
                    .map(s => ({
                        timestamp: s.startTime + ((s.endTime - s.startTime) * 0.6),
                        intensity: s.intensity,
                        category: s.category
                    }))
            }
        };
    }

    /**
     * Calculate processing priority for segments
     */
    calculateProcessingPriority(segment) {
        let priority = 5; // Default medium priority
        
        if (segment.intensity > 8) priority += 2;
        if (segment.category === 'dramatic') priority += 1;
        if (segment.category === 'emotional') priority += 1;
        if (segment.speakers && segment.speakers.length > 1) priority += 1;
        
        return Math.min(10, priority);
    }

    /**
     * Get font family for overlay style
     */
    getFontFamily(style) {
        const fontMap = {
            'bbc-title': 'Georgia, Times New Roman, serif',
            'bbc-quote': 'Georgia, Times New Roman, serif',
            'bbc-speaker': 'Arial, sans-serif',
            'documentary-context': 'Arial, sans-serif'
        };
        return fontMap[style] || 'Arial, sans-serif';
    }

    /**
     * Determine transition type between segments
     */
    determineTransitionType(current, next) {
        if (current.intensity > 7 && next.intensity > 7) return 'quick_cut';
        if (current.category === 'emotional' || next.category === 'emotional') return 'soft_fade';
        if (current.speakers !== next.speakers) return 'cross_fade';
        return 'standard_cut';
    }

    /**
     * Determine fade type
     */
    determineFadeType(current, next) {
        if (next.category === 'dramatic') return 'fade_to_black';
        if (current.category === 'emotional') return 'soft_dissolve';
        return 'cross_dissolve';
    }

    /**
     * Should apply zoom effect
     */
    shouldApplyZoom(current, next) {
        return next.intensity > current.intensity && next.category === 'dramatic';
    }

    /**
     * Determine color grading
     */
    determineColorGrading(segment) {
        const grading = {
            'emotional': 'warm_tint',
            'dramatic': 'high_contrast',
            'revelation': 'bright_lift',
            'conflict': 'desaturated'
        };
        return grading[segment.category] || 'neutral';
    }

    /**
     * Calculate gain adjustment for audio
     */
    calculateGainAdjustment(segment) {
        if (segment.intensity > 8) return 1.2;
        if (segment.category === 'emotional') return 0.9;
        return 1.0;
    }

    /**
     * Export to downloadable JSON file
     */
    downloadJSON(segments, filename = 'documentary_processing_instructions') {
        const jsonData = this.exportDocumentaryJSON(segments);
        const jsonString = JSON.stringify(jsonData, null, 2);
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('📄 Documentary JSON exported successfully');
        return jsonData;
    }

    /**
     * Export summary statistics
     */
    exportSummary(segments) {
        const jsonData = this.exportDocumentaryJSON(segments);
        
        return {
            total_segments: segments.length,
            total_duration: Math.max(...segments.map(s => s.endTime)),
            total_overlays: jsonData.text_overlays.total_overlays,
            total_transitions: jsonData.transitions.total_transitions,
            processing_complexity: this.calculateProcessingComplexity(segments),
            estimated_render_time: this.estimateRenderTime(segments),
            file_size_estimate: this.estimateFileSize(jsonData)
        };
    }

    /**
     * Calculate processing complexity
     */
    calculateProcessingComplexity(segments) {
        let complexity = 0;
        segments.forEach(segment => {
            complexity += segment.intensity || 5;
            if (segment.textOverlays) complexity += segment.textOverlays.length * 2;
            if (segment.videoEditing) complexity += 3;
        });
        
        if (complexity < 50) return 'low';
        if (complexity < 100) return 'medium';
        if (complexity < 200) return 'high';
        return 'very_high';
    }

    /**
     * Estimate render time
     */
    estimateRenderTime(segments) {
        const totalDuration = Math.max(...segments.map(s => s.endTime)) / 1000; // Convert to seconds
        const baseTime = totalDuration * 0.5; // Base 0.5x real-time
        const complexityMultiplier = segments.reduce((sum, s) => sum + (s.intensity || 5), 0) / segments.length / 10;
        
        return Math.round(baseTime * (1 + complexityMultiplier));
    }

    /**
     * Estimate JSON file size
     */
    estimateFileSize(jsonData) {
        const jsonString = JSON.stringify(jsonData);
        const sizeBytes = new Blob([jsonString]).size;
        
        if (sizeBytes < 1024) return `${sizeBytes} bytes`;
        if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
        return `${Math.round(sizeBytes / (1024 * 1024))} MB`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentaryJSONExporter;
} else {
    window.DocumentaryJSONExporter = DocumentaryJSONExporter;
}