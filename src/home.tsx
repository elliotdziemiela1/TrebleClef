import { useState } from "react";
import { useServerCalls } from "./serverCalls/serverCalls";
import type { UserProfile } from "./types/types";

const dummyUserProfile1: UserProfile = {
    Email: "user1@example.com",
    Username: "user1",
    Number_of_scores: 10,
    Bio: "Love playing music"
};

const updatedEmailDummyUserProfile1: UserProfile = {
    Email: "updateduser1@example.com",
    Username: "user1",
    Number_of_scores: 10,
    Bio: "Love playing music"
};

const updatedUsernameDummyUserProfile1: UserProfile = {
    Email: "user1@example.com",
    Username: "updateduser1",
    Number_of_scores: 10,
    Bio: "Love playing music"
};

const dummyUserProfile2: UserProfile = {
    Email: "user2@example.com",
    Username: "user2",
    Number_of_scores: 25,
    Bio: "Composer and musician"
};

const updatedEmailDummyUserProfile2: UserProfile = {
    Email: "updateduser2@example.com",
    Username: "user2",
    Number_of_scores: 25,
    Bio: "Composer and musician"
};
const updatedUsernameDummyUserProfile2: UserProfile = {
    Email: "user2@example.com",
    Username: "updateduser2",
    Number_of_scores: 25,
    Bio: "Composer and musician"
};


export default function Home(){
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const serverCalls = useServerCalls();
    return (
        <>
            <p>This is the Home</p>
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
            <div style={{"display": "block"}}>
                <button onClick={async () => {
                    try { 
                        await serverCalls.updateProfile(updatedEmailDummyUserProfile1)
                        setMessage("Profile for \"" + updatedEmailDummyUserProfile1.Username + "\" successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateProfile with updated email</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.updateProfile(updatedUsernameDummyUserProfile1)
                        setMessage("Profile for \"" + updatedUsernameDummyUserProfile1.Username + "\" successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateProfile with updated username</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.updateProfile(updatedEmailDummyUserProfile2)
                        setMessage("Profile for \"" + updatedEmailDummyUserProfile2.Username + "\" successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateProfile 2 with updated email</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.updateProfile(updatedUsernameDummyUserProfile2)
                        setMessage("Profile for \"" + updatedUsernameDummyUserProfile2.Username + "\" successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateProfile 2 with updated username</button>
            </div>
            {!!error.length && <p style={{color: "red"}}>{`Error: ${error}`}</p>}
            {!!message.length && <p style={{color: "grey"}}>{message}</p>}

        </>
    )
}

