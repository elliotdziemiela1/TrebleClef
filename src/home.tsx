import { useState } from "react";
import { useServerCalls } from "./serverCalls/serverCalls";

export default function Home(){
    const [usernameField, setUsernameField] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const serverCalls = useServerCalls();
    return (
        <>
            <p>This is the Home</p>
            <input onChange={(v) => setUsernameField(v.target.value)} value={usernameField}></input>
            <button onClick={async () => {
                try { 
                    await serverCalls.reserveUsername(usernameField)
                    setMessage("Username \"" + usernameField + "\"successfully created")
                    setError("");
                } catch (err : any) {
                    setError(err.message);
                    setMessage("")
                }
                }}>Test reserveUsername</button>
            <button onClick={async () => {
                try { 
                    await serverCalls.deleteUsername(usernameField)
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