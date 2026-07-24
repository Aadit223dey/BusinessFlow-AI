"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { type UserRole, type UserProfile } from "@/types";
import { logAuthTrace, logAuthError } from "@/lib/error-utils";

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

  const fetchProfile = async (userId: string) => {
    try {
      logAuthTrace("Fetching profile for user", { userId });
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        logAuthError("Error fetching user profile", error);
        setProfile(null);
      } else {
        logAuthTrace("Profile fetched successfully", data);
        setProfile(data as UserProfile);
      }
    } catch (err) {
      logAuthError("Unexpected error fetching profile", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logAuthTrace("Initializing Auth Session...");
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logAuthError("Initial getSession error", sessionError);
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          logAuthTrace("Initial session established", { userId: initialSession.user.id, email: initialSession.user.email });
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        logAuthError("Failed to initialize auth session", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logAuthTrace("Auth state changed event", { event, userId: currentSession?.user?.id });
        setIsLoading(true);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
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
