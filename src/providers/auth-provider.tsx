"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { type UserRole, type UserProfile } from "@/types";
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
  const isInitialized = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      logAuthTrace("Fetching profile for user", { userId });
      
      // Fetch with 4-second safety timeout to prevent hanging
      const fetchPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Profile fetch timeout") }), 4000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        logAuthError("Error fetching user profile", error);
        // Fallback minimal profile structure so app never hangs
        setProfile((prev) => prev || ({
          id: userId,
          role: null,
          has_selected_role: false,
          has_completed_onboarding: false,
          tenant_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as UserProfile));
      } else if (data) {
        logAuthTrace("Profile fetched successfully", data);
        setProfile(data as UserProfile);
      }
    } catch (err) {
      logAuthError("Unexpected error fetching profile", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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
          logAuthTrace("Initial session established", { userId: initialSession.user.id, email: initialSession.user.email });
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        logAuthError("Failed to initialize auth session", err);
      } finally {
        if (isMounted) {
          isInitialized.current = true;
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logAuthTrace("Auth state changed event", { event, userId: currentSession?.user?.id });
        
        // Skip INITIAL_SESSION to prevent race condition with initializeAuth()
        if (event === "INITIAL_SESSION") {
          return;
        }

        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }

        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    // Hard safety timeout: Force isLoading = false after 2.5s max under any circumstance
    const safetyTimer = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("⚠️ [AuthProvider] Safety timeout triggered. Forcing isLoading = false.");
        setIsLoading(false);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    role: profile?.role ?? null,
    hasSelectedRole: profile?.has_selected_role ?? false,
    hasCompletedOnboarding: profile?.has_completed_onboarding ?? false,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
