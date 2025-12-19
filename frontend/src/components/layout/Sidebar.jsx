import React from 'react';
import { motion } from 'framer-motion';
import {
    IconOrchestratorLogo,
    IconChat,
    IconInspect,
    IconTools,
    IconHome,
    IconNodes
} from '../ui/Icons';

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
        onClick={onClick}
        className={`
      w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden
      ${active ? 'text-primary' : 'text-text-muted hover:text-text hover:bg-white/5'}
    `}
        title={collapsed ? label : ''}
    >
        {/* Active Glow Background */}
        {active && (
            <motion.div
                layoutId="active-nav-bg"
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50"
                initial={false}
                transition={{ duration: 0.3 }}
            />
        )}

        {/* Active Left Border */}
        {active && (
            <motion.div
                layoutId="active-nav-border"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_2px_rgba(99,102,241,0.5)]"
            />
        )}

        <Icon className={`w-5 h-5 z-10 relative transition-colors ${active ? 'text-primary drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]' : 'text-text-muted group-hover:text-text'}`} />
        {!collapsed && (
            <span className="font-medium text-sm z-10 relative">{label}</span>
        )}
    </button>
);

export const Sidebar = ({ currentPage, onNavigate, collapsed = false }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: IconHome },
        { id: 'playground', label: 'Playground', icon: IconChat },
        { id: 'inspect', label: 'Inspect Runs', icon: IconInspect },
        { id: 'tools', label: 'Manage Tools', icon: IconTools },
        { id: 'build', label: 'Builder', icon: IconNodes },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-screen sticky top-0 border-r border-white/5 bg-background/50 backdrop-blur-3xl flex flex-col z-50 shadow-[5px_0_30px_-10px_rgba(0,0,0,0.3)]"
        >
            {/* Logo Area */}
            <div className={`p-8 pt-12 flex items-center ${collapsed ? 'justify-center' : 'gap-4'} mb-2`}>
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                    <IconOrchestratorLogo className="w-8 h-8 flex-shrink-0 text-primary relative z-10" />
                </div>
                {!collapsed && (
                    <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Orchestrator
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={currentPage === item.id}
                        onClick={() => onNavigate(item.id)}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            {/* User Profile (Bottom) */}
            <div className="p-4 border-t border-border">
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-surface-highlight cursor-pointer transition-colors`}>
                    <img
                        src="https://placehold.co/40x40/3B82F6/FFFFFF?text=A&font=sans"
                        alt="User"
                        className="w-8 h-8 rounded-full ring-2 ring-border"
                    />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Admin User</p>
                            <p className="text-xs text-text-muted truncate">admin@orchestrator.ai</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};
