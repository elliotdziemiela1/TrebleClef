import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  return (
    <>
      {mode === "signin" ? (
        <SignIn onSwitchToSignUp={() => setMode("signup")} />
      ) : (
        <SignUp onSwitchToSignIn={(needsConfirmation?: boolean) => { setMode("signin"); setNeedsConfirmation(needsConfirmation ?? false); }} />
      )}
      <p style={{ color: "gray" }}>
        {needsConfirmation && "Please check your email for a confirmation."}
      </p>
    </>
  );

}
