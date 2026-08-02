import { useAuthContext } from "../auth/AuthContext"
import type { DatabaseScore, DatabaseUserProfile, UserProfile } from "../types/types"

const serverUrl = import.meta.env.DEV ? "http://localhost:3000/" : (import.meta.env.VITE_SERVER_URL || "")


export async function reserveUsernameBase(username: string, sessionToken: string) : Promise<boolean> {
    if (!username.length)
        throw new Error("Username cannot be empty.")
    const response = await fetch(serverUrl + "username/" + username, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + sessionToken,
        },
        credentials: "include"
    }) 
    if (!response.ok){
        if (response.status === 400){
            const json = await response.json()
            throw new Error(json.data)
        }
        throw new Error("An error has occurred. Please try again.")
    }
    return true
}

export async function deleteUsernameBase(username: string, sessionToken: string) : Promise<boolean> {
    if (!username.length)
        throw new Error("Username cannot be empty.")
    const response = await fetch(serverUrl + "username/" + username, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + sessionToken,
        },
        credentials: "include"
    })
    if (!response.ok){
        throw new Error("Error with username deletion")
    }

    return true
}

export async function getLoggedInProfileBase(sessionToken: string) : Promise<UserProfile> {
    const response = await fetch(serverUrl + "users/profile", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + sessionToken,
        },
        credentials: "include"
    })
    if (!response.ok){
        if (response.status === 404)
            throw new Error("Profile not found.")
        else 
            throw new Error("Error fetching profile.")
    }

    const body = await response.json()
    return body.data as UserProfile
}



export async function createProfileBase(newProfile : UserProfile, sessionToken: string) : Promise<boolean> {    
    const response = await fetch(serverUrl + "users/profile", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ profile: newProfile})
    })
    if (!response.ok){
        const body = await response.json()
        if (response.status === 400)
            throw new Error(body.data[0] + (body.data[1] ?? ""))
        else 
            throw new Error("Error with profile creation.")
    }

    return true
}

export async function updateProfileBase(newProfile : UserProfile, sessionToken: string) : Promise<boolean> {    
    const response = await fetch(serverUrl + "users/profile", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ profile: newProfile})
    })
    if (!response.ok){
        const body = await response.json()
        if (response.status === 400)
            throw new Error(body.data)
        else 
            throw new Error("Error with profile update.")
    }

    return true
}

export async function getScoreBase(scoreID: string, sessionToken: string) : Promise<DatabaseScore> {
    const response = await fetch(serverUrl + "scores/getScore/" + scoreID, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include"
    })
    if (!response.ok){
        if (response.status === 404)
            throw new Error("Score not found.")
        else 
            throw new Error("Error fetching score.")
    }

    const body = await response.json()
    return { scoreID: scoreID, ...body.data } as DatabaseScore
}

export async function getAllMyScoreMetadatasBase(sessionToken: string) : Promise<DatabaseScore[]> {
    const response = await fetch(serverUrl + "scores/allMyScoreMetadatas", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include"
    })
    if (!response.ok){
        if (response.status === 404)
            throw new Error("No scores found.")
        else 
            throw new Error("Error fetching scores.")
    }

    const body = await response.json()
    return body.data as DatabaseScore[]
}

export async function createScoreBase(dbScore: DatabaseScore, sessionToken: string) : Promise<boolean> {
    const response = await fetch(serverUrl + "scores", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dbScore)
    })
    if (!response.ok){
        const body = await response.json()
        if (response.status === 400)
            throw new Error(body.error)
        else 
            throw new Error("Error with score creation.")
    }

    return true
}

export async function updateScoreBase(dbScore: DatabaseScore, sessionToken: string) : Promise<boolean> {
    const response = await fetch(serverUrl + "scores", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dbScore)
    })
    if (!response.ok){
        const body = await response.json()
        if (response.status === 400)
            throw new Error(body.error)
        else 
            throw new Error("Error with score update.")
    }

    return true
}

export async function deleteScoreBase(scoreID: string, sessionToken: string) : Promise<boolean> {
    const response = await fetch(serverUrl + "scores/" + scoreID, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + sessionToken,
            "Content-Type": "application/json",
        },
        credentials: "include"
    })
    if (!response.ok){
        const body = await response.json()
        if (response.status === 400)
            throw new Error(body.error)
        else 
            throw new Error("Error with score deletion.")
    }

    return true
}

export function useServerCalls(){
    const authCtx = useAuthContext();
    return {
        getScore: (scoreID: string) => getScoreBase(scoreID, authCtx.accessToken ?? ""),
        getAllMyScoreMetadatas: () => getAllMyScoreMetadatasBase(authCtx.accessToken ?? ""),
        deleteScore: (scoreID: string) => deleteScoreBase(scoreID, authCtx.accessToken ?? ""),
        updateScore: (dbScore: DatabaseScore) => updateScoreBase(dbScore, authCtx.accessToken ?? ""),
        createScore: (dbScore: DatabaseScore) => createScoreBase(dbScore, authCtx.accessToken ?? ""),
        getLoggedInProfile: () => getLoggedInProfileBase(authCtx.accessToken ?? ""),
        updateProfile: (newProfile: DatabaseUserProfile) => updateProfileBase(newProfile, authCtx.accessToken ?? ""),
        createProfile:(newProfile : DatabaseUserProfile) => createProfileBase(newProfile, authCtx.accessToken ?? ""),
        reserveUsername: (username: string) => reserveUsernameBase(username, authCtx.accessToken ?? ""),
        deleteUsername: (username: string) => deleteUsernameBase(username, authCtx.accessToken ?? "")
    }
}