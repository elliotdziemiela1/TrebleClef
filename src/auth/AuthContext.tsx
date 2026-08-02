import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  fetchUserAttributes,
  fetchAuthSession,
  resendSignUpCode,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import type { UserProfile } from "../types/types";
import { getLoggedInProfileBase } from "../serverCalls/serverCalls";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  profile: UserProfile | null;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  resendConfirmation: (username: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null)

  async function refreshUser() {
    try {
      const attributes = await fetchUserAttributes();
      setEmail(attributes.email ?? null);
      setStatus("authenticated");
      const authSession = await fetchAuthSession();
      setAccessToken(authSession.tokens?.accessToken?.toString() ?? null);
    } catch {
      setEmail(null);
      setStatus("unauthenticated");
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      console.log("Fetching profile with access token:", accessToken);
      if (!!accessToken) {
        const prof = await getLoggedInProfileBase(accessToken);
        console.log("Fetched profile:", prof);
        setProfile(prof);
      }
    }
    fetchProfile();
  }, [accessToken]);

  useEffect(() => {
    refreshUser();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") refreshUser();
      if (payload.event === "signedOut") {
        setEmail(null);
        setStatus("unauthenticated");
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    status,
    email,
    profile,
    accessToken,
    async signIn(email, password) {
      const { nextStep } = await amplifySignIn({ username: email, password });
      return { needsConfirmation : nextStep.signInStep === "CONFIRM_SIGN_UP"}
    },
    async signUp(email, password) {
      const { nextStep } = await amplifySignUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      return { needsConfirmation: nextStep.signUpStep === "CONFIRM_SIGN_UP" };
    },
    async resendConfirmation(email) {
      await resendSignUpCode({ username: email})
    },
    async confirmSignUp(email, code) {
      await amplifyConfirmSignUp({ username: email, confirmationCode: code });
    },
    async signOut() {
      await amplifySignOut();
    },
    async getAccessToken() {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
