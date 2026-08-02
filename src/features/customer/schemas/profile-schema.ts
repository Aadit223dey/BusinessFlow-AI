import { z } from 'zod';

export const customerProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
  address: z.string().max(200, 'Address is too long').optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  emergency_contact_name: z.string().max(100, 'Name is too long').optional().or(z.literal('')),
  emergency_contact_phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
});

export type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;
