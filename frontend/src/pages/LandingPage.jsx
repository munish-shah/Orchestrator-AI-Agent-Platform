import React from 'react';
import { motion } from 'framer-motion';
import { IconOrchestratorLogo, IconNodes, IconChat, IconInspect, IconTools, IconArrowRight } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';

const LandingNavbar = ({ onGetStarted }) => (
    <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-4 inset-x-0 mx-auto max-w-6xl z-50 px-4"
    >
        <div className="flex items-center justify-between px-6 py-3 bg-surface/80 backdrop-blur-xl border border-border rounded-full shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2">
                <IconOrchestratorLogo className="w-8 h-8" />
                <span className="font-display font-bold text-xl tracking-tight">Orchestrator</span>
            </div>
            <Button variant="primary" size="sm" onClick={onGetStarted} className="rounded-full px-6">
                Enter System
            </Button>
        </div>
    </motion.nav>
);

const Hero = ({ onGetStarted }) => (
    <div className="relative pt-32 pb-40 flex flex-col items-center text-center px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[600px] bg-secondary/10 rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 max-w-4xl mx-auto"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border mb-8">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">System Online</span>
            </div>

            <h1 className="font-display font-bold text-6xl md:text-8xl text-text leading-[1.1] tracking-tight mb-8">
                Autonomous Agent <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Orchestration Layer
                </span>
            </h1>

            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                A personal workspace for building, testing, and observing advanced AI agents.
                Designed for developer productivity and deep observability.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="primary" size="lg" onClick={onGetStarted} className="h-14 px-8 text-lg rounded-full shadow-primary/25">
                    Initialize
                    <IconArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="mt-24 relative z-10"
        >
            <div className="relative rounded-2xl border border-border bg-[#0A0A0A] shadow-2xl shadow-primary/10 p-2 max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl pointer-events-none" />
                <div className="rounded-xl overflow-hidden border border-border/50 bg-surface aspect-[16/9] relative group">
                    {/* Mock UI Interface */}
                    <div className="absolute inset-0 flex">
                        <div className="w-64 border-r border-border bg-surface/50 p-4 space-y-3 hidden md:block">
                            <div className="h-8 w-32 bg-surface-highlight rounded-md mb-6" />
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-full bg-surface-highlight/50 rounded-lg" />)}
                        </div>
                        <div className="flex-1 p-8">
                            <div className="flex gap-4 mb-8">
                                <div className="h-32 flex-1 bg-surface-highlight/30 rounded-xl border border-border/50" />
                                <div className="h-32 flex-1 bg-surface-highlight/30 rounded-xl border border-border/50" />
                                <div className="h-32 flex-1 bg-surface-highlight/30 rounded-xl border border-border/50" />
                            </div>
                            <div className="h-64 w-full bg-surface-highlight/20 rounded-xl border border-border/50" />
                        </div>
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
                </div>
            </div>
        </motion.div>
    </div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="p-8 rounded-3xl bg-surface/50 border border-border hover:border-primary/50 hover:bg-surface-highlight/50 transition-all duration-300 group">
        <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display font-bold text-xl text-text mb-3">{title}</h3>
        <p className="text-text-muted leading-relaxed">{description}</p>
    </div>
);

const Features = () => (
    <div className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
                icon={IconNodes}
                title="Visual Workflow Builder"
                description="Design complex agent behaviors with a drag-and-drop interface."
            />
            <FeatureCard
                icon={IconChat}
                title="Model Playground"
                description="Test prompts and tools with any LLM. Switch models instantly."
            />
            <FeatureCard
                icon={IconInspect}
                title="Deep Observability"
                description="Trace every step of your agent's execution. Debug failures with full context."
            />
        </div>
    </div>
);

export const LandingPage = ({ navigate }) => {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30">
            <LandingNavbar onGetStarted={() => navigate('dashboard')} />
            <Hero onGetStarted={() => navigate('dashboard')} />
            <Features />
        </div>
    );
};
