import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconSend, IconOrchestratorLogo, IconBrain } from '../components/ui/Icons';

const API_URL = 'http://localhost:8000/api';

const MessageBubble = ({ role, content, runId }) => {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
        >
            <div className={`flex gap-4 max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`
          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg
          ${isUser
                        ? 'bg-gradient-to-br from-primary to-secondary text-white ring-2 ring-primary/20'
                        : 'bg-surface-highlight border border-white/10 text-primary ring-2 ring-white/5'
                    }
        `}>
                    {isUser ? (
                        <span className="text-sm font-bold">U</span>
                    ) : (
                        <IconOrchestratorLogo className="w-6 h-6" />
                    )}
                </div>

                {/* Content */}
                <div className={`
          p-6 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-300
          ${isUser
                        ? 'bg-gradient-to-br from-primary/90 to-primary/80 text-white rounded-tr-sm shadow-primary/10 hover:shadow-primary/20'
                        : 'bg-white/5 border border-white/5 text-text rounded-tl-sm shadow-black/20 hover:bg-white/10'
                    }
        `}>
                    <p className={`whitespace-pre-wrap text-base font-light leading-relaxed ${isUser ? 'text-white/95' : 'text-text/90'}`}>{content}</p>
                    {runId && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 opacity-50 group hover:opacity-100 transition-opacity">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                            <span className="text-[10px] font-mono uppercase tracking-wider">Run ID: <span className="text-accent">{runId.substring(0, 8)}</span></span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const Playground = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Orchestrator. Ready to deploy agents." }
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

    const [selectedModel, setSelectedModel] = useState('Claude Sonnet 4.5');
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [availableTools, setAvailableTools] = useState([]);
    const [showToolSelector, setShowToolSelector] = useState(false);

    useEffect(() => {
        // Fetch available tools
        fetch(`${API_URL}/tools`)
            .then(r => r.json())
            .then(data => setAvailableTools(data.filter(t => t.enabled)))
            .catch(console.error);

        // Fetch available models
        fetch(`${API_URL}/models`)
            .then(r => r.json())
            .then(data => {
                setAvailableModels(data.models);
                setSelectedModel(data.default);
            })
            .catch(console.error);
    }, []);

    const toggleTool = (toolId) => {
        setSelectedTools(prev => {
            if (toolId === 'auto') {
                // Toggle Auto: if on, turn off. If off, turn on and clear others.
                return prev.includes('auto') ? [] : ['auto'];
            }

            // If Auto is on, turn it off and select the new tool
            if (prev.includes('auto')) {
                return [toolId];
            }

            // Normal toggle
            return prev.includes(toolId)
                ? prev.filter(t => t !== toolId)
                : [...prev, toolId];
        });
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    model: selectedModel,
                    tools: selectedTools.length > 0 ? selectedTools : undefined
                })
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                runId: data.run_id
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}. Ensure backend is running.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col lg:grid lg:grid-cols-4 gap-6 p-4 pt-20 md:p-6 md:pt-24 overflow-hidden">
            {/* Chat Area */}
            <Card className="lg:col-span-3 flex flex-col p-0 overflow-hidden border-primary/20">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <MessageBubble key={idx} {...msg} />
                    ))}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start mb-6"
                        >
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
                                    <IconOrchestratorLogo className="w-5 h-5 animate-pulse" />
                                </div>
                                <div className="bg-surface border border-border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-transparent relative z-20">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* Tool Selector Chips */}
                        <motion.div
                            layout
                            className="flex flex-wrap items-center gap-2 justify-center"
                        >
                            <button
                                onClick={() => setShowToolSelector(!showToolSelector)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 border
                                    ${showToolSelector || selectedTools.length > 0
                                        ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                                        : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:border-white/20 hover:text-white'
                                    }
                                `}
                            >
                                <IconBrain className={`w-4 h-4 ${showToolSelector ? 'animate-pulse' : ''}`} />
                                {selectedTools.length > 0 ? `${selectedTools.length} Active` : 'Tools'}
                            </button>

                            <AnimatePresence>
                                {showToolSelector && (
                                    <>
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={() => toggleTool('auto')}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                                ${selectedTools.includes('auto')
                                                    ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_10px_-2px_rgba(168,85,247,0.4)]'
                                                    : 'bg-surface border-border text-text-muted hover:border-text-muted'
                                                }
                                            `}
                                        >
                                            Auto Mode
                                        </motion.button>
                                        {availableTools.map(tool => (
                                            <motion.button
                                                key={tool.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => toggleTool(tool.id)}
                                                className={`
                                                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                                    ${selectedTools.includes(tool.id)
                                                        ? 'bg-accent/20 border-accent text-accent shadow-[0_0_10px_-2px_rgba(6,182,212,0.4)]'
                                                        : 'bg-surface border-border text-text-muted hover:border-text-muted'
                                                    }
                                                `}
                                            >
                                                {tool.name}
                                            </motion.button>
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Input Bar */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center bg-surface border border-white/10 rounded-2xl p-2 shadow-2xl">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Type a command or ask a question..."
                                    disabled={loading}
                                    className="flex-1 bg-transparent border-none px-4 py-3 text-text placeholder:text-text-muted focus:ring-0 focus:outline-none text-base"
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={loading || !input.trim()}
                                    className={`
                                        ml-2 px-4 py-2 rounded-xl transition-all duration-300
                                        ${input.trim()
                                            ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30'
                                            : 'bg-white/5 text-text-muted cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <IconSend className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono opacity-50">
                                AI Orchestrator v1.0 • Local Execution
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card>
                    <h3 className="font-display font-bold text-lg mb-4">Session Info</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-mono text-text-muted uppercase">Model</label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full mt-1 bg-surface-highlight border border-border rounded-lg px-2 py-1.5 text-sm text-primary focus:outline-none focus:border-primary"
                            >
                                {availableModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-mono text-text-muted uppercase">Status</label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm">Connected</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-mono text-text-muted uppercase">Active Tools</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedTools.length > 0 ? (
                                    selectedTools.map(t => (
                                        <span key={t} className="px-2 py-1 rounded-md bg-surface-highlight border border-border text-xs text-primary">
                                            {t}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-text-muted italic">Auto-detect</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
