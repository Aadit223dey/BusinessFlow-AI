"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { type UserRole, type UserProfile } from "@/types";
import { fetchUserProfile } from "@/services/profile-service";
import { logAuthTrace, logAuthError } from "@/lib/error-utils";
import { logger } from "@/lib/logger";

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole | null;
  hasSelectedRole: boolean;
  hasCompletedOnboarding: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleFetchProfile = async (userId: string) => {
    try {
      logAuthTrace("Fetching profile for user via Profile Service", { userId });
      const userProfile = await fetchUserProfile(userId);
      console.log("🔍 [PROFILE TRACE 3/6] AuthProvider Internal State Setting:", userProfile);
      setProfile(userProfile);
    } catch (err) {
      logAuthError("Failed to fetch profile in AuthProvider", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setIsLoading(true);
      await handleFetchProfile(user.id);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        logAuthTrace("Initializing Auth Session...");
        logger.debug("Initializing Auth Session", { operation: "auth.init" });
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          logAuthError("Initial getSession error", sessionError);
        }

        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          logAuthTrace("Initial session established", {
            userId: initialSession.user.id,
            email: initialSession.user.email,
          });
          await handleFetchProfile(initialSession.user.id);
        }
      } catch (err) {
        logAuthError("Failed to initialize auth session", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logAuthTrace("Auth state changed event", { event, userId: currentSession?.user?.id });

        // Ignore INITIAL_SESSION to prevent duplicate fetch with initializeAuth()
        if (event === "INITIAL_SESSION") {
          return;
        }

        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await handleFetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }

        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    role: profile?.role ?? null,
    hasSelectedRole: profile?.hasSelectedRole ?? profile?.has_selected_role ?? false,
    hasCompletedOnboarding: profile?.hasCompletedOnboarding ?? profile?.has_completed_onboarding ?? false,
    refreshProfile,
  };

  useEffect(() => {
    if (!isLoading) {
      console.log("🔍 [PROFILE TRACE 4/6] Context Value Exposed:", {
        role: value.role,
        firstName: profile?.firstName ?? profile?.first_name,
        lastName: profile?.lastName ?? profile?.last_name,
        hasSelectedRole: value.hasSelectedRole,
        hasCompletedOnboarding: value.hasCompletedOnboarding,
      });
    }
  }, [isLoading, value.role, value.hasSelectedRole, value.hasCompletedOnboarding, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
