import { deleteUsername, reserveUsername} from "./serverCalls/serverCalls";
import { useAuthContext } from "./auth/AuthContext";
import { useState } from "react";

export default function Home(){
    const authCtx = useAuthContext();
    const [usernameField, setUsernameField] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    return (
        <>
            <p>This is the Home</p>
            <input onChange={(v) => setUsernameField(v.target.value)} value={usernameField}></input>
            <button onClick={async () => {
                try { 
                    await reserveUsername(usernameField, authCtx.accessToken!)
                    setMessage("Username \"" + usernameField + "\"successfully created")
                    setError("");
                } catch (err : any) {
                    setError(err.message);
                    setMessage("")
                }
                }}>Test reserveUsername</button>
            <button onClick={async () => {
                try { 
                    await deleteUsername(usernameField, authCtx.accessToken!)
                    setMessage("Username \"" + usernameField + "\"successfully deleted")
                    setError("");
                } catch (err : any) {
                    setError(err.message);
                    setMessage("")
                }
                }}>Test deleteUsername</button>
            {!!error.length && <p style={{color: "red"}}>{`Error: ${error}`}</p>}
            {!!message.length && <p style={{color: "grey"}}>{message}</p>}

        </>
    )
}