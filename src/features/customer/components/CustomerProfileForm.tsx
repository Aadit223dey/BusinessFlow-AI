'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { customerProfileSchema, CustomerProfileFormData } from '@/features/customer/schemas/profile-schema';
import { AvatarUploadZone } from './AvatarUploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';

export function CustomerProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || profile.firstName || '',
        last_name: profile.last_name || profile.lastName || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address: profile.address || '',
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || '',
      });
      const currentAvatar = profile.avatar_url || profile.avatarUrl;
      if (currentAvatar) {
        setAvatarUrl(currentAvatar);
      }
    }
  }, [profile, reset]);

  const onSubmit = async (data: CustomerProfileFormData) => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          date_of_birth: data.date_of_birth || null,
          address: data.address || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile Updated', { description: 'Your profile has been saved successfully.' });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Could not save profile';
      console.error('Update error:', error);
      toast.error('Update Failed', { description: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
  };

  if (!user) return null;

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
      {children}
    </label>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8 w-full max-w-3xl mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Avatar Upload Header */}
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-8">
          <AvatarUploadZone
            currentAvatarUrl={avatarUrl}
            userId={user.id}
            onUploadComplete={handleAvatarUpload}
          />
          <div className="flex flex-col justify-center text-center sm:text-left">
            <h3 className="text-xl font-bold">Profile Photo</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload a recognizable photo so businesses know who you are.</p>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Personal Identity Fields */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label>First Name</Label>
              <Input {...register('first_name')} placeholder="John" />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register('last_name')} placeholder="Doe" />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input value={user.email || ''} disabled className="bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input {...register('phone')} placeholder="+1 (555) 000-0000" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" {...register('date_of_birth')} />
              {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth.message}</p>}
            </div>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Address Fields */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Address</h4>
          <div>
            <Label>Street Address</Label>
            <Input {...register('address')} placeholder="123 Main St, Apt 4B" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Emergency Contact Fields */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Emergency Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label>Contact Name</Label>
              <Input {...register('emergency_contact_name')} placeholder="Jane Doe" />
              {errors.emergency_contact_name && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_name.message}</p>}
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input {...register('emergency_contact_phone')} placeholder="+1 (555) 111-1111" />
              {errors.emergency_contact_phone && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_phone.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSaving} variant="primary">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </div>

      </form>
    </motion.div>
  );
}
