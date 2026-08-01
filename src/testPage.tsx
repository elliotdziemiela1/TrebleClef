import { useState } from "react";
import { useServerCalls } from "./serverCalls/serverCalls";
import type { UserProfile } from "./types/types";
import type { Score } from "./engine/score";

const dummyUserProfile1: UserProfile = {
    Email: "user1@example.com",
    Username: "user1",
    Number_of_scores: 0,
    Bio: "Love playing music"
};

const updatedBioDummyUserProfile1: UserProfile = {
    Email: "user1@example.com",
    Username: "user1",
    Number_of_scores: 0,
    Bio: "Updated bio for user1"
};

const updatedUsernameDummyUserProfile1: UserProfile = {
    Email: "user1@example.com",
    Username: "updateduser1",
    Number_of_scores: 0,
    Bio: "Love playing music"
};

const dummyUserProfile2: UserProfile = {
    Email: "user2@example.com",
    Username: "user2",
    Number_of_scores: 0,
    Bio: "Composer and musician"
};

const updatedBioDummyUserProfile2: UserProfile = {
    Email: "user2@example.com",
    Username: "user2",
    Number_of_scores: 3,
    Bio: "Updated bio for user2"
};
const updatedUsernameDummyUserProfile2: UserProfile = {
    Email: "user2@example.com",
    Username: "updateduser2",
    Number_of_scores: 3,
    Bio: "Composer and musician"
};

const dummyScoreIDs = [
    "8d82e54e-0703-4396-8cbb-cbd97dfb831f",
    "55e5cdd4-676d-42af-9f88-cba50a8ba980",
    "56df881b-7037-4b03-b77c-19926c8d98d9",
    "363c2bf3-c632-4798-8a71-b81626e5466c",
];


const dummyScores : Score[] = [
    {
        "measures": [
            { "notes": [
                    { "keys": ["c/4"], "duration": 4, "type": "r" },
                    { "keys": ["b/4"], "duration": 4, "type": "r" },
                    { "keys": ["b/4"], "duration": 4, "type": "r" },
                    { "keys": ["b/4"], "duration": 4, "type": "r" }
            ] },
            { "notes": [
                    { "keys": ["b/4"], "duration": 4, "type": "r" },
                    { "keys": ["b/4"], "duration": 4, "type": "r" },
                    { "keys": ["b/4"], "duration": 4, "type": "r" },
                    { "keys": ["b/4"], "duration": 4, "type": "r" }
            ] }
        ],
        "clef": "treble"
    },
    {
        "measures": [
            { "notes": [
                    { "keys": ["c/2"], "duration": 4, "type": "r" },
                    { "keys": ["b/2"], "duration": 4, "type": "r" },
                    { "keys": ["b/2"], "duration": 4, "type": "r" },
                    { "keys": ["b/2"], "duration": 4, "type": "r" }
            ] },
        ],
        "clef": "treble"
    }
]

const dummyScoreMetadatas = [
    {
        "Name": "Test 1",
        "Author_name": "user2",
        "Date_time_created": "2026-07-23T00:28:36Z",
        "Date_time_last_edited": "2026-07-23T00:28:36Z",
        "Primary_genre": "Rock",
        "Secondary_genres": ["Alt", "Indie"],
        "Number_of_ratings": 231,
        "Total_number_of_stars": 1003,
        "Popularity_score": 200,
        "Total_measures": 40,
        "BPM": 120,
        "Primary_instrument": "Guitar",
        "Secondary_instruments": []
    }, 
    {
        "Name": "Test 2",
        "Author_name": "weird User",
        "Date_time_created": "2026-07-23T00:28:36Z",
        "Date_time_last_edited": "2026-07-23T00:28:36Z",
        "Primary_genre": "Electronic",
        "Secondary_genres": ["Alt", "Indie"],
        "Number_of_ratings": 231,
        "Total_number_of_stars": 1003,
        "Popularity_score": 200,
        "Total_measures": 40,
        "BPM": 120,
        "Primary_instrument": "Guitar",
        "Secondary_instruments": []
    }, 
    {
        "Name": "Test 3",
        "Author_name": "user2",
        "Date_time_created": "2026-07-23T00:28:36Z",
        "Date_time_last_edited": "2026-07-23T00:28:36Z",
        "Primary_genre": "Random",
        "Secondary_genres": ["Alt", "Indie"],
        "Number_of_ratings": 42,
        "Total_number_of_stars": 42,
        "Popularity_score": 42,
        "Total_measures": 42,
        "BPM": 42,
        "Primary_instrument": "Guitar",
        "Secondary_instruments": []
    }, 
]
    


export default function TestPage(){
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const serverCalls = useServerCalls();
    return (
        <>
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
                        await serverCalls.updateProfile(updatedBioDummyUserProfile1)
                        setMessage("Profile for \"" + updatedBioDummyUserProfile1.Username + "\" successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateProfile with updated bio</button>
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
                        await serverCalls.updateProfile(updatedBioDummyUserProfile2)
                        setMessage("Profile for \"" + updatedBioDummyUserProfile2.Username + "\" successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateProfile 2 with updated bio</button>
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
            <div style={{"display": "block"}}>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createScore({scoreID: dummyScoreIDs[0], metadata: dummyScoreMetadatas[0], score: dummyScores[0]})
                        setMessage("Score successfully created")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createScore with score 1</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createScore({scoreID: dummyScoreIDs[0], metadata: dummyScoreMetadatas[1], score: dummyScores[0]})
                        setMessage("Score successfully created")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createScore with different data but same id as score 1
                </button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createScore({scoreID: dummyScoreIDs[0], metadata: dummyScoreMetadatas[1], score: dummyScores[1]})
                        setMessage("Score successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createScore with id 2 and new data</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createScore({scoreID: dummyScoreIDs[2], metadata: dummyScoreMetadatas[1], score: dummyScores[1]})
                        setMessage("Score successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createScore with id 3 and new data</button>
                <button onClick={async () => {
                    try { 
                        await serverCalls.createScore({scoreID: dummyScoreIDs[3], metadata: dummyScoreMetadatas[2], score: dummyScores[1]})
                        setMessage("Score successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test createScore with id 3 and new data</button>
            </div>
            <div style={{"display": "block"}}>
                <button onClick={async () => {
                    try { 
                        await serverCalls.updateScore({scoreID: dummyScoreIDs[0], metadata: dummyScoreMetadatas[1], score: dummyScores[1]})
                        setMessage("Score successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateScore with id 1 and new data</button>
                    <button onClick={async () => {
                    try { 
                        await serverCalls.updateScore({scoreID: dummyScoreIDs[0], metadata: dummyScoreMetadatas[0], score: dummyScores[0]})
                        setMessage("Score successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateScore with id 1 and same data</button>
                    <button onClick={async () => {
                    try { 
                        await serverCalls.updateScore({scoreID: dummyScoreIDs[3], metadata: dummyScoreMetadatas[2], score: dummyScores[0]})
                        setMessage("Score successfully updated")
                        setError("");
                    } catch (err : any) {
                        setError(err.message);
                        setMessage("")
                    }
                    }}>Test updateScore with id 1 and new data but same author</button>
            </div>
            {!!error.length && <p style={{color: "red"}}>{`Error: ${error}`}</p>}
            {!!message.length && <p style={{color: "grey"}}>{message}</p>}

        </>
    )
}

