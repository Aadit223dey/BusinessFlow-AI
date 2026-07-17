import { z } from "zod";

/**
 * Onboarding Wizard Validation Schemas
 *
 * Defines per-step validation constraints for the 8-phase
 * workspace setup engine. Uses Zod for compile-time type inference
 * and runtime validation of form inputs.
 */

// ============================================================
// Step 1: Business Identity
// ============================================================
export const businessIdentitySchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be under 100 characters")
    .trim(),
  category: z
    .string()
    .min(1, "Please select a business category"),
});

export type BusinessIdentityData = z.infer<typeof businessIdentitySchema>;

// ============================================================
// Step 2: Contact Information
// ============================================================
export const contactInfoSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Please enter a valid phone number (E.164 format, e.g. +1234567890)"
    ),
});

export type ContactInfoData = z.infer<typeof contactInfoSchema>;

// ============================================================
// Step 3: Business Address
// ============================================================
export const businessAddressSchema = z.object({
  addressLine1: z
    .string()
    .min(3, "Address must be at least 3 characters")
    .max(200, "Address must be under 200 characters")
    .trim(),
  addressLine2: z
    .string()
    .max(200, "Address line 2 must be under 200 characters")
    .trim(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be under 100 characters")
    .trim(),
  state: z
    .string()
    .min(1, "State / Region is required")
    .max(100, "State must be under 100 characters")
    .trim(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code must be under 20 characters")
    .trim(),
  country: z
    .string()
    .min(1, "Country is required"),
});

export type BusinessAddressData = z.infer<typeof businessAddressSchema>;

// ============================================================
// Step 4: Regional Settings
// ============================================================
export const regionalSettingsSchema = z.object({
  currency: z
    .string()
    .min(1, "Please select a currency"),
  timezone: z
    .string()
    .min(1, "Please select a timezone"),
});

export type RegionalSettingsData = z.infer<typeof regionalSettingsSchema>;

// ============================================================
// Step 5: Working Hours
// ============================================================
const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export const workingHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

export type WorkingHoursData = z.infer<typeof workingHoursSchema>;

// ============================================================
// Step 6: Appointment Settings
// ============================================================
export const appointmentSettingsSchema = z.object({
  appointmentDuration: z
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
  bufferTime: z
    .number()
    .min(0, "Buffer time cannot be negative")
    .max(120, "Buffer time cannot exceed 2 hours"),
  maxAdvanceBookingDays: z
    .number()
    .min(1, "Must allow at least 1 day advance booking")
    .max(365, "Cannot exceed 1 year advance booking"),
});

export type AppointmentSettingsData = z.infer<typeof appointmentSettingsSchema>;

// ============================================================
// Step 7: Logo Upload
// ============================================================
export const logoUploadSchema = z.object({
  logoFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Logo file must be under 5MB"
    )
    .refine(
      (file) =>
        !file ||
        ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Logo must be PNG, JPEG, or WebP format"
    ),
});

export type LogoUploadData = z.infer<typeof logoUploadSchema>;

// ============================================================
// Step 8: Review & Confirm (no extra validation — reads prior steps)
// ============================================================
export const reviewConfirmSchema = z.object({
  confirmed: z.literal(true, {
    errorMap: () => ({ message: "Please confirm your details to continue" }),
  }),
});

export type ReviewConfirmData = z.infer<typeof reviewConfirmSchema>;

// ============================================================
// Aggregate form data across all steps
// ============================================================
export interface OnboardingFormData {
  businessIdentity: BusinessIdentityData;
  contactInfo: ContactInfoData;
  businessAddress: BusinessAddressData;
  regionalSettings: RegionalSettingsData;
  workingHours: WorkingHoursData;
  appointmentSettings: AppointmentSettingsData;
  logoUpload: LogoUploadData;
  reviewConfirm: ReviewConfirmData;
}

// ============================================================
// Step metadata
// ============================================================
export interface StepMeta {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const ONBOARDING_STEPS: StepMeta[] = [
  { id: 0, title: "Business Identity", description: "Name your workspace", icon: "Building2" },
  { id: 1, title: "Contact Info", description: "How customers reach you", icon: "Phone" },
  { id: 2, title: "Address", description: "Your business location", icon: "MapPin" },
  { id: 3, title: "Region & Currency", description: "Locale preferences", icon: "Globe" },
  { id: 4, title: "Working Hours", description: "Set your schedule", icon: "Clock" },
  { id: 5, title: "Appointments", description: "Booking configuration", icon: "CalendarClock" },
  { id: 6, title: "Brand Logo", description: "Upload your identity", icon: "ImagePlus" },
  { id: 7, title: "Review", description: "Confirm and launch", icon: "CheckCircle" },
];

// ============================================================
// Constants
// ============================================================
export const BUSINESS_CATEGORIES = [
  "Salon & Spa",
  "Healthcare & Medical",
  "Fitness & Wellness",
  "Professional Services",
  "Education & Tutoring",
  "Home Services",
  "Automotive",
  "Legal Services",
  "Financial Services",
  "Real Estate",
  "Restaurant & Food",
  "Retail & Shopping",
  "Technology & IT",
  "Creative & Design",
  "Other",
] as const;

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
] as const;

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
] as const;

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "America/Sao_Paulo",
  "America/Mexico_City",
] as const;

// ============================================================
// Default form values
// ============================================================
export const DEFAULT_WORKING_HOURS: WorkingHoursData = {
  monday: { enabled: true, open: "09:00", close: "17:00" },
  tuesday: { enabled: true, open: "09:00", close: "17:00" },
  wednesday: { enabled: true, open: "09:00", close: "17:00" },
  thursday: { enabled: true, open: "09:00", close: "17:00" },
  friday: { enabled: true, open: "09:00", close: "17:00" },
  saturday: { enabled: false, open: "09:00", close: "17:00" },
  sunday: { enabled: false, open: "09:00", close: "17:00" },
};

export const DEFAULT_ONBOARDING_DATA: OnboardingFormData = {
  businessIdentity: { businessName: "", category: "" },
  contactInfo: { email: "", phone: "" },
  businessAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  },
  regionalSettings: { currency: "USD", timezone: "America/New_York" },
  workingHours: DEFAULT_WORKING_HOURS,
  appointmentSettings: {
    appointmentDuration: 30,
    bufferTime: 0,
    maxAdvanceBookingDays: 30,
  },
  logoUpload: {},
  reviewConfirm: { confirmed: true },
};
