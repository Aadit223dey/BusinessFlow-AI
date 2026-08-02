'use client';

import { Bell } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      <CustomerEmptyState
        icon={Bell}
        title="All Caught Up"
        description="System notifications, booking reminders, and updates will be shown here."
      />
    </motion.div>
  );
}
