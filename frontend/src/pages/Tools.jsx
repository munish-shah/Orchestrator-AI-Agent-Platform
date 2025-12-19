import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { IconCalculator, IconSearch, IconFile, IconTools } from '../components/ui/Icons';

const API_URL = 'http://localhost:8000/api';

const ToolCard = ({ tool, active, onClick }) => {
    const iconMap = {
        'IconCalculator': IconCalculator,
        'IconSearch': IconSearch,
        'IconFile': IconFile,
    };
    const Icon = iconMap[tool.icon] || IconTools;

    return (
        <button
            onClick={onClick}
            className={`
        w-full text-left p-4 rounded-2xl border transition-all duration-300 group
        ${active
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                    : 'bg-surface border-border hover:border-primary/50 hover:bg-surface-highlight'
                }
      `}
        >
            <div className="flex items-center gap-4">
                <div className={`
          p-3 rounded-xl transition-colors
          ${active ? 'bg-primary text-white' : 'bg-surface-highlight text-text-muted group-hover:text-primary'}
        `}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className={`font-bold ${active ? 'text-primary' : 'text-text'}`}>{tool.name}</h3>
                    <p className="text-xs text-text-muted mt-1">{tool.enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
            </div>
        </button>
    );
};

export const Tools = () => {
    const [tools, setTools] = useState([]);
    const [selectedToolId, setSelectedToolId] = useState(null);
    const [toolDetails, setToolDetails] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/tools`)
            .then(r => r.json())
            .then(data => {
                setTools(data);
                if (data.length > 0) setSelectedToolId(data[0].id);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedToolId) {
            fetch(`${API_URL}/tools/${selectedToolId}`)
                .then(r => r.json())
                .then(setToolDetails)
                .catch(console.error);
        }
    }, [selectedToolId]);

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 pt-20 md:p-6 md:pt-24 overflow-hidden">
            {/* Tool Grid */}
            <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                <h2 className="font-display font-bold text-xl mb-6">Available Tools</h2>
                {tools.map(tool => (
                    <ToolCard
                        key={tool.id}
                        tool={tool}
                        active={selectedToolId === tool.id}
                        onClick={() => setSelectedToolId(tool.id)}
                    />
                ))}
            </div>

            {/* Tool Details */}
            <div className="lg:col-span-2 h-full">
                {toolDetails ? (
                    <Card className="h-full flex flex-col">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h1 className="font-display font-bold text-3xl text-text">{toolDetails.name}</h1>
                                <p className="text-lg text-text-muted mt-2">{toolDetails.description}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${toolDetails.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {toolDetails.enabled ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto">
                            <div>
                                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Schema Definition</h3>
                                <div className="bg-background border border-border rounded-xl p-6 font-mono text-sm text-blue-300 overflow-x-auto shadow-inner">
                                    <pre>{JSON.stringify(toolDetails.schema, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center text-text-muted">
                        Select a tool to view configuration
                    </div>
                )}
            </div>
        </div>
    );
};
