import React from 'react';
import { Card } from '../components/ui/Card';

export const Build = () => {
    return (
        <div className="h-full flex items-center justify-center p-4 pt-20 md:p-6 md:pt-24">
            <Card className="text-center max-w-md">
                <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🚧</span>
                </div>
                <h2 className="text-2xl font-bold text-text mb-2">Agent Builder</h2>
                <p className="text-text-muted">
                    The visual workflow builder is currently under construction.
                    Check back soon for drag-and-drop agent orchestration.
                </p>
            </Card>
        </div>
    );
};
