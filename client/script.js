/* ═══════════════════════════════════════════════════
   JOYA AI — Advanced Chatbot Script
   Features: conversation history, Markdown, code highlighting,
   streaming text, multi-session, upload, theme toggle
   ═══════════════════════════════════════════════════ */

// ── Configure marked.js ──────────────────────────────
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

// Custom renderer for code blocks (adds header with lang + copy button)
const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
    const language = lang || 'text';
    let highlighted;
    try {
        highlighted = lang && hljs.getLanguage(lang)
            ? hljs.highlight(code, { language: lang }).value
            : hljs.highlightAuto(code).value;
    } catch {
        highlighted = code;
    }
    const escaped = code.replace(/`/g, '\\`').replace(/\\/g, '\\\\');
    return `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-lang">${language}</span>
    <button class="copy-code-btn" onclick="copyCode(this, \`${escaped}\`)">📋 Copy</button>
  </div>
  <pre><code class="hljs language-${language}">${highlighted}</code></pre>
</div>`;
};
marked.use({ renderer });

// ── DOM References ────────────────────────────────────
const messagesEl    = document.getElementById('messages');
const promptInput   = document.getElementById('prompt');
const sendBtn       = document.getElementById('sendBtn');
const newChatBtn    = document.getElementById('newChat');
const historyEl     = document.getElementById('history');
const typingEl      = document.getElementById('typingIndicator');
const welcomeEl     = document.getElementById('welcome');
const charCountEl   = document.getElementById('charCount');
const themeToggle   = document.getElementById('themeToggle');
const themeIcon     = document.getElementById('themeIcon');
const themeLabel    = document.getElementById('themeLabel');
const uploadToggle  = document.getElementById('uploadToggle');
const uploadPanel   = document.getElementById('uploadPanel');
const uploadZone    = document.getElementById('uploadZone');
const fileInput     = document.getElementById('fileInput');
const uploadStatus  = document.getElementById('uploadStatus');
const clearChatBtn  = document.getElementById('clearChat');
const voiceToggle   = document.getElementById('voiceToggle');
const micBtn        = document.getElementById('micBtn');
const openSidebar   = document.getElementById('openSidebar');
const closeSidebar  = document.getElementById('closeSidebar');
const sidebar       = document.getElementById('sidebar');

// ── State ─────────────────────────────────────────────
let conversationHistory = [];   // [{role, content}, ...]
let sessions = [];               // [{id, title, history, createdAt}, ...]
let currentSessionId = null;
let isWaiting = false;

