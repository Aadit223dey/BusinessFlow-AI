"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Phone,
  MapPin,
  Globe,
  Clock,
  CalendarClock,
  ImagePlus,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type OnboardingFormData,
  type BusinessIdentityData,
  type ContactInfoData,
  type BusinessAddressData,
  type RegionalSettingsData,
  type WorkingHoursData,
  type AppointmentSettingsData,
  businessIdentitySchema,
  contactInfoSchema,
  businessAddressSchema,
  regionalSettingsSchema,
  workingHoursSchema,
  appointmentSettingsSchema,
  BUSINESS_CATEGORIES,
  CURRENCIES,
  COUNTRIES,
  TIMEZONES,
  DEFAULT_WORKING_HOURS,
} from "@/features/onboarding/schemas/onboarding-schemas";

// ============================================================
// Shared animation variants
// ============================================================
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

// ============================================================
// Shared Step Layout wrapper
// ============================================================
function StepContainer({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
          <Icon className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Shared Select primitive
// ============================================================
function SelectField({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        className={`flex w-full h-10 rounded-lg border bg-transparent px-3 py-2 text-sm text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-destructive" : "border-border"
        }`}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// Shared labeled input
// ============================================================
function LabeledInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <Input hasError={!!error} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// Step 1: Business Identity
// ============================================================
function Step1BusinessIdentity({
  data,
  onSubmit,
}: {
  data: BusinessIdentityData;
  onSubmit: (data: BusinessIdentityData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessIdentityData>({
    resolver: zodResolver(businessIdentitySchema),
    defaultValues: data,
  });

  return (
    <StepContainer
      title="Business Identity"
      description="Let's start with your business name and industry"
      icon={Building2}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <LabeledInput
          label="Business Name"
          placeholder="e.g. Sunset Wellness Spa"
          error={errors.businessName?.message}
          {...register("businessName")}
        />

        <SelectField
          label="Business Category"
          error={errors.category?.message}
          {...register("category")}
        >
          <option value="">Select a category...</option>
          {BUSINESS_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </SelectField>

        <div className="flex justify-end pt-2">
          <Button type="submit">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepContainer>
  );
}

// ============================================================
// Step 2: Contact Info
// ============================================================
function Step2ContactInfo({
  data,
  onSubmit,
  onBack,
}: {
  data: ContactInfoData;
  onSubmit: (data: ContactInfoData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInfoData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: data,
  });

  return (
    <StepContainer
      title="Contact Information"
      description="How can customers and partners reach you?"
      icon={Phone}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <LabeledInput
          label="Business Email"
          type="email"
          placeholder="contact@business.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <LabeledInput
          label="Phone Number (E.164)"
          placeholder="+1234567890"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepContainer>
  );
}

// ============================================================
// Step 3: Business Address
// ============================================================
function Step3BusinessAddress({
  data,
  onSubmit,
  onBack,
}: {
  data: BusinessAddressData;
  onSubmit: (data: BusinessAddressData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessAddressData>({
    resolver: zodResolver(businessAddressSchema),
    defaultValues: data,
  });

  return (
    <StepContainer
      title="Business Address"
      description="Where is your business located?"
      icon={MapPin}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <LabeledInput
          label="Address Line 1"
          placeholder="123 Main Street"
          error={errors.addressLine1?.message}
          {...register("addressLine1")}
        />

        <LabeledInput
          label="Address Line 2 (Optional)"
          placeholder="Suite 100"
          error={errors.addressLine2?.message}
          {...register("addressLine2")}
        />

        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="City"
            placeholder="San Francisco"
            error={errors.city?.message}
            {...register("city")}
          />
          <LabeledInput
            label="State / Region"
            placeholder="California"
            error={errors.state?.message}
            {...register("state")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="Postal Code"
            placeholder="94102"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
          <SelectField
            label="Country"
            error={errors.country?.message}
            {...register("country")}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepContainer>
  );
}

// ============================================================
// Step 4: Regional Settings
// ============================================================
function Step4RegionalSettings({
  data,
  onSubmit,
  onBack,
}: {
  data: RegionalSettingsData;
  onSubmit: (data: RegionalSettingsData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegionalSettingsData>({
    resolver: zodResolver(regionalSettingsSchema),
    defaultValues: data,
  });

  return (
    <StepContainer
      title="Region & Currency"
      description="Configure your locale preferences"
      icon={Globe}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SelectField
          label="Currency"
          error={errors.currency?.message}
          {...register("currency")}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.name} ({c.code})
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Timezone"
          error={errors.timezone?.message}
          {...register("timezone")}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </SelectField>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepContainer>
  );
}

// ============================================================
// Step 5: Working Hours
// ============================================================
const DAY_LABELS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }
}

function Step5WorkingHours({
  data,
  onSubmit,
  onBack,
}: {
  data: WorkingHoursData;
  onSubmit: (data: WorkingHoursData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: _errors },
  } = useForm<WorkingHoursData>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: data.monday ? data : DEFAULT_WORKING_HOURS,
  });

  const watchedValues = watch();

  return (
    <StepContainer
      title="Working Hours"
      description="Define your weekly operating schedule"
      icon={Clock}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {DAY_LABELS.map((day) => {
          const enabled = watchedValues[day]?.enabled ?? false;
          return (
            <div
              key={day}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 ${
                enabled
                  ? "border-brand-primary/30 bg-brand-primary/5"
                  : "border-border/30 bg-white/[0.02]"
              }`}
            >
              {/* Toggle */}
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={enabled}
                  onChange={(e) =>
                    setValue(`${day}.enabled`, e.target.checked, {
                      shouldValidate: true,
                    })
                  }
                />
                <div className="h-5 w-9 rounded-full bg-slate-700 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-slate-400 after:transition-all peer-checked:bg-brand-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
              </label>

              {/* Day name */}
              <span className="w-24 text-sm font-medium capitalize text-slate-300">
                {day}
              </span>

              {/* Time selects */}
              {enabled ? (
                <div className="flex flex-1 items-center gap-2">
                  <select
                    className="h-8 flex-1 rounded-md border border-border bg-transparent px-2 text-xs text-foreground"
                    {...register(`${day}.open`)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500">to</span>
                  <select
                    className="h-8 flex-1 rounded-md border border-border bg-transparent px-2 text-xs text-foreground"
                    {...register(`${day}.close`)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="flex-1 text-xs text-slate-600">Closed</span>
              )}
            </div>
          );
        })}

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepContainer>
  );
}

// ============================================================
// Step 6: Appointment Settings
// ============================================================
function Step6AppointmentSettings({
  data,
  onSubmit,
  onBack,
}: {
  data: AppointmentSettingsData;
  onSubmit: (data: AppointmentSettingsData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentSettingsData>({
    resolver: zodResolver(appointmentSettingsSchema),
    defaultValues: data,
  });

  return (
    <StepContainer
      title="Appointment Configuration"
      description="Configure your booking slot parameters"
      icon={CalendarClock}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <LabeledInput
          label="Appointment Duration (minutes)"
          type="number"
          placeholder="30"
          error={errors.appointmentDuration?.message}
          {...register("appointmentDuration", { valueAsNumber: true })}
        />

        <LabeledInput
          label="Buffer Between Appointments (minutes)"
          type="number"
          placeholder="0"
          error={errors.bufferTime?.message}
          {...register("bufferTime", { valueAsNumber: true })}
        />

        <LabeledInput
          label="Max Advance Booking (days)"
          type="number"
          placeholder="30"
          error={errors.maxAdvanceBookingDays?.message}
          {...register("maxAdvanceBookingDays", { valueAsNumber: true })}
        />

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="submit">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </StepContainer>
  );
}

// ============================================================
// Step 7: Logo Upload
// ============================================================
function Step7LogoUpload({
  onSubmit,
  onBack,
  logoPreviewUrl,
  onLogoChange,
}: {
  onSubmit: () => void;
  onBack: () => void;
  logoPreviewUrl: string | null;
  onLogoChange: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateAndSet = useCallback(
    (file: File | null) => {
      setUploadError(null);
      if (!file) {
        onLogoChange(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File must be under 5MB");
        return;
      }
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setUploadError("Only PNG, JPEG, or WebP files are allowed");
        return;
      }
      onLogoChange(file);
    },
    [onLogoChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      validateAndSet(file);
    },
    [validateAndSet]
  );

  return (
    <StepContainer
      title="Brand Logo"
      description="Upload your business logo (optional)"
      icon={ImagePlus}
    >
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
            dragActive
              ? "border-brand-primary bg-brand-primary/10"
              : "border-border/50 bg-white/[0.02] hover:border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => validateAndSet(e.target.files?.[0] ?? null)}
          />

          {logoPreviewUrl ? (
            <div className="relative">
              <img
                src={logoPreviewUrl}
                alt="Logo preview"
                className="h-24 w-24 rounded-xl border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogoChange(null);
                }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive-dark"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-slate-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPEG, or WebP up to 5MB
                </p>
              </div>
            </>
          )}
        </div>

        {uploadError && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="button" onClick={onSubmit}>
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepContainer>
  );
}

// ============================================================
// Step 8: Review & Confirm
// ============================================================
function Step8Review({
  data,
  logoPreviewUrl,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  data: OnboardingFormData;
  logoPreviewUrl: string | null;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const reviewSections = [
    {
      label: "Business",
      items: [
        { key: "Name", value: data.businessIdentity.businessName },
        { key: "Category", value: data.businessIdentity.category },
      ],
    },
    {
      label: "Contact",
      items: [
        { key: "Email", value: data.contactInfo.email },
        { key: "Phone", value: data.contactInfo.phone },
      ],
    },
    {
      label: "Address",
      items: [
        { key: "Street", value: data.businessAddress.addressLine1 },
        {
          key: "Location",
          value: `${data.businessAddress.city}, ${data.businessAddress.state} ${data.businessAddress.postalCode}`,
        },
      ],
    },
    {
      label: "Region",
      items: [
        { key: "Currency", value: data.regionalSettings.currency },
        {
          key: "Timezone",
          value: data.regionalSettings.timezone.replace(/_/g, " "),
        },
      ],
    },
    {
      label: "Schedule",
      items: [
        {
          key: "Working Days",
          value: `${Object.values(data.workingHours).filter((d) => d.enabled).length} days/week`,
        },
        {
          key: "Appointment Duration",
          value: `${data.appointmentSettings.appointmentDuration} min`,
        },
        {
          key: "Buffer Time",
          value: `${data.appointmentSettings.bufferTime} min`,
        },
      ],
    },
  ];

  return (
    <StepContainer
      title="Review & Launch"
      description="Confirm your workspace configuration"
      icon={CheckCircle}
    >
      <div className="space-y-4">
        {/* Logo preview */}
        {logoPreviewUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <img
              src={logoPreviewUrl}
              alt="Business logo"
              className="h-12 w-12 rounded-lg object-cover"
            />
            <span className="text-sm text-slate-400">Business Logo</span>
          </div>
        )}

        {/* Review grid */}
        {reviewSections.map((section) => (
          <div
            key={section.label}
            className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
          >
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.label}
            </h4>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{item.key}</span>
                  <span className="text-sm font-medium text-white">
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up workspace...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Launch Workspace
              </>
            )}
          </Button>
        </div>
      </div>
    </StepContainer>
  );
}

// ============================================================
// Main Wizard Engine
// ============================================================
export interface WizardStepsProps {
  formData: OnboardingFormData;
  currentStep: number;
  direction: number;
  logoPreviewUrl: string | null;
  isSubmitting: boolean;
  onStepSubmit: (
    stepKey: keyof OnboardingFormData,
    data: OnboardingFormData[keyof OnboardingFormData]
  ) => void;
  onBack: () => void;
  onLogoChange: (file: File | null) => void;
  onFinalSubmit: () => void;
}

export function WizardSteps({
  formData,
  currentStep,
  direction,
  logoPreviewUrl,
  isSubmitting,
  onStepSubmit,
  onBack,
  onLogoChange,
  onFinalSubmit,
}: WizardStepsProps) {
  const stepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1BusinessIdentity
            data={formData.businessIdentity}
            onSubmit={(d) => onStepSubmit("businessIdentity", d)}
          />
        );
      case 1:
        return (
          <Step2ContactInfo
            data={formData.contactInfo}
            onSubmit={(d) => onStepSubmit("contactInfo", d)}
            onBack={onBack}
          />
        );
      case 2:
        return (
          <Step3BusinessAddress
            data={formData.businessAddress}
            onSubmit={(d) => onStepSubmit("businessAddress", d)}
            onBack={onBack}
          />
        );
      case 3:
        return (
          <Step4RegionalSettings
            data={formData.regionalSettings}
            onSubmit={(d) => onStepSubmit("regionalSettings", d)}
            onBack={onBack}
          />
        );
      case 4:
        return (
          <Step5WorkingHours
            data={formData.workingHours}
            onSubmit={(d) => onStepSubmit("workingHours", d)}
            onBack={onBack}
          />
        );
      case 5:
        return (
          <Step6AppointmentSettings
            data={formData.appointmentSettings}
            onSubmit={(d) => onStepSubmit("appointmentSettings", d)}
            onBack={onBack}
          />
        );
      case 6:
        return (
          <Step7LogoUpload
            logoPreviewUrl={logoPreviewUrl}
            onLogoChange={onLogoChange}
            onSubmit={() => onStepSubmit("logoUpload", {})}
            onBack={onBack}
          />
        );
      case 7:
        return (
          <Step8Review
            data={formData}
            logoPreviewUrl={logoPreviewUrl}
            onSubmit={onFinalSubmit}
            onBack={onBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={currentStep}
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {stepContent()}
      </motion.div>
    </AnimatePresence>
  );
}
