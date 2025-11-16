import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// --- API Configuration ---
const API_URL = 'http://localhost:8000/api';

// --- (Core) Global Styles & Design System ---
/**
 * Injects all global styles, font imports, and CSS animations (keyframes).
 * This is our replacement for `index.css` and `tailwind.config.js`.
 * THEME: "Orchestrator" (Dark, Engineered, Cursor-like)
 */
const GlobalStyles = () => (
  <style>{`
    /* 1. Font Imports */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap');
    @import url('https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap');

    /* 2. Base Body Styles (Orchestrator Design System) */
    body {
      background-color: #0A0A0A; /* near-black background */
      font-family: 'Inter', sans-serif;
      color: #F0F0F0; /* primary-text */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* 3. Keyframes for Animations */
    @keyframes float {
      0%, 100% { transform: translateY(-3%); }
      50% { transform: translateY(3%); }
    }

    @keyframes subtle-blob-1 {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }

    @keyframes subtle-blob-2 {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(-20px, 30px) scale(0.9); }
      66% { transform: translate(40px, -10px) scale(1.1); }
      100% { transform: translate(0, 0) scale(1); }
    }
    
    /* 4. Scrollbar Styles (Dark) */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #111111;
    }
    ::-webkit-scrollbar-thumb {
      background: #2A2A2A;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3B82F6; /* accent-blue */
    }
  `}</style>
);

// --- (Core) Icon Library ---
// New logo for "Orchestrator" - more technical, less "bubbly"
const IconOrchestratorLogo = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <defs>
      <linearGradient id="grad-logo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
    <rect width="18" height="18" x="3" y="3" rx="2" stroke="url(#grad-logo)" strokeWidth="2" opacity="0.3" />
    <rect width="12" height="12" x="6" y="6" rx="2" stroke="url(#grad-logo)" strokeWidth="2" opacity="0.6" />
    <rect width="6" height="6" x="9" y="9" rx="1" fill="url(#grad-logo)" />
  </svg>
);
const IconArrowRight = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
const IconNodes = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <path d="M6 15v-1a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2V7" />
    <path d="M18 9v-1a2 2 0 0 0-2-2h-4a2 2 0 0 1-2-2V3" />
  </svg>
);
const IconChat = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconInspect = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);
const IconTools = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a1 1 0 0 0-1.4-1.4L14.7 6.3z" />
    <path d="M14 10.5 7.5 17a1 1 0 0 1-1.4 0l-3.7-3.7a1 1 0 0 1 0-1.4L9 5.5" />
  </svg>
);
const IconSend = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconCode = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconBrain = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2a9 9 0 0 0-9 9c0 4.4 3.2 8.1 7.3 8.9v2.2a.5.5 0 0 0 .5.5h2.4a.5.5 0 0 0 .5-.5v-2.2c4.1-.8 7.3-4.5 7.3-8.9a9 9 0 0 0-9-9Z" />
    <path d="M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    <path d="M12 15c-1.1 0-2-.9-2-2 0-.7.4-1.3 1-1.7" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m20 6-11 11-4-4" />
  </svg>
);
const IconCalculator = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h8M8 14h8M8 18h8" />
  </svg>
);
const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconFile = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);
const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// --- (Core) Reusable "Orchestrator" Components ---

/**
 * PrimaryButton: The main CTA button.
 */
const PrimaryButton = ({ children, onClick, className = '' }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      px-6 py-3 rounded-full text-white font-semibold
      bg-blue-600 hover:bg-blue-500
      shadow-lg shadow-blue-600/30
      transition-all duration-300
      ${className}
    `}
  >
    {children}
  </motion.button>
);

/**
 * SecondaryButton: The secondary "panel" button.
 */
const SecondaryButton = ({ children, onClick, className = '' }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2, backgroundColor: '#1C1C1C' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      px-6 py-3 rounded-full font-semibold
      bg-[#111111]/80 backdrop-blur-lg
      border border-[#2A2A2A]
      shadow-lg shadow-black/20
      text-[#F0F0F0]
      transition-all duration-300
      ${className}
    `}
  >
    {children}
  </motion.button>
);

/**
 * PanelCard: The base for all "glass" panels (dark mode).
 */
