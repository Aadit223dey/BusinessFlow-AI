'use client';

import { useRouter } from 'next/navigation';
import { CalendarCheck } from 'lucide-react';
import { CustomerEmptyState } from '@/components/shared/CustomerEmptyState';
import { motion } from 'framer-motion';

export default function AppointmentsPage() {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
      <CustomerEmptyState
        icon={CalendarCheck}
        title="No Appointments Yet"
        description="When you book services, your upcoming and past appointments will appear here."
        actionLabel="Browse Services"
        onAction={() => router.push('/customer/services')}
      />
    </motion.div>
  );
}
