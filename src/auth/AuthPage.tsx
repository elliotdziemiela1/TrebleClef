import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useAuthContext } from "./AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const authCtx = useAuthContext();

  return (
    <>
      {mode === "signin" ? (
        <SignIn onSwitchToSignUp={() => {setMode("signup"); setNeedsConfirmation(false)}}  needsEmailConfirmation={( email: string, needsConfirmation : boolean) => {setNeedsConfirmation(!!needsConfirmation); setConfirmationEmail(email)}}/>
      ) : (
        <SignUp onSwitchToSignIn={() => { setMode("signin")}} needsEmailConfirmation={( email: string, needsConfirmation : boolean) => {setNeedsConfirmation(!!needsConfirmation); setConfirmationEmail(email)}}/>
      )}
      {needsConfirmation && 
      <>
        <p style={{ color: "gray" }}>Please check your email for a confirmation.</p>
        <button onClick={() => authCtx.resendConfirmation(confirmationEmail)}>Resend confirmation email</button>
      </>
      }
    </>
  );

}