const PanelCard = ({ children, className = '' }) => (
  <div
    className={`
      bg-[#111111]/80 backdrop-blur-xl
      border border-[#2A2A2A]
      rounded-2xl shadow-xl shadow-black/20
      ${className}
    `}
  >
    {children}
  </div>
);

// --- 1. Landing Page Components ---

const LandingNavbar = ({ onGetStarted }) => (
  <motion.nav
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="sticky top-4 inset-x-0 mx-auto max-w-6xl z-50"
  >
    <div className="flex items-center justify-between px-4 py-3 bg-[#111111]/80 backdrop-blur-xl border border-[#2A2A2A] rounded-2xl shadow-xl shadow-black/20">
      <div className="flex items-center gap-2">
        <IconOrchestratorLogo className="w-8 h-8" />
        <span className="font-bold text-xl font-['General_Sans'] text-[#F0F0F0]">Orchestrator</span>
      </div>
      <div className="hidden md:flex items-center gap-6 font-medium text-[#888888]">
        <a href="#" className="hover:text-[#F0F0F0]">Features</a>
        <a href="#" className="hover:text-[#F0F0F0]">Docs</a>
      </div>
      <PrimaryButton onClick={onGetStarted} className="px-5 py-2 text-sm">
        Get Started
      </PrimaryButton>
    </div>
  </motion.nav>
);

