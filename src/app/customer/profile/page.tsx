'use client';

import { motion } from 'framer-motion';
import { CustomerProfileForm } from '@/features/customer/components/CustomerProfileForm';

export default function CustomerProfilePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-5xl mx-auto w-full space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information, contact details, and emergency contacts.</p>
      </div>

      <CustomerProfileForm />
    </motion.div>
  );
}
