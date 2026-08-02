import { useState } from "react";
import { useServerCalls } from "../serverCalls/serverCalls";
import { useAuthContext } from "../auth/AuthContext";

export default function HandleCreationPage() {
    const [handle, setHandle] = useState("");
    const serverCalls = useServerCalls(); // Assuming you have a custom hook for server calls
    const authCtx = useAuthContext(); // Assuming you have an auth context to get the user's email
    const [error, setError] = useState<string | null>(null);
    

    return (
        <div>   
            <h1>Choose a username</h1>
            <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)}/>
            <button disabled={!authCtx.accessToken} onClick={async () => {
                try {
                    await serverCalls.createProfile({ Email: authCtx.email!, Username: handle, Number_of_scores: 0, Bio: ""});
                    authCtx.refreshProfile();
                } catch (err) {
                    setError((err as Error).message);
                }
            }}>Submit</button>
            <p style={{ color: "red" }}>{error}</p>
        </div>
    )
}