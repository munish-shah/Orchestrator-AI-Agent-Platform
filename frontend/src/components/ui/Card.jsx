import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, borderColor: '#3B82F6' } : {}}
            className={`glass-panel rounded-2xl p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};
