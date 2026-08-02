'use client';

import { FileText } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function InvoicesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
      <CustomerEmptyState
        icon={FileText}
        title="No Invoices Issued"
        description="Invoices from your service providers will appear here for easy access and payment."
      />
    </motion.div>
  );
}
