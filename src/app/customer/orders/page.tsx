'use client';

import { ShoppingBag } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <CustomerEmptyState
        icon={ShoppingBag}
        title="No Orders Found"
        description="Your product orders and purchase history will be tracked here."
      />
    </motion.div>
  );
}
