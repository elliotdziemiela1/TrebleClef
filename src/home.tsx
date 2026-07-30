import { useState } from "react";
import { useServerCalls } from "./serverCalls/serverCalls";
import type { UserProfile } from "./types/types";

const dummyUserProfile1: UserProfile = {
    Email: "user1@example.com",
    Username: "user1",
    Number_of_scores: 10,
    Bio: "Love playing music"
};

const dummyUserProfile2: UserProfile = {
    Email: "user2@example.com",
    Username: "user2",
    Number_of_scores: 25,
    Bio: "Composer and musician"
};


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
            <div style={{"display": "block"}}>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createProfile(dummyUserProfile1)
                        setMessage("Profile for \"" + dummyUserProfile1.Username + "\" successfully created")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createProfile</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createProfile(dummyUserProfile2)
                        setMessage("Profile for \"" + dummyUserProfile2.Username + "\" successfully created")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createProfile 2</button>
            </div>
            {!!error.length && <p style={{color: "red"}}>{`Error: ${error}`}</p>}
            {!!message.length && <p style={{color: "grey"}}>{message}</p>}

        </>
    )
}

