'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CustomerAppointmentItem {
  id: string;
  service_name?: string;
  business_name?: string;
  start_time?: string;
  status?: string;
}

export interface CustomerActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface ConnectedBusinessItem {
  id: string;
  name: string;
  category?: string;
}

export function useCustomerAppointments(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer', 'appointments', userId],
    queryFn: async (): Promise<CustomerAppointmentItem[]> => {
      if (!userId) return [];
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', userId);

        if (error) {
          console.warn('⚠️ [Appointments Query] Table unavailable or query returned error. Falling back to empty array.', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('⚠️ [Appointments Query] Exception caught. Falling back to empty array.', err);
        return [];
      }
    },
    enabled: !!userId,
    initialData: [],
    retry: false,
    staleTime: 300000,
  });
}

export function useCustomerActivities(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer', 'activities', userId],
    queryFn: async (): Promise<CustomerActivityItem[]> => {
      if (!userId) return [];
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.warn('⚠️ [Activity Query] Table unavailable or query returned error. Falling back to empty array.', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('⚠️ [Activity Query] Exception caught. Falling back to empty array.', err);
        return [];
      }
    },
    enabled: !!userId,
    initialData: [],
    retry: false,
    staleTime: 300000,
  });
}

export function useCustomerConnectedBusinesses(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer', 'connected-businesses', userId],
    queryFn: async (): Promise<ConnectedBusinessItem[]> => {
      if (!userId) return [];
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name')
          .limit(5);

        if (error) {
          console.warn('⚠️ [Connected Businesses Query] Table query error. Falling back to empty array.', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('⚠️ [Connected Businesses Query] Exception caught. Falling back to empty array.', err);
        return [];
      }
    },
    enabled: !!userId,
    initialData: [],
    retry: false,
    staleTime: 300000,
  });
}

export function useCustomerSummaryStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer', 'summary-stats', userId],
    queryFn: async () => {
      return {
        upcomingBookings: 0,
        completedServices: 0,
        connectedBusinesses: 0,
        activeInvoices: 0,
      };
    },
    enabled: !!userId,
    initialData: {
      upcomingBookings: 0,
      completedServices: 0,
      connectedBusinesses: 0,
      activeInvoices: 0,
    },
    retry: false,
    staleTime: 300000,
  });
}
