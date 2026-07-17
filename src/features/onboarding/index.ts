/**
 * Onboarding Feature Module — Public API
 *
 * Re-exports all public interfaces, schemas, hooks, and components
 * for the onboarding feature domain.
 */

export { useOnboardingDraft } from "./hooks/use-onboarding-draft";
export { BusinessPreviewCard } from "./components/BusinessPreviewCard";
export { OnboardingProgress } from "./components/OnboardingProgress";
export { WizardSteps } from "./components/WizardSteps";
export type { WizardStepsProps } from "./components/WizardSteps";

export {
  businessIdentitySchema,
  contactInfoSchema,
  businessAddressSchema,
  regionalSettingsSchema,
  workingHoursSchema,
  appointmentSettingsSchema,
  logoUploadSchema,
  reviewConfirmSchema,
  ONBOARDING_STEPS,
  BUSINESS_CATEGORIES,
  CURRENCIES,
  COUNTRIES,
  TIMEZONES,
  DEFAULT_WORKING_HOURS,
  DEFAULT_ONBOARDING_DATA,
} from "./schemas/onboarding-schemas";

export type {
  BusinessIdentityData,
  ContactInfoData,
  BusinessAddressData,
  RegionalSettingsData,
  WorkingHoursData,
  AppointmentSettingsData,
  LogoUploadData,
  ReviewConfirmData,
  OnboardingFormData,
  StepMeta,
} from "./schemas/onboarding-schemas";
