import { useState, type FormEvent } from "react";
import { useAuthContext } from "./AuthContext";

export default function SignUp({ onSwitchToSignIn, needsEmailConfirmation }: { onSwitchToSignIn: () => void, needsEmailConfirmation : (email: string, needsConfirmation: boolean) => void }) {
  const { signUp} = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [code, setCode] = useState("");
  // const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation){
        // setAwaitingConfirmation(needsConfirmation);
        needsEmailConfirmation(email, true);
      }
      onSwitchToSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSignUp}>
      <h2>Sign up</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing up..." : "Sign up"}
      </button>
      <p>
        Already have an account?{" "}
        <button type="button" onClick={() => onSwitchToSignIn()}>
          Sign in
        </button>
      </p>
    </form>
  );
}
