'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/toast';
import { env } from '@/config/env';

interface AvatarUploadZoneProps {
  currentAvatarUrl: string | null;
  userId: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUploadZone({ currentAvatarUrl, userId, onUploadComplete }: AvatarUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', { description: 'File size must be less than 5MB' });
      return;
    }

    setIsUploading(true);
    try {
      const filePath = `${userId}/avatar.png`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const publicUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      onUploadComplete(publicUrl);
      toast.success('Photo Updated', { description: 'Profile photo updated successfully' });
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error('Upload Failed', { description: error instanceof Error ? error.message : 'Could not upload photo' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-pointer flex items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
            {userId ? userId.substring(0, 2).toUpperCase() : 'U'}
          </span>
        )}

        <AnimatePresence>
          {(isHovered || isUploading) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white"
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium tracking-wide uppercase text-center leading-tight">Change<br/>Photo</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png,image/jpeg"
        className="hidden"
      />
    </div>
  );
}
