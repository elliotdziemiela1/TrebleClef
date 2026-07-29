import { useAuthContext } from "../auth/AuthContext"

// const serverUrl = import.meta.env.SERVER_URL
const serverUrl = "https://treble-clef-server.vercel.app/"

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

export function useServerCalls(){
    const authCtx = useAuthContext();
    return {
        reserveUsername: (username: string) => reserveUsernameBase(username, authCtx.accessToken ?? ""),
        deleteUsername: (username: string) => deleteUsernameBase(username, authCtx.accessToken ?? "")
    }
}