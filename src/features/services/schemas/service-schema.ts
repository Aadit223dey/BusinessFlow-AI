import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  categoryId: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
  price: z
    .number({ invalid_type_error: "Price must be a valid number" })
    .min(0, "Price cannot be negative")
    .max(100000, "Price exceeds maximum allowed threshold"),
  durationMinutes: z
    .number({ invalid_type_error: "Duration is required" })
    .int("Duration must be an integer")
    .min(5, "Minimum duration is 5 minutes")
    .max(1440, "Maximum duration is 24 hours (1440 minutes)"),
  bufferTimeMinutes: z
    .number({ invalid_type_error: "Buffer time must be a number" })
    .int("Buffer time must be an integer")
    .min(0, "Buffer time cannot be negative"),
  isActive: z.boolean(),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