// ── Utility ───────────────────────────────────────────
const now = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const generateId = () =>
    `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const escapeHtml = (text) =>
    text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const scrollBottom = () => {
    requestAnimationFrame(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    });
};

// ── Theme ─────────────────────────────────────────────
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent  = theme === 'dark' ? '🌙' : '☀️';
    themeLabel.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
    localStorage.setItem('joya_theme', theme);
};

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme
applyTheme(localStorage.getItem('joya_theme') || localStorage.getItem('nova_theme') || 'dark');

// ── Mobile Sidebar Toggle ─────────────────────────────
openSidebar.addEventListener('click', () => sidebar.classList.add('mobile-open'));
closeSidebar.addEventListener('click', () => sidebar.classList.remove('mobile-open'));

// ── Character Counter ─────────────────────────────────
promptInput.addEventListener('input', () => {
    const len = promptInput.value.length;
    charCountEl.textContent = `${len} / 4000`;
    charCountEl.className = 'char-count' +
        (len > 3500 ? ' danger' : len > 3000 ? ' warn' : '');
    autoResize();
});

const autoResize = () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 200) + 'px';
};

// ── Message Rendering ─────────────────────────────────
const addMessage = (text, sender, animate = true) => {
    // Hide welcome screen on first real message
    if (welcomeEl) {
        welcomeEl.style.display = 'none';
    }

    const group = document.createElement('div');
    group.className = `message-group ${sender}`;
    if (!animate) group.style.animation = 'none';

    const isUser = sender === 'user';
    const avatarChar = isUser ? '👤' : '<img src="chat-avatar.png" class="chat-avatar-img" alt="Joya">';
    const senderName = isUser ? 'You' : 'Joya';

    // Render Markdown for bot messages, escape HTML for user
    let renderedContent;
    if (isUser) {
        renderedContent = `<p>${escapeHtml(text)}</p>`;
    } else {
        renderedContent = marked.parse(text);
    }

    group.innerHTML = `
        <div class="message-avatar">${avatarChar}</div>
        <div class="message-content">
            <div class="message-meta">
                <span class="sender-name">${senderName}</span>
                <span>${now()}</span>
            </div>
            <div class="message-bubble${isUser ? '' : ''}">
                ${renderedContent}
            </div>
            <div class="message-actions">
                <button class="action-btn" onclick="copyMessage(this)" title="Copy message">
                    📋 Copy
                </button>
                ${!isUser ? `<button class="action-btn speak-btn" onclick="toggleSpeakMessage(this)" title="Read aloud">🔊 Speak</button>` : ''}
            </div>
        </div>`;

    messagesEl.appendChild(group);
    scrollBottom();
    return group;
};

const addErrorMessage = (text) => {
    const group = addMessage(text, 'bot');
    group.querySelector('.message-bubble').classList.add('error-bubble');
};

// ── Typing Indicator ──────────────────────────────────
const showTyping = () => {
    typingEl.hidden = false;
    scrollBottom();
};

const hideTyping = () => {
    typingEl.hidden = true;
};

// ── Send Message ──────────────────────────────────────
const sendMessage = async () => {
    if (isWaiting) return;

    const text = promptInput.value.trim();
    if (!text) return;

    // UI: add user message
    addMessage(text, 'user');
    promptInput.value = '';
    promptInput.style.height = 'auto';
    charCountEl.textContent = '0 / 4000';

    // Build history
    conversationHistory.push({ role: 'user', content: text });
    saveCurrentSession(conversationHistory[0]?.content || text);

    // Lock UI
    isWaiting = true;
    sendBtn.disabled = true;
    showTyping();

    try {
        const res = await fetch(`${CONFIG.API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                messages: conversationHistory
            })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || data.reply || `HTTP ${res.status}`);
        }

        hideTyping();

        const botReply = data.reply;
        conversationHistory.push({ role: 'assistant', content: botReply });

        // Show bot message with typewriter effect
        typewriterMessage(botReply);

        // Auto-save updated session
        saveCurrentSession(conversationHistory[0]?.content || text);

    } catch (err) {
        hideTyping();
        addErrorMessage(`❌ ${err.message || 'Cannot connect to backend.'}`);
        console.error('Send error:', err);
        // Remove the failed user message from history
        conversationHistory.pop();
    } finally {
        isWaiting = false;
        sendBtn.disabled = false;
        promptInput.focus();
    }
};

// ── Typewriter Effect ─────────────────────────────────
const typewriterMessage = (fullText) => {
    if (welcomeEl) welcomeEl.style.display = 'none';

    const group = document.createElement('div');
    group.className = 'message-group bot';

    group.innerHTML = `
        <div class="message-avatar"><img src="chat-avatar.png" class="chat-avatar-img" alt="Joya"></div>
        <div class="message-content">
            <div class="message-meta">
                <span class="sender-name">Joya</span>
                <span>${now()}</span>
            </div>
            <div class="message-bubble" id="typing-target"></div>
            <div class="message-actions">
                <button class="action-btn" onclick="copyMessage(this)" title="Copy message">
                    📋 Copy
                </button>
                <button class="action-btn speak-btn" onclick="toggleSpeakMessage(this)" title="Read aloud">🔊 Speak</button>
            </div>
        </div>`;

    messagesEl.appendChild(group);
    scrollBottom();

    const target = group.querySelector('#typing-target');
    target.removeAttribute('id');

    // Render instantly (typewriter on HTML would break Markdown structure)
    // Instead: fade in rendered content for a smooth feel
    target.style.opacity = '0';
    target.innerHTML = marked.parse(fullText);

    // Fade in
    requestAnimationFrame(() => {
        target.style.transition = 'opacity 0.4s ease';
        target.style.opacity = '1';
        scrollBottom();

        // Auto-read if enabled
        if (isAutoVoiceEnabled) {
            const speakBtn = group.querySelector('.speak-btn');
            speakText(fullText, speakBtn);
        }
    });
};

// ── Session Management ────────────────────────────────
const saveCurrentSession = (firstMessageText) => {
    if (!currentSessionId) {
        currentSessionId = generateId();
        const rawTitle = firstMessageText || 'New Chat';
        const title = rawTitle.slice(0, 36) + (rawTitle.length > 36 ? '…' : '');
        sessions.unshift({
            id: currentSessionId,
            title,
            history: [],
            createdAt: Date.now()
        });
    }

    // Update history for the active session
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
        session.history = [...conversationHistory];
    }

    persistSessions();
    renderHistory();
};

const persistSessions = () => {
    try {
        // Keep last 50 sessions, each history capped at 60 messages
        const toStore = sessions.slice(0, 50).map(s => ({
            ...s,
            history: s.history.slice(-60)
        }));
        localStorage.setItem('joya_sessions', JSON.stringify(toStore));
    } catch (e) {
        console.warn('Could not save sessions to localStorage:', e);
    }
};

