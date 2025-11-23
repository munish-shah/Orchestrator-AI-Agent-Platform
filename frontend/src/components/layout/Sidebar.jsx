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
      w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
      ${active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text hover:bg-surface-highlight'}
    `}
        title={collapsed ? label : ''}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text'}`} />
        {!collapsed && (
            <span className="font-medium text-sm">{label}</span>
        )}
        {active && !collapsed && (
            <motion.div
                layoutId="active-pill"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
            />
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
            animate={{ width: collapsed ? 80 : 260 }}
            className="h-screen sticky top-0 border-r border-border bg-surface/50 backdrop-blur-xl flex flex-col z-50"
        >
            {/* Logo Area */}
            <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <IconOrchestratorLogo className="w-8 h-8 flex-shrink-0" />
                {!collapsed && (
                    <span className="font-display font-bold text-xl tracking-tight">Orchestrator</span>
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
