'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CustomerEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const CustomerEmptyState: React.FC<CustomerEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
      >
        <Icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-2 text-xl font-semibold text-slate-900 dark:text-white"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-sm mb-6 text-slate-600 dark:text-slate-400"
      >
        {description}
      </motion.p>
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={onAction}
          className="px-6 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};
