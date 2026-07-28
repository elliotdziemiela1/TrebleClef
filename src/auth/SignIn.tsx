import { useState, type FormEvent } from "react";
import { useAuthContext } from "./AuthContext";

export default function SignIn({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const { signIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);






  // MUST SHOW MESSAGE WHEN USER TRIES TO SIGN UP BUT NEEDS TO CONFIRM EMAIL FIRST.




  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      console.log("Signing in with email:", email);
      const result : any = await signIn(email, password); // error not being caught for some reason
      if (result.isSignedIn) {
        console.log("Setting submitting to false");
        setSubmitting(false);
      } else {
        setError("Sign in failed.")
      }
    } catch (err) {
      console.log("Msg:" + (err as Error).message);
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      console.log("Setting submitting to false");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign in</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      <p>
        Don't have an account?{" "}
        <button type="button" onClick={onSwitchToSignUp}>
          Sign up
        </button>
      </p>
    </form>
  );
}
