import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);

  async function refreshUser() {
    try {
      await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setEmail(attributes.email ?? null);
      setStatus("authenticated");
    } catch {
      setEmail(null);
      setStatus("unauthenticated");
    }
  }

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
    async signIn(email, password) {
      await amplifySignIn({ username: email, password });
    },
    async signUp(email, password) {
      const { nextStep } = await amplifySignUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      return { needsConfirmation: nextStep.signUpStep === "CONFIRM_SIGN_UP" };
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
