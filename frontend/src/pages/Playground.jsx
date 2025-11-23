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
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
        >
            <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border
          ${isUser
                        ? 'bg-primary border-primary text-white'
                        : 'bg-surface border-border text-primary'
                    }
        `}>
                    {isUser ? (
                        <span className="text-xs font-bold">U</span>
                    ) : (
                        <IconOrchestratorLogo className="w-5 h-5" />
                    )}
                </div>

                {/* Content */}
                <div className={`
          p-4 rounded-2xl shadow-sm border
          ${isUser
                        ? 'bg-primary text-white border-primary rounded-tr-none'
                        : 'bg-surface text-text border-border rounded-tl-none'
                    }
        `}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
                    {runId && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 opacity-60">
                            <span className="text-[10px] font-mono uppercase tracking-wider">Run ID: {runId.substring(0, 8)}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
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
                <div className="p-4 bg-surface/50 border-t border-border backdrop-blur-md">
                    {/* Tool Selector Bar */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                        <button
                            onClick={() => setShowToolSelector(!showToolSelector)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${showToolSelector || selectedTools.length > 0
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-surface border-border text-text-muted hover:text-text'
                                }`}
                        >
                            <IconBrain className="w-3 h-3" />
                            {selectedTools.length > 0 ? `${selectedTools.length} Tools Active` : 'Add Tools'}
                        </button>

                        {showToolSelector && (
                            <>
                                <button
                                    onClick={() => toggleTool('auto')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedTools.includes('auto')
                                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                        : 'bg-surface border-border text-text-muted hover:border-text-muted'
                                        }`}
                                >
                                    {selectedTools.includes('auto') && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                    Auto
                                </button>
                                {availableTools.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => toggleTool(tool.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedTools.includes(tool.id)
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-surface border-border text-text-muted hover:border-text-muted'
                                            }`}
                                    >
                                        {selectedTools.includes(tool.id) && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                        {tool.name}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Command your agent..."
                            disabled={loading}
                            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="px-6"
                        >
                            <IconSend className="w-5 h-5" />
                        </Button>
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
