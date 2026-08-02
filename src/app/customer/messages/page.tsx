'use client';

import { MessageSquare } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function MessagesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
      <CustomerEmptyState
        icon={MessageSquare}
        title="No Messages"
        description="Direct messages from your service providers will appear here."
      />
    </motion.div>
  );
}