const loadSessions = () => {
    try {
        const raw = localStorage.getItem('joya_sessions') || localStorage.getItem('nova_sessions');
        if (raw) sessions = JSON.parse(raw);
    } catch {
        sessions = [];
    }
    renderHistory();
};

const deleteSession = (id, e) => {
    if (e) e.stopPropagation();
    sessions = sessions.filter(s => s.id !== id);
    if (currentSessionId === id) {
        currentSessionId = null;
        conversationHistory = [];
        showWelcome();
    }
    persistSessions();
    renderHistory();
};

const renderHistory = () => {
    historyEl.innerHTML = '';

    if (sessions.length === 0) {
        historyEl.innerHTML = '<div class="history-empty">No chats yet.<br>Start a new conversation!</div>';
        return;
    }

    sessions.forEach(sess => {
        const div = document.createElement('div');
        div.className = 'history-item' + (sess.id === currentSessionId ? ' active' : '');
        div.setAttribute('role', 'listitem');
        div.title = sess.title;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'history-item-title';
        titleSpan.textContent = sess.title;

        const delBtn = document.createElement('button');
        delBtn.className = 'history-delete-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.title = 'Delete chat';
        delBtn.setAttribute('aria-label', 'Delete chat session');
        delBtn.addEventListener('click', (e) => deleteSession(sess.id, e));

        div.appendChild(titleSpan);
        div.appendChild(delBtn);

        div.addEventListener('click', () => loadSession(sess.id));
        historyEl.appendChild(div);
    });
};

const loadSession = (id) => {
    const sess = sessions.find(s => s.id === id);
    if (!sess) return;

    currentSessionId = id;
    conversationHistory = [...sess.history];

    // Clear and re-render messages
    messagesEl.innerHTML = '';

    if (conversationHistory.length === 0) {
        showWelcome();
        return;
    }

    conversationHistory.forEach(msg => {
        addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot', false);
    });

    renderHistory();
    scrollBottom();

    // Close mobile sidebar
    sidebar.classList.remove('mobile-open');
};

const showWelcome = () => {
    messagesEl.innerHTML = '';
    const welcome = document.createElement('div');
    welcome.className = 'welcome';
    welcome.id = 'welcome';
    welcome.innerHTML = `
        <img src="logo.png" alt="Joya AI Logo" class="welcome-logo-img">
        <h1 class="welcome-title">Hello, I'm <span class="gradient-text">Joya</span></h1>
        <p class="welcome-sub">Your intelligent AI assistant. Ask me anything — I'm here to help.</p>
        <div class="suggestion-chips">
            <button class="chip">✍️ Write me a short story</button>
            <button class="chip">🧪 Explain quantum computing</button>
            <button class="chip">💻 Write Python code for sorting</button>
            <button class="chip">🌍 Best places to travel in 2025</button>
        </div>`;
    messagesEl.appendChild(welcome);
    attachChipListeners();
};

// ── New Chat ──────────────────────────────────────────
newChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    currentSessionId = null;
    showWelcome();
    renderHistory();
    promptInput.focus();
    sidebar.classList.remove('mobile-open');
});

// ── Clear Chat ────────────────────────────────────────
clearChatBtn.addEventListener('click', () => {
    if (conversationHistory.length === 0) return;
    if (!confirm('Clear this conversation? This cannot be undone.')) return;
    conversationHistory = [];
    currentSessionId = null;
    showWelcome();
    renderHistory();
});

// ── Suggestion Chips ──────────────────────────────────
const attachChipListeners = () => {
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            promptInput.value = chip.textContent.replace(/^[^\s]+\s/, '');
            autoResize();
            promptInput.focus();
        });
    });
};

// ── Send Button & Keyboard ────────────────────────────
sendBtn.addEventListener('click', sendMessage);

promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Ctrl+/ to focus input
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        promptInput.focus();
    }
});

// ── Copy Actions ──────────────────────────────────────
window.copyMessage = (btn) => {
    const bubble = btn.closest('.message-content').querySelector('.message-bubble');
    const text = bubble.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => (btn.innerHTML = original), 2000);
    });
};

window.copyCode = (btn, code) => {
    // Un-escape the code
    const unescaped = code.replace(/\\`/g, '`').replace(/\\\\/g, '\\');
    navigator.clipboard.writeText(unescaped).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => (btn.textContent = original), 2000);
    });
};

