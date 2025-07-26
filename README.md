# BBC Documentary Maker - AI-Powered Video Analysis System

🎬 **Professional documentary creation with AI-driven transcript analysis and algorithmic video cutting**

## ✨ Features

### 🎯 Core Capabilities
- **AI-Driven Transcript Analysis**: Deep understanding of content, emotions, and narrative flow
- **Algorithmic Video Cutting**: Frame-perfect cuts with natural speech pause detection
- **BBC-Style Text Overlays**: Professional typewriter animations and lower-thirds
- **Auto-Transcription**: Upload video only → automatic speech-to-text with speaker diarization
- **JSON Export**: Complete processing instructions for automated video editing

### 🎭 Professional Output
- **8-12 Intelligent Segments**: AI identifies key moments, revelations, and emotional beats
- **Speaker Diarization**: Automatic identification of different speakers (Speaker A, B, C)
- **Precise Timing**: Millisecond-accurate cut points with breath pause detection
- **Cinematic Transitions**: BBC documentary-style fades and effects
- **Shareable Projects**: Supabase integration for cloud storage and link sharing

## 🚀 Live Demo

**[Try BBC Documentary Maker](https://bbcdocumentarysystem-a3qkv70ib-justiceminds-projects.vercel.app)**

## 🎯 Two Upload Modes

### 1. **Video + Transcript** (Maximum Control)
- Upload your video file
- Upload transcript (SRT, TXT, or paste directly)
- Generate documentary segments with AI analysis

### 2. **Video Only** (Auto-Transcription)
- Upload video file only
- Click "🎤 Auto-Transcribe Video"
- Automatic speech-to-text with speaker identification
- Seamless integration with analysis pipeline

## 🔧 Technical Features

### **Algorithmic Processing**
- **Breath Pause Detection**: Natural cut points during speech pauses
- **Sentence Boundary Analysis**: Cuts at grammatically appropriate moments
- **Speaker Change Detection**: Automatic identification of conversation turns
- **Emotional Beat Mapping**: Intensity analysis for dramatic effect

### **BBC Documentary Standards**
- **Professional Overlays**: Title cards, quotes, speaker identification
- **Typewriter Animations**: Character-by-character text reveals
- **Color Grading Suggestions**: Mood-based visual enhancement
- **Music Synchronization**: Emotional beats aligned with audio cues

### **Export Capabilities**
- **JSON Processing Instructions**: Complete algorithmic cutting data
- **Segment Metadata**: Timing, speakers, intensity, categories
- **Overlay Specifications**: Position, animation, duration for each text element
- **Transition Data**: Fade types, durations, visual effects

## 🎬 Perfect For

- **Zoom Meetings & Interviews**: 1-2 person waist-up videos
- **Documentary Content**: Professional BBC-style narrative creation
- **Content Creators**: Automated editing with minimal manual work
- **Educational Videos**: Structured content with clear segments
- **Corporate Communications**: Professional presentation formatting

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS3 with advanced animations
- **AI Processing**: Web Speech API, custom diarization algorithms
- **Video Processing**: HTML5 Video API, Canvas for overlay rendering
- **Storage**: Supabase for project persistence and sharing
- **Deployment**: Vercel with optimized static asset delivery

## 📊 Output Format

The system generates comprehensive JSON output including:

```json
{
  "segments": [
    {
      "title": "Opening Statement",
      "startTime": 0,
      "endTime": 30000,
      "speakers": ["Speaker A"],
      "category": "context",
      "intensity": 7,
      "cutTiming": {
        "breathPauses": [...],
        "sentenceBoundaries": [...],
        "optimalCutFrame": 200
      },
      "textOverlays": [
        {
          "type": "title",
          "text": "Opening Statement",
          "animation": "typewriter",
          "startTime": 1000,
          "duration": 3000
        }
      ]
    }
  ],
  "transitions": [...],
  "audioProcessing": {...}
}
```

## 🎯 Use Cases

### **Content Creation**
- Transform raw interview footage into professional documentaries
- Create engaging educational content with minimal editing
- Generate social media clips with automatic captions

### **Professional Video Production**
- Speed up editing workflow with AI-suggested cuts
- Maintain BBC documentary standards automatically
- Export precise editing instructions for professional video software

### **Corporate & Educational**
- Process meeting recordings into structured presentations
- Create training materials with automatic segmentation
- Generate accessible content with speaker identification

## 🚀 Getting Started

### **📦 Public Access (No Authentication Required):**

1. **Download from GitHub**: [Download ZIP](https://github.com/justicemindsdev/documentary/archive/refs/heads/main.zip)
2. **Extract Files**: Unzip the download
3. **Open Locally**: Double-click `index.html` or run a local server
4. **Full Functionality**: Upload videos, auto-transcribe, generate powerful clips

### **💻 Clone & Run:**
```bash
git clone https://github.com/justicemindsdev/documentary.git
cd documentary

# Option 1: Open directly in browser
open index.html

# Option 2: Run Python server
python3 serve.py

# Option 3: Run Node.js server  
node serve.js
```

### **🎬 Usage:**
1. **Upload Your Video**: Drag & drop or click to upload
2. **Choose Your Mode**:
   - Upload transcript for maximum control
   - Use auto-transcription for convenience
3. **Generate Segments**: Click "Generate Documentary Clips"
4. **Export Results**: Download JSON for video editing software

## 🎬 Example Workflow

```
📹 Upload Interview Video (MP4)
     ↓
🎤 Auto-Transcribe (Speaker A, B identification)
     ↓
🧠 AI Analysis (Emotional beats, key moments)
     ↓
✂️ Generate Cut Points (Breath pauses, sentences)
     ↓
🎭 Add BBC Overlays (Titles, quotes, speakers)
     ↓
📄 Export JSON (Ready for video editing software)
```

## 🎯 Benefits

- **Zero Heavy Video Processing**: Works with lightweight transcript analysis
- **Professional Results**: BBC documentary quality output
- **Time Saving**: Automated analysis and cutting suggestions
- **Flexible Input**: Works with various video and transcript formats
- **Scalable**: Cloud storage and sharing capabilities

## 🔧 Development

This is a client-side application with no server dependencies. All processing happens in the browser using:

- Web Speech API for transcription
- Canvas API for overlay rendering
- Local storage for temporary data
- Supabase for persistent storage

## 📝 License

MIT License - Feel free to use, modify, and distribute

## 🤝 Contributing

Contributions welcome! This system focuses on defensive video analysis and documentary creation tools.

---

**Built for creating professional BBC-style documentaries with AI precision and algorithmic efficiency** 🎬✨