# ✦ Joya AI — Intelligent AI Assistant

Joya AI is a modern, feature-rich web application built with HTML, Vanilla CSS, JavaScript, and Node.js/Express. It features a glassmorphism interface, multi-turn conversation memory, speech synthesis & voice input, document processing, and multi-session management.

![Joya AI](client/logo.png)

## ✨ Features

- 🎨 **Glassmorphism UI**: Vibrant dark and light mode themes with background blur, custom 3D logo, and smooth micro-animations.
- 🗣️ **Female Voice Output (TTS)**: Spoken welcome greeting upon opening and on-demand audio playback in a female voice with an animating Joya avatar logo.
- 🎙️ **Voice Input (Speech-to-Text)**: Speak directly into the microphone for real-time speech transcription.
- 🧠 **Multi-Turn Conversation Context**: Full chat history array sent with each prompt for context-aware responses.
- 📝 **Markdown & Syntax Highlighting**: Full Markdown support (bold, lists, blockquotes, tables) with code syntax highlighting and one-click copy buttons.
- 💬 **Session Management**: Automatically saves chat history to `localStorage` with options to restore, delete, or wipe sessions.
- 📄 **Document Upload**: Drag-and-drop PDF upload UI connected to backend document retrieval (RAG).

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/abinashchaudhary2007/Joya-AI.git
cd Joya-AI
```

### 2. Configure Environment
Navigate to the `server` directory, create a `.env` file from `.env.example`, and add your Groq API key:
```bash
cd server
cp .env.example .env
```
Inside `.env`:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Install Dependencies & Run
```bash
npm install --legacy-peer-deps
npm run dev
```

Open your browser and navigate to `http://localhost:5000`.

## 📁 Project Structure

```
Joya-AI/
├── client/             # Frontend HTML, CSS, JavaScript & Assets
│   ├── logo.png        # 3D Joya AI Logo
│   ├── index.html      # Main application markup
│   ├── style.css       # Custom glassmorphism design system
│   ├── script.js       # Client interaction & Voice logic
│   └── config.js       # Client API endpoint config
└── server/             # Express Backend API & Services
    ├── config/         # AI & database configurations
    ├── controllers/    # Request handlers (chat, upload)
    ├── routes/         # Express API routes
    ├── services/       # AI service integration & RAG services
    ├── utils/          # Helpers, loggers & document parsers
    └── server.js       # Application server entry point
```