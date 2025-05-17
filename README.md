# 🔍 OCR-Agent Avatar – Speak Your Errors

A 3D AI avatar that watches your screen, reads developer error messages via OCR, and speaks them out loud in a human-like voice — helping you debug faster and stay in flow.

## 🔥 Overview

This project creates an intelligent debugging assistant that uses ScreenPipe's OCR capabilities to detect and explain errors in real-time, presented through an engaging 3D avatar interface.

## 💡 Key Features

### 🧠 AI Avatar as Debug Assistant
- 3D avatar that explains errors
- Real-time error detection
- Human-like voice explanations
- Expressive gestures and animations

### 📺 ScreenPipe Integration
- OCR for error message detection
- Focus on key error zones:
  - Terminal
  - Browser devtools
  - IDE error overlays
- Real-time text extraction

### 🗣️ Smart Error Processing
- Error pattern recognition
- Stack trace parsing
- Build output analysis
- Runtime error detection

### 🎯 Developer Experience
- Flow-state preservation
- Voice command support
- Error history tracking
- Team collaboration features

## 🧱 Architecture

```
[Developer Screen]
       ↓
  ScreenPipe SDK
       ↓
[OCR Agent Daemon]
       ↓
[Error Processing] ←→ [LLM / Rule Engine]
       ↓
[Avatar Engine]
       ↓
3D Avatar + Voice + Gesture
```

## 🌐 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (SSR-ready) |
| Avatar Engine | Ready Player Me / DeepMotion |
| AI/Logic | OpenAI / Local LLM |
| Data Extract | ScreenPipe SDK |
| TTS | ElevenLabs / Web Speech API |
| 3D Rendering | Babylon.js / Three.js |

## 📦 Use Cases

- Solo Developers
- Development Teams
- Accessibility Workflows
- Hacker Events & Demos
- Educational Settings

## 🧠 Example Behaviors

- Terminal Error → Avatar: "I see a TypeError in your React component..."
- Build Error → Avatar waves hands: "Your Webpack build failed because..."
- Runtime Error → Avatar tilts head: "There's an undefined variable in..."

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ocr-agent-avatar.git
   cd ocr-agent-avatar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys to `.env.local`:
   ```
   SCREENPIPE_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ELEVENLABS_API_KEY=your_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main landing page
│   │   └── debug/             # Debug interface
│   ├── components/            # React components
│   │   ├── avatar/           # Avatar components
│   │   │   ├── Debugger.tsx  # Main debug avatar
│   │   │   ├── Gestures.tsx  # Avatar animations
│   │   │   └── Console.tsx   # Error display
│   │   └── ui/              # Shared UI components
│   ├── lib/                  # Core utilities
│   │   ├── screenpipe/      # ScreenPipe integration
│   │   ├── ocr/            # OCR processing
│   │   ├── avatar/         # Avatar engine
│   │   └── ai/             # AI/LLM integration
│   └── hooks/               # Custom React hooks
│       ├── useDebugger.ts   # Debug state
│       ├── useErrors.ts     # Error tracking
│       └── useVoice.ts      # Voice commands
├── public/                  # Static assets
└── scripts/                # Utility scripts
```

## 🔄 Optional Features

- Error log export to Notion/GDocs
- Voice command support
- GitHub Copilot integration
- Multilingual error support
- Team collaboration via Slack/Discord

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