const LandingHero = ({ onGetStarted }) => (
  <div className="relative pt-24 pb-32 flex flex-col items-center text-center">
    {/* Background Blobs (Darker, more subtle) */}
    <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-900 rounded-full filter blur-3xl opacity-30 animate-[subtle-blob-1_15s_infinite]" />
    <div className="absolute top-20 right-1/4 w-72 h-72 bg-gray-900 rounded-full filter blur-3xl opacity-30 animate-[subtle-blob-2_15s_infinite_delay-5s]" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      className="z-10"
    >
      <h1 className="font-['General_Sans'] font-bold text-6xl md:text-8xl text-white leading-tight tracking-tighter">
        Build. Run. Evolve.
        <br />
        <span className="bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
          Your Agents, Amplified.
        </span>
      </h1>
      <p className="max-w-xl mx-auto mt-6 text-lg text-[#888888]">
        Welcome to Orchestrator, the all-in-one platform to design, deploy, and inspect
        autonomous AI agents with unparalleled ease.
      </p>
      <div className="flex justify-center gap-4 mt-8">
        <PrimaryButton onClick={onGetStarted}>Start Building Now</PrimaryButton>
        <SecondaryButton>View Docs</SecondaryButton>
      </div>
    </motion.div>

    {/* Pseudo-3D Hero Centerpiece (Dark Mode) */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      className="relative w-full max-w-3xl mt-20 z-0 animate-[float_6s_ease-in-out_infinite]"
    >
      <PanelCard className="p-4">
        <div className="w-full h-64 bg-[#0A0A0A] rounded-2xl p-4 border border-[#2A2A2A]">
          <div className="w-1/3 h-4 bg-[#2A2A2A] rounded-full" />
          <div className="w-1/2 h-4 bg-[#2A2A2A] rounded-full mt-3" />
          <div className="w-full h-32 bg-[#111111] rounded-xl mt-4 border border-[#2A2A2A]" />
        </div>
      </PanelCard>
      <PanelCard className="absolute top-1/2 left-0 w-48 h-32 -translate-x-1/4 -translate-y-1/2 shadow-2xl" />
      <PanelCard className="absolute top-1/3 right-0 w-56 h-40 -translate-y-1/2 translate-x-1/4 shadow-2xl" />
    </motion.div>
  </div>
);

const LandingPlatformNav = ({ navigate }) => (
  <div className="py-24 bg-[#111111] rounded-t-3xl">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-center font-['General_Sans'] font-bold text-5xl text-[#F0F0F0] mb-12">
        Explore the Platform
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PlatformCard
          title="Build Agents"
          icon={<IconNodes className="w-12 h-12 text-blue-400" />}
          onClick={() => navigate('build')}
        >
          Visually orchestrate complex, multi-step agent workflows.
        </PlatformCard>
        <PlatformCard
          title="Model Playground"
          icon={<IconChat className="w-12 h-12 text-blue-400" />}
          onClick={() => navigate('playground')}
        >
          Test, chat, and iterate with any model in a live environment.
        </PlatformCard>
        <PlatformCard
          title="Inspect Runs"
          icon={<IconInspect className="w-12 h-12 text-blue-400" />}
          onClick={() => navigate('inspect')}
        >
          Dive deep into performance, logs, and token usage.
        </PlatformCard>
        <PlatformCard
          title="Manage Tools"
          icon={<IconTools className="w-12 h-12 text-blue-400" />}
          onClick={() => navigate('tools')}
        >
          Integrate APIs, functions, and data sources in one click.
        </PlatformCard>
      </div>
    </div>
  </div>
);

const PlatformCard = ({ title, icon, children, onClick }) => (
  <motion.div
    whileHover={{ y: -10, borderColor: '#3B82F6' }}
    onClick={onClick}
    className={`relative p-8 rounded-3xl text-white cursor-pointer overflow-hidden bg-[#1C1C1C] border border-[#2A2A2A] transition-colors duration-300`}
  >
    <div className="relative z-10">
      <div className="mb-4">{icon}</div>
      <h3 className="font-['General_Sans'] font-bold text-2xl mb-2">{title}</h3>
      <p className="text-[#888888]">{children}</p>
    </div>
  </motion.div>
);

const LandingPage = ({ navigate }) => (
  <motion.div
    key="landing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <LandingNavbar onGetStarted={() => navigate('playground')} />
    <main>
      <LandingHero onGetStarted={() => navigate('playground')} />
      <LandingPlatformNav navigate={navigate} />
    </main>
    {/* ... Footer ... */}
  </motion.div>
);

// --- 2. App Shell Components ---

const AppNavbar = ({ currentPage, navigate }) => (
  <nav className="sticky top-4 inset-x-0 mx-auto max-w-6xl z-50">
    <div className="flex items-center justify-between px-4 py-3 bg-[#111111]/80 backdrop-blur-xl border border-[#2A2A2A] rounded-2xl shadow-xl shadow-black/20">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('landing')}>
        <IconOrchestratorLogo className="w-8 h-8" />
        <span className="font-bold text-xl font-['General_Sans'] text-[#F0F0F0]">Orchestrator</span>
      </div>
      
      {/* Segmented Control (Dark) */}
      <div className="hidden md:flex items-center gap-2 bg-[#0A0A0A] p-1 rounded-full border border-[#2A2A2A]">
        <SegmentedControlButton
          title="Build"
          active={currentPage === 'build'}
          onClick={() => navigate('build')}
        />
        <SegmentedControlButton
          title="Playground"
          active={currentPage === 'playground'}
          onClick={() => navigate('playground')}
        />
        <SegmentedControlButton
          title="Inspect"
          active={currentPage === 'inspect'}
          onClick={() => navigate('inspect')}
        />
        <SegmentedControlButton
          title="Tools"
          active={currentPage === 'tools'}
          onClick={() => navigate('tools')}
        />
      </div>

      <img
        src="https://placehold.co/40x40/3B82F6/FFFFFF?text=A&font=sans"
        alt="User Avatar"
        className="w-10 h-10 rounded-full"
      />
    </div>
  </nav>
);

const SegmentedControlButton = ({ title, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors
      ${active ? 'text-white' : 'text-[#888888] hover:text-[#F0F0F0]'}
    `}
  >
    {active && (
      <motion.div
        layoutId="segmented-bubble"
        className="absolute inset-0 bg-blue-600 rounded-full"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}
    <span className="relative z-10">{title}</span>
  </button>
);

const AppLayout = ({ children, currentPage, navigate }) => (
  <motion.div
    key="app-shell"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <AppNavbar currentPage={currentPage} navigate={navigate} />
    <main className="max-w-7xl mx-auto p-4 md:p-8 mt-4">
      {children}
    </main>
  </motion.div>
);

// --- 3. Sub-Page Components ---

const ModelPlaygroundPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Orchestrator. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Call real backend API
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      // Add agent response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        run_id: data.run_id 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Make sure backend is running at ${API_URL}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
      {/* Chat Pane */}
      <PanelCard className="lg:col-span-2 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-[#1C1C1C] text-[#F0F0F0] rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.run_id && (
                  <p className="text-xs opacity-50 mt-2">Run ID: {msg.run_id.substring(0, 8)}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 bg-[#1C1C1C] rounded-2xl rounded-bl-none">
                <p className="text-[#888888]">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Floating Command Bar */}
        <div className="p-4 mt-auto">
          <div className="group flex items-center bg-[#1C1C1C]/80 backdrop-blur-lg border border-[#2A2A2A] rounded-full p-2 shadow-xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <input
              type="text"
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-3 border-none ring-0 focus:ring-0 text-[#F0F0F0] placeholder:text-[#888888] outline-none"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconSend />
            </button>
          </div>
        </div>
      </PanelCard>

      {/* Inspector Pane */}
      <PanelCard className="h-full overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A]">
          <h3 className="font-['General_Sans'] font-bold text-xl text-[#F0F0F0]">Inspector</h3>
          <p className="text-sm text-[#888888] mt-1">Chat with your AI agent.</p>
        </div>
        <div className="p-6">
          <h4 className="text-sm font-semibold text-[#888888] mb-2">STATISTICS</h4>
          <p className="text-sm text-[#F0F0F0]">Messages: {messages.length}</p>
          <p className="text-sm text-[#F0F0F0] mt-2">API: {API_URL}</p>
        </div>
      </PanelCard>
    </div>
  );
};

const BuildAgentsPage = () => (
  <div className="relative h-[calc(100vh-150px)] w-full">
    {/* Main Canvas (Placeholder) */}
    <div className="absolute inset-0 bg-[#0A0A0A] rounded-3xl border border-[#2A2A2A] overflow-hidden">
      <div className="p-8 text-center text-[#888888]">
        <h2 className="text-2xl font-bold font-['General_Sans'] text-[#F0F0F0]">Agent Builder</h2>
        <p>Drag nodes from the palette to start building your workflow.</p>
      </div>
    </div>

    {/* Floating Tool Palette */}
    <motion.div
      drag
      dragMomentum={false}
      className="absolute top-10 left-10 z-20"
    >
      <PanelCard className="w-64 p-4">
        <h4 className="font-semibold text-[#F0F0F0] mb-3">Node Palette</h4>
        <div className="space-y-2">
          <div className="p-3 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg text-sm font-medium text-[#F0F0F0] cursor-grab">LLM Node</div>
          <div className="p-3 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg text-sm font-medium text-[#F0F0F0] cursor-grab">Code Tool</div>
          <div className="p-3 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg text-sm font-medium text-[#F0F0F0] cursor-grab">Calculator Tool</div>
        </div>
      </PanelCard>
    </motion.div>
    
    {/* Floating Config Inspector */}
    <motion.div
      drag
      dragMomentum={false}
      className="absolute top-10 right-10 z-20"
    >
      <PanelCard className="w-80 p-4">
        <h4 className="font-semibold text-[#F0F0F0] mb-3">Configuration</h4>
        <p className="text-sm text-[#888888]">Select a node to configure its parameters.</p>
      </PanelCard>
    </motion.div>
  </div>
);

// --- NEW: Inspect Runs Page ---
const InspectRunsPage = () => {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runDetails, setRunDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load runs on mount
  useEffect(() => {
    fetch(`${API_URL}/runs`)
      .then(r => r.json())
      .then(data => {
        setRuns(data);
        if (data.length > 0) {
          setSelectedRun(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading runs:', err);
        setLoading(false);
      });
  }, []);
  
  // Load run details when selected
  useEffect(() => {
    if (selectedRun) {
      fetch(`${API_URL}/runs/${selectedRun}`)
        .then(r => r.json())
        .then(setRunDetails)
        .catch(err => console.error('Error loading run details:', err));
    }
  }, [selectedRun]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <p className="text-[#888888]">Loading runs...</p>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <div className="text-center">
          <p className="text-[#F0F0F0] text-lg mb-2">No runs yet</p>
          <p className="text-[#888888]">Start a chat in the Playground to create runs!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-150px)]">
      {/* Runs List */}
      <PanelCard className="lg:col-span-1 h-full overflow-y-auto">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h3 className="font-['General_Sans'] font-bold text-xl text-[#F0F0F0]">Run History</h3>
          <p className="text-xs text-[#888888] mt-1">{runs.length} total runs</p>
        </div>
        <div className="p-2 space-y-1">
          {runs.map(run => (
            <button 
              key={run.id}
              onClick={() => setSelectedRun(run.id)}
              className={`w-full text-left p-3 rounded-lg ${selectedRun === run.id ? 'bg-blue-600 text-white' : 'hover:bg-[#1C1C1C]'}`}
            >
              <p className="font-semibold">{run.name}</p>
              <p className={`text-sm ${selectedRun === run.id ? 'text-blue-100' : 'text-[#888888]'}`}>{run.time} - {run.status}</p>
            </button>
          ))}
        </div>
      </PanelCard>

      {/* Run Step Timeline */}
      <div className="lg:col-span-2 h-full overflow-y-auto bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 space-y-6">
        {runDetails ? (
          runDetails.steps.map((step, index) => (
            <RunStep key={index} step={step} />
          ))
        ) : (
          <p className="text-[#888888]">Loading run details...</p>
        )}
      </div>

      {/* Inspector */}
      <PanelCard className="lg:col-span-1 h-full overflow-y-auto">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h3 className="font-['General_Sans'] font-bold text-xl text-[#F0F0F0]">Run Info</h3>
        </div>
        <div className="p-4">
          {runDetails ? (
            <>
              <h4 className="text-sm font-semibold text-[#888888] mb-2 uppercase">Details</h4>
              <p className="text-sm text-[#F0F0F0] mb-1">ID: {runDetails.id.substring(0, 8)}</p>
              <p className="text-sm text-[#F0F0F0] mb-1">Status: {runDetails.status}</p>
              <p className="text-sm text-[#F0F0F0] mb-1">Steps: {runDetails.steps.length}</p>
              <p className="text-sm text-[#888888] mt-4 break-words">Query: {runDetails.user_query}</p>
            </>
          ) : (
            <p className="text-sm text-[#888888]">Select a run to see details.</p>
          )}
        </div>
      </PanelCard>
    </div>
  );
};

// --- NEW: Manage Tools Page ---
const ManageToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolDetails, setToolDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Icon mapping
  const iconMap = {
    'IconCalculator': IconCalculator,
    'IconSearch': IconSearch,
    'IconFile': IconFile,
  };

  // Load tools on mount
  useEffect(() => {
    fetch(`${API_URL}/tools`)
      .then(r => r.json())
      .then(data => {
        setTools(data);
        if (data.length > 0) {
          setSelectedTool(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tools:', err);
        setLoading(false);
      });
  }, []);
  
  // Load tool details when selected
  useEffect(() => {
    if (selectedTool) {
      fetch(`${API_URL}/tools/${selectedTool}`)
        .then(r => r.json())
        .then(setToolDetails)
        .catch(err => console.error('Error loading tool details:', err));
    }
  }, [selectedTool]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <p className="text-[#888888]">Loading tools...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-150px)]">
      {/* Tool List */}
      <PanelCard className="lg:col-span-1 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h3 className="font-['General_Sans'] font-bold text-xl text-[#F0F0F0]">Tools</h3>
          <button className="p-2 rounded-lg hover:bg-[#1C1C1C]" title="Add custom tool (coming soon)">
            <IconPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2 space-y-1">
          {tools.map(tool => {
            const IconComponent = iconMap[tool.icon] || IconTools;
            return (
              <button 
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`w-full flex items-center gap-3 text-left p-3 rounded-lg ${selectedTool === tool.id ? 'bg-blue-600 text-white' : 'hover:bg-[#1C1C1C]'}`}
              >
                <IconComponent className={`w-5 h-5 ${selectedTool === tool.id ? 'text-white' : 'text-blue-400'}`} />
                <span className="font-semibold">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </PanelCard>

      {/* Tool Details */}
      <PanelCard className="lg:col-span-3 h-full overflow-y-auto">
        {toolDetails ? (
          <>
            <div className="p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['General_Sans'] font-bold text-2xl text-[#F0F0F0] mb-1">{toolDetails.name}</h2>
                  <p className="text-[#888888]">{toolDetails.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${toolDetails.enabled ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                  {toolDetails.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-sm font-semibold text-[#888888] mb-2 uppercase">Schema Definition</h4>
              <div className="p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg overflow-x-auto">
                <pre className="text-sm text-blue-300 font-mono whitespace-pre-wrap">
{JSON.stringify(toolDetails.schema, null, 2)}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <p className="text-[#888888]">Loading tool details...</p>
          </div>
        )}
      </PanelCard>
    </div>
  );
};

// --- (Core) "Run Step" Components (Ported & Styled) ---
// These are for the `InspectRunsPage`
const RunStep = ({ step }) => {
  // Backend sends step.content which contains the actual data
  const content = step.content;
  
  switch (step.type) {
    case 'user-request':
      return <UserRequestStep content={content.content || content} />;
    case 'agent-thought':
      return <AgentThoughtStep content={content.content || content} />;
    case 'tool-call':
      return <ToolCallStep toolName={content.toolName} params={content.params} />;
    case 'tool-result':
      return <ToolResultStep toolName={content.toolName} result={content.result} />;
    case 'agent-response':
      return <AgentResponseStep content={content.content || content} />;
    default:
      return null;
  }
};

const UserRequestStep = ({ content }) => (
  <div className="flex justify-end">
    <div className="bg-blue-600 p-3 rounded-xl rounded-tr-none shadow max-w-lg">
      <p className="text-sm text-white">{content}</p>
    </div>
  </div>
);

const AgentResponseStep = ({ content }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center border border-[#2A2A2A]" title="Orchestrator">
      <IconOrchestratorLogo className="w-5 h-5" />
    </div>
    <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-3 rounded-xl rounded-tl-none shadow max-w-lg">
      <p className="text-sm text-[#F0F0F0]">{content}</p>
    </div>
  </div>
);

const AgentThoughtStep = ({ content }) => (
  <details className="p-3 bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-sm cursor-pointer">
    <summary className="flex items-center gap-2 text-xs font-medium font-mono text-blue-400 select-none">
      <IconBrain className="w-4 h-4" />
      Agent Thought
    </summary>
    <div className="mt-2 p-2 bg-[#0A0A0A] rounded-md">
      <pre className="text-xs text-[#888888] font-mono whitespace-pre-wrap">{content}</pre>
    </div>
  </details>
);

const ToolCallStep = ({ toolName, params }) => (
  <div className="p-0 bg-[#111111] border border-blue-600/50 rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 p-3 bg-blue-900/50 border-b border-blue-600/50">
      <IconCalculator className="w-4 h-4 text-blue-400" />
      <span className="text-xs font-medium font-mono text-blue-400">
        Running Tool: `{toolName}`
      </span>
    </div>
    <div className="p-3">
      <span className="text-xs text-[#888888] font-mono">PARAMETERS:</span>
      <div className="mt-1 p-2 bg-[#0A0A0A] rounded-md">
        <pre className="text-xs text-[#F0F0F0] font-mono whitespace-pre-wrap">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    </div>
  </div>
);

const ToolResultStep = ({ toolName, result }) => (
  <div className="p-0 bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 p-3 bg-[#1C1C1C] border-b border-[#2A2A2A]">
      <IconCheck className="w-4 h-4 text-green-400" />
      <span className="text-xs font-medium font-mono text-[#888888]">
        Tool Result: `{toolName}`
      </span>
    </div>
    <div className="p-3">
      <span className="text-xs text-[#888888] font-mono">OUTPUT:</span>
      <div className="mt-1 p-2 bg-[#0A0A0A] rounded-md">
        <pre className="text-xs text-[#F0F0F0] font-mono whitespace-pre-wrap">
          {result}
        </pre>
      </div>
    </div>
  </div>
);


// --- (Core) App Router ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'build':
        return <BuildAgentsPage />;
      case 'playground':
        return <ModelPlaygroundPage />;
      case 'inspect':
        return <InspectRunsPage />;
      case 'tools':
        return <ManageToolsPage />;
      case 'landing':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <AnimatePresence mode="wait">
        {currentPage === 'landing' ? (
          renderPage()
        ) : (
          <AppLayout currentPage={currentPage} navigate={navigate}>
            {renderPage()}
          </AppLayout>
        )}
      </AnimatePresence>
    </>
  );
}