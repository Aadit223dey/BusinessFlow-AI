'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Headset, 
  MessageSquare, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Search, 
  PhoneCall, 
  LifeBuoy,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
}

export default function CustomerDeskPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Inquiry');
  const [ticketMessage, setTicketMessage] = useState('');
  
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TICK-1001',
      subject: 'Appointment Rescheduling Assistance',
      category: 'Booking Help',
      status: 'In Progress',
      date: '2026-08-01',
    },
    {
      id: 'TICK-0982',
      subject: 'Invoice & Payment Query',
      category: 'Billing',
      status: 'Resolved',
      date: '2026-07-28',
    },
  ]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error('Missing Fields', { description: 'Please fill in both subject and description.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket: Ticket = {
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: ticketSubject.trim(),
        category: ticketCategory,
        status: 'Open',
        date: new Date().toISOString().split('T')[0],
      };
      setTickets([newTicket, ...tickets]);
      setTicketSubject('');
      setTicketMessage('');
      setIsSubmitting(false);
      toast.success('Ticket Submitted! 🚀', {
        description: `Your ticket (${newTicket.id}) has been created. A support specialist will respond shortly.`,
      });
    }, 600);
  };

  const faqs = [
    {
      question: 'How do I reschedule or cancel an appointment?',
      answer: 'Navigate to your Appointments page, select your active booking, and click "Reschedule" or "Cancel". Changes must be made at least 2 hours prior to start time.',
    },
    {
      question: 'Where can I download my billing receipts?',
      answer: 'All paid and pending invoices are stored securely under the Invoices section in your Customer Portal sidebar.',
    },
    {
      question: 'How do I update my contact or emergency details?',
      answer: 'Visit the Profile page to update your phone number, street address, emergency contact, or upload a new profile avatar.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8"
    >
      {/* Customer Desk Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-10 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
            <Headset className="h-4 w-4" />
            <span>Customer Service & Help Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Customer Desk 💬
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Need assistance with bookings, payments, or services? Connect directly with our support team or create a support ticket below.
          </p>

          {/* Quick Search */}
          <div className="relative max-w-md pt-2">
            <Search className="absolute left-3.5 top-5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles & FAQs..."
              className="w-full rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 pl-10 pr-4 py-3 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 p-5 backdrop-blur-xl space-y-2 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Live Chat Support</h3>
            <p className="text-xs text-muted-foreground leading-snug">Instant messaging with active service providers.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 p-5 backdrop-blur-xl space-y-2 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Direct Desk Line</h3>
            <p className="text-xs text-muted-foreground leading-snug">Dedicated phone line for priority customer inquiries.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 p-5 backdrop-blur-xl space-y-2 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Service Guarantee</h3>
            <p className="text-xs text-muted-foreground leading-snug">24/7 ticket routing with guaranteed resolution.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Create Ticket & Active Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submit Ticket Form (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Headset className="h-5 w-5 text-emerald-500" />
              <span>Submit a Help Ticket</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Have a specific issue or question? Create a ticket and track its status right here.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Subject
              </label>
              <Input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Briefly describe your request..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Booking Help">Booking Help</option>
                <option value="Billing & Payments">Billing & Payments</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </label>
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Provide details about how we can help..."
                rows={4}
                required
                className="w-full rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2">
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket to Desk'}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Support Tickets Timeline Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-emerald-500" />
              <span>Your Support Tickets</span>
            </h3>

            {tickets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No open help desk tickets.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/50 bg-muted/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {t.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Resolved'
                            ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                            : t.status === 'In Progress'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">{t.subject}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>{t.category}</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Frequently Asked Questions Section */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Quick answers to common questions about managing your client account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2">
              <h4 className="font-bold text-xs text-foreground flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{faq.question}</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
