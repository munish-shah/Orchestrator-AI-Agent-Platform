import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { IconBrain, IconCheck, IconCalculator, IconOrchestratorLogo } from '../components/ui/Icons';

const API_URL = 'http://localhost:8000/api';

// --- Step Components ---

const StepContainer = ({ children, icon: Icon, title, isLast, color }) => {
    const colorMap = {
        blue: 'text-primary border-primary/30 bg-primary/10',
        purple: 'text-secondary border-secondary/30 bg-secondary/10',
        orange: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
        green: 'text-green-400 border-green-400/30 bg-green-400/10'
    };

    return (
        <div className="relative pl-12 pb-12 last:pb-0">
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />
            )}

            {/* Icon Bubble */}
            <div className={`
                absolute left-0 top-0 w-8 h-8 rounded-full border flex items-center justify-center z-10 
                bg-background shadow-[0_0_15px_-5px_rgba(0,0,0,0.5)]
                ${color === 'blue' ? 'border-primary text-primary' : ''}
                ${color === 'purple' ? 'border-secondary text-secondary' : ''}
                ${color === 'orange' ? 'border-orange-400 text-orange-400' : ''}
                ${color === 'green' ? 'border-green-400 text-green-400' : ''}
            `}>
                <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold font-mono uppercase tracking-wider ${color === 'blue' ? 'text-primary' :
                        color === 'purple' ? 'text-secondary' :
                            color === 'orange' ? 'text-orange-400' :
                                color === 'green' ? 'text-green-400' : 'text-text-muted'
                        }`}>{title}</span>
                    <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel rounded-xl overflow-hidden"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

const UserRequestStep = ({ content }) => (
    <div className="p-4 bg-primary/5">
        <p className="text-sm text-text font-medium">{content}</p>
    </div>
);

const AgentThoughtStep = ({ content }) => (
    <div className="p-4 bg-secondary/5">
        <p className="text-xs text-text-muted font-mono whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
);

const ToolCallStep = ({ toolName, params }) => (
    <div>
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <IconCalculator className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-bold text-orange-300">Tool Call: {toolName}</span>
        </div>
        <div className="p-4 bg-black/20">
            <pre className="text-[10px] text-text-muted font-mono overflow-x-auto custom-scrollbar">
                {JSON.stringify(params, null, 2)}
            </pre>
        </div>
    </div>
);

const ToolResultStep = ({ toolName, result }) => (
    <div>
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 bg-green-500/5">
            <IconCheck className="w-3 h-3 text-green-400" />
            <span className="text-xs font-bold text-green-300">Output: {toolName}</span>
        </div>
        <div className="p-4 bg-black/20">
            <pre className="text-[10px] text-text-muted font-mono overflow-x-auto custom-scrollbar">
                {result}
            </pre>
        </div>
    </div>
);

const AgentResponseStep = ({ content }) => (
    <div className="p-4 bg-primary/5">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
                <IconOrchestratorLogo className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-text break-words min-w-0 flex-1 leading-relaxed">{content}</p>
        </div>
    </div>
);

export const Runs = () => {
    const [runs, setRuns] = useState([]);
    const [selectedRunId, setSelectedRunId] = useState(null);
    const [runDetails, setRunDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/runs`)
            .then(r => r.json())
            .then(data => {
                setRuns(data);
                if (data.length > 0) setSelectedRunId(data[0].id);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (selectedRunId) {
            fetch(`${API_URL}/runs/${selectedRunId}`)
                .then(r => r.json())
                .then(setRunDetails)
                .catch(console.error);
        }
    }, [selectedRunId]);

    const renderStep = (step, index, total) => {
        const isLast = index === total - 1;
        const content = step.content;

        switch (step.type) {
            case 'user-request':
                return (
                    <StepContainer key={step.id} icon={IconOrchestratorLogo} title="User Request" color="blue" isLast={isLast}>
                        <UserRequestStep content={content.content || content} />
                    </StepContainer>
                );
            case 'agent-thought':
                return (
                    <StepContainer key={step.id} icon={IconBrain} title="Thinking" color="purple" isLast={isLast}>
                        <AgentThoughtStep content={content.content || content} />
                    </StepContainer>
                );
            case 'tool-call':
                return (
                    <StepContainer key={step.id} icon={IconCalculator} title="Tool Call" color="orange" isLast={isLast}>
                        <ToolCallStep toolName={content.toolName} params={content.params} />
                    </StepContainer>
                );
            case 'tool-result':
                return (
                    <StepContainer key={step.id} icon={IconCheck} title="Tool Output" color="green" isLast={isLast}>
                        <ToolResultStep toolName={content.toolName} result={content.result} />
                    </StepContainer>
                );
            case 'agent-response':
                return (
                    <StepContainer key={step.id} icon={IconOrchestratorLogo} title="Final Response" color="blue" isLast={isLast}>
                        <AgentResponseStep content={content.content || content} />
                    </StepContainer>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 pt-20 md:p-6 md:pt-24 overflow-hidden">
            {/* Runs List */}
            <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-sm">
                    <h2 className="font-display font-bold text-lg">Run History</h2>
                    <p className="text-xs text-text-muted">{runs.length} total runs</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {runs.map(run => (
                        <button
                            key={run.id}
                            onClick={() => setSelectedRunId(run.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${selectedRunId === run.id
                                ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/10'
                                : 'hover:bg-surface-highlight border-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold text-sm ${selectedRunId === run.id ? 'text-primary' : 'text-text'}`}>
                                    {run.name}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${run.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {run.status}
                                </span>
                            </div>
                            <p className="text-xs text-text-muted line-clamp-2">{run.user_query}</p>
                            <p className="text-[10px] text-text-muted mt-2 opacity-60">{run.time}</p>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Timeline */}
            <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col bg-background/50">
                <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-sm flex justify-between items-center">
                    <h2 className="font-display font-bold text-lg">Execution Trace</h2>
                    {runDetails && (
                        <span className="text-xs font-mono text-text-muted">ID: {runDetails.id.split('-')[0]}</span>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {runDetails ? (
                        <div className="max-w-3xl mx-auto">
                            {runDetails.steps.map((step, idx) => renderStep(step, idx, runDetails.steps.length))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-muted">
                            Select a run to view details
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
