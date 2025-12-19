import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IconChat, IconNodes, IconInspect, IconArrowRight } from '../components/ui/Icons';

const StatCard = ({ label, value, trend, trendUp }) => (
    <Card className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconNodes className="w-24 h-24" />
        </div>
        <h3 className="text-text-muted text-sm font-medium uppercase tracking-wider">{label}</h3>
        <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-text">{value}</span>
            {trend && (
                <span className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                    {trend}
                </span>
            )}
        </div>
    </Card>
);

const ActionCard = ({ title, description, icon: Icon, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="text-left w-full"
    >
        <Card className="h-full border-l-4 border-l-primary hover:bg-surface-highlight transition-colors group">
            <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-surface border border-border group-hover:border-primary/50 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <IconArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-text group-hover:text-primary transition-colors">{title}</h3>
            <p className="mt-1 text-sm text-text-muted">{description}</p>
        </Card>
    </motion.button>
);

export const Dashboard = ({ onNavigate }) => {
    const [stats, setStats] = React.useState({ total: 0, active: 0, successRate: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('http://localhost:8000/api/runs/stats/summary')
            .then(res => res.json())
            .then(data => {
                const total = data.total;
                const successRate = total > 0 ? ((data.completed / total) * 100).toFixed(1) : 0;
                setStats({
                    total: total,
                    active: data.running,
                    successRate: successRate
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch stats:", err);
                setLoading(false);
            });
    }, []);

    const connected = true; // Hardcoded for now, or fetch from health check

    return (
        <div className="h-full overflow-y-auto p-4 pt-20 md:p-8 md:pt-24 scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Command Center
                        </h1>
                        <p className="text-text-muted mt-1">System status and agent metrics.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:bg-surface-highlight transition-colors text-sm font-medium">
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            {connected ? 'System Online' : 'Offline'}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Total Runs" value={loading ? "-" : stats.total} trend={null} trendUp={true} />
                    <StatCard label="Active Agents" value={loading ? "-" : stats.active} trend={null} trendUp={true} />
                    <StatCard label="Success Rate" value={loading ? "-" : `${stats.successRate}%`} trend={null} trendUp={true} />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ActionCard
                            title="Launch Playground"
                            description="Test your agents with real-time chat and debugging."
                            icon={IconChat}
                            onClick={() => onNavigate('playground')}
                        />
                        <ActionCard
                            title="Inspect History"
                            description="Deep dive into past execution traces and logs."
                            icon={IconInspect}
                            onClick={() => onNavigate('inspect')}
                        />
                        <ActionCard
                            title="Build Workflow"
                            description="Design new agent behaviors visually."
                            icon={IconNodes}
                            onClick={() => onNavigate('build')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
