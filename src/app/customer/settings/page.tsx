'use client';

import { Settings } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <CustomerEmptyState
        icon={Settings}
        title="Account Security & Notification Preferences"
        description="Manage your password, notification preferences, and account security settings."
      />
    </motion.div>
  );
}