// ── Voice / Speech Synthesis (TTS) & Recognition ────────
let isAutoVoiceEnabled = localStorage.getItem('joya_auto_voice') === 'true';
let currentSpeechUtterance = null;
let activeSpeakBtn = null;

if (isAutoVoiceEnabled && voiceToggle) {
    voiceToggle.classList.add('active');
}

voiceToggle?.addEventListener('click', () => {
    isAutoVoiceEnabled = !isAutoVoiceEnabled;
    localStorage.setItem('joya_auto_voice', isAutoVoiceEnabled);
    voiceToggle.classList.toggle('active', isAutoVoiceEnabled);
    if (!isAutoVoiceEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

const stripMarkdownForSpeech = (text) => {
    return text
        .replace(/```[\s\S]*?```/g, ' [Code block omitted] ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_#>-]/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
};

let cachedVoices = [];

const updateVoicesList = () => {
    if ('speechSynthesis' in window) {
        cachedVoices = window.speechSynthesis.getVoices() || [];
    }
};

if ('speechSynthesis' in window) {
    updateVoicesList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoicesList;
    }
}

const getJoyaFemaleVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const current = window.speechSynthesis.getVoices();
    const voices = (current && current.length > 0) ? current : cachedVoices;
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = [
        'zira', 'samantha', 'victoria', 'karen', 'moira', 'fiona', 
        'tessa', 'jenny', 'aria', 'hazel', 'susan', 'serena', 'veena', 
        'zari', 'joanna', 'ivy', 'kendra', 'kimberly', 'salli', 'lisa', 
        'amy', 'emma', 'olivia', 'google us english', 'google uk english female', 
        'female', 'siri', 'helena', 'laura', 'sabrina', 'corinne', 'catherine'
    ];

    const maleKeywords = [
        'david', 'mark', 'george', 'james', 'richard', 'alex', 'daniel', 
        'male', 'adam', 'brian', 'paul', 'guy', 'stefan', 'pavel', 'mike', 
        'stephen', 'thomas', 'fred', 'ralph'
    ];

    // Priority 1: Match explicit female voice keyword
    for (const kw of femaleKeywords) {
        const found = voices.find(v => v.name.toLowerCase().includes(kw));
        if (found) return found;
    }

    // Priority 2: Match any English voice not blacklisted as male
    const nonMaleEnglish = voices.find(v => 
        v.lang.startsWith('en') && !maleKeywords.some(m => v.name.toLowerCase().includes(m))
    );
    if (nonMaleEnglish) return nonMaleEnglish;

    // Priority 3: Match any non-male voice
    const nonMale = voices.find(v => !maleKeywords.some(m => v.name.toLowerCase().includes(m)));
    if (nonMale) return nonMale;

    return voices[0] || null;
};

// ── Avatar Animation Helpers ──────────────────────────
const startAvatarAnimation = () => {
    const welcomeLogo = document.querySelector('.welcome-logo-img');
    const sidebarLogo = document.querySelector('.logo-img');
    if (welcomeLogo) welcomeLogo.classList.add('speaking-anim');
    if (sidebarLogo) sidebarLogo.classList.add('speaking-anim');
};

const stopAvatarAnimation = () => {
    const welcomeLogo = document.querySelector('.welcome-logo-img');
    const sidebarLogo = document.querySelector('.logo-img');
    if (welcomeLogo) welcomeLogo.classList.remove('speaking-anim');
    if (sidebarLogo) sidebarLogo.classList.remove('speaking-anim');
};

const speakText = (rawText, btn = null) => {
    if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported in this browser.');
        return;
    }

    // Stop current speech if playing
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        stopAvatarAnimation();
        if (activeSpeakBtn) {
            activeSpeakBtn.innerHTML = '🔊 Speak';
            activeSpeakBtn.classList.remove('speaking');
        }
        if (activeSpeakBtn === btn) {
            activeSpeakBtn = null;
            return;
        }
    }

    const cleanText = stripMarkdownForSpeech(rawText);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.35; // Distinct, sweet female voice pitch

    const femaleVoice = getJoyaFemaleVoice();
    if (femaleVoice) utterance.voice = femaleVoice;

    if (btn) {
        activeSpeakBtn = btn;
        btn.innerHTML = '⏹️ Stop';
        btn.classList.add('speaking');
    }

    utterance.onstart = () => {
        startAvatarAnimation();
    };

    utterance.onend = () => {
        stopAvatarAnimation();
        if (btn) {
            btn.innerHTML = '🔊 Speak';
            btn.classList.remove('speaking');
        }
        activeSpeakBtn = null;
    };

    utterance.onerror = () => {
        stopAvatarAnimation();
        if (btn) {
            btn.innerHTML = '🔊 Speak';
            btn.classList.remove('speaking');
        }
        activeSpeakBtn = null;
    };

    currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
};

