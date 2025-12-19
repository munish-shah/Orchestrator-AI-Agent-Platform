import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export const AppShell = ({ children, currentPage, onNavigate }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-text selection:bg-primary/30">
            {currentPage !== 'landing' && (
                <Sidebar
                    currentPage={currentPage}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                />
            )}

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background to-transparent pointer-events-none opacity-50" />
                <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none opacity-20" />
                <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-accent/10 rounded-full blur-[128px] pointer-events-none opacity-20" />

                {/* Content Area */}
                <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="flex-1 h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
