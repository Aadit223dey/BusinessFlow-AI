"use client";

import { useState } from "react";
import { Mail, UserPlus, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { parseAuthError } from "@/lib/auth-errors";

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteStaffModal({ isOpen, onClose, onSuccess }: InviteStaffModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), invited_role: "STAFF" }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.error || "Failed to create staff invitation";
        setErrorMsg(errorText);
        toast.error("Invitation Failed", { description: errorText });
        return;
      }

      toast.success("Invitation Sent! 🚀", {
        description: `An invitation link has been generated for ${email}.`,
      });

      setEmail("");
      onSuccess();
      onClose();
    } catch (err) {
      const parsed = parseAuthError(err);
      setErrorMsg(parsed.message);
      toast.error(parsed.title, { description: parsed.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden border border-border bg-card rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Invite Staff Member
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Send a secure invitation link to join your business workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Employee Email Address <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Role Selector (Pre-selected) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Assigned Workspace Role</label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Staff / Employee</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation Email"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