const playJoyaWelcomeSpeech = () => {
    if (welcomeSpoken || !('speechSynthesis' in window)) return;
    welcomeSpoken = true;

    const welcomeMsg = "Hello! Welcome to Joya AI. I'm Joya, your personal assistant. How can I help you today?";
    const utterance = new SpeechSynthesisUtterance(welcomeMsg);
    utterance.rate = 0.95;
    utterance.pitch = 1.25;

    const voice = getJoyaFemaleVoice();
    if (voice) {
        utterance.voice = voice;
        console.log("Joya Female Voice selected:", voice.name, voice.lang);
    }

    utterance.onstart = () => {
        startAvatarAnimation();
    };

    utterance.onend = () => {
        stopAvatarAnimation();
    };

    utterance.onerror = () => {
        stopAvatarAnimation();
    };

    window.speechSynthesis.speak(utterance);
};

const setupJoyaVoiceWelcome = () => {
    if (!('speechSynthesis' in window)) return;

    // Load voices if async
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            if (!welcomeSpoken) playJoyaWelcomeSpeech();
        };
    }
    
    // Attempt automatic welcome greeting
    playJoyaWelcomeSpeech();

    // Fallback: Speak on user's first click or touch if browser autoplay policy blocks unprompted audio
    const triggerOnGesture = () => {
        if (!welcomeSpoken) {
            playJoyaWelcomeSpeech();
        }
        window.removeEventListener('click', triggerOnGesture);
        window.removeEventListener('keydown', triggerOnGesture);
        window.removeEventListener('touchstart', triggerOnGesture);
    };

    window.addEventListener('click', triggerOnGesture, { once: true });
    window.addEventListener('keydown', triggerOnGesture, { once: true });
    window.addEventListener('touchstart', triggerOnGesture, { once: true });
};

window.toggleSpeakMessage = (btn) => {
    const bubble = btn.closest('.message-content').querySelector('.message-bubble');
    const text = bubble.innerText;
    speakText(text, btn);
};

// ── Speech Recognition (Voice Input) ─────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        micBtn.title = 'Listening… Click to stop';
    };

    recognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
        }
        promptInput.value = transcript;
        autoResize();
    };

    recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        stopRecording();
    };

    recognition.onend = () => {
        stopRecording();
    };
} else {
    micBtn?.addEventListener('click', () => {
        alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    });
}

const stopRecording = () => {
    isRecording = false;
    if (micBtn) {
        micBtn.classList.remove('recording');
        micBtn.title = 'Voice Input (Speak)';
    }
};

micBtn?.addEventListener('click', () => {
    if (!recognition) return;

    if (isRecording) {
        recognition.stop();
        stopRecording();
    } else {
        try {
            recognition.start();
        } catch (err) {
            console.error('Mic start error:', err);
        }
    }
});

// ── Upload ────────────────────────────────────────────
uploadToggle.addEventListener('click', () => {
    uploadPanel.hidden = !uploadPanel.hidden;
});

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) handleFileUpload(file);
});

const handleFileUpload = async (file) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
        showUploadStatus('❌ Only PDF and TXT files are supported.', 'error');
        return;
    }

    showUploadStatus(`⏳ Uploading "${file.name}"…`, 'loading');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`${CONFIG.API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

        showUploadStatus(`✅ "${file.name}" uploaded! You can now ask questions about it.`, 'success');
    } catch (err) {
        showUploadStatus(`❌ Upload failed: ${err.message}`, 'error');
    }

    fileInput.value = '';
};

const showUploadStatus = (msg, type) => {
    uploadStatus.hidden = false;
    uploadStatus.textContent = msg;
    uploadStatus.style.background = type === 'error'
        ? 'rgba(239,68,68,0.1)'
        : type === 'success'
        ? 'rgba(16,185,129,0.1)'
        : 'var(--accent-gradient-soft)';
    uploadStatus.style.borderColor = type === 'error'
        ? 'rgba(239,68,68,0.3)'
        : type === 'success'
        ? 'rgba(16,185,129,0.3)'
        : 'var(--border-hover)';
};

// ── Init ──────────────────────────────────────────────
const init = () => {
    loadSessions();
    attachChipListeners();
    promptInput.focus();
    setupJoyaVoiceWelcome();
    window.addEventListener('beforeunload', () => {
        if (currentSessionId) {
            const session = sessions.find(s => s.id === currentSessionId);
            if (session) session.history = [...conversationHistory];
        }
        persistSessions();
    });
};

init();