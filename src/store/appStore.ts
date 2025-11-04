// src/store/appStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Language, PlanType } from "@/types";
import { DEMO_CREDENTIALS, AUTH_STORAGE_KEY, PLANS } from "@/constants";

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // UI
  language: Language;
  activeTab: string;

  // Methods
  login: (email: string, password: string) => Promise<boolean>;
  loginDemo: () => void;
  logout: () => void;

  // UI methods
  setLanguage: (lang: Language) => void;
  setActiveTab: (tab: string) => void;

  // User updates
  updateQuotas: (quotas: Partial<User["quotas"]>) => void;
}

/**
 * Mock authentication function
 * TODO: Replace with real authentication service (Firebase, Supabase, Auth0)
 * Currently accepts any password for demo account
 */
const mockAuth = async (email: string, _password: string): Promise<User | null> => {
  const normalizedEmail = (email ?? "").trim().toLowerCase();

  if (normalizedEmail === DEMO_CREDENTIALS.EMAIL) {
    return {
      id: "demo-user",
      email: DEMO_CREDENTIALS.EMAIL,
      name: "Demo User",
      plan: PLANS.PRO.name as PlanType,
      quotas: { ...PLANS.PRO.quotas },
    };
  }

  // Add more test users if needed
  return null;
};

/**
 * Global Zustand store for application state
 * Persists to localStorage for session management
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default state
      user: null,
      isAuthenticated: false,
      language: "en",
      activeTab: "dashboard",

      /**
       * Login with email and password
       * Uses mock authentication - replace with real API call
       */
      login: async (email: string, password: string) => {
        const user = await mockAuth(email, password);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      /**
       * Instantly login with demo user (for development)
       */
      loginDemo: () => {
        const demoUser: User = {
          id: "demo-user",
          email: DEMO_CREDENTIALS.EMAIL,
          name: "Demo User",
          plan: PLANS.PRO.name as PlanType,
          quotas: { ...PLANS.PRO.quotas },
        };
        set({ user: demoUser, isAuthenticated: true });
      },

      /**
       * Logout and clear session
       */
      logout: () => {
        set({ user: null, isAuthenticated: false, activeTab: "dashboard" });
      },

      /**
       * Update UI language preference
       */
      setLanguage: (language: Language) => set({ language }),

      /**
       * Update active tab
       */
      setActiveTab: (activeTab: string) => set({ activeTab }),

      /**
       * Update user quotas (e.g., after consuming a credit)
       */
      updateQuotas: (newQuotas: Partial<User["quotas"]>) => {
        const current = get().user;
        if (!current) return;
        set({
          user: {
            ...current,
            quotas: { ...current.quotas, ...newQuotas },
          },
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Persist only necessary state for session
      partialize: (state) => ({
        language: state.language,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeTab: state.activeTab,
      }),
    }
  )
);
