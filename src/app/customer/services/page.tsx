'use client';

import { Briefcase } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function ServicesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Services</h1>
      <CustomerEmptyState
        icon={Briefcase}
        title="No Saved Services"
        description="Explore services offered by local businesses and save your favorites."
      />
    </motion.div>
  );
}
