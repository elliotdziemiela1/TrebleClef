import ScoreSelector from "../Components/ScoreSelector";
import { useAuthContext } from "../auth/AuthContext";

export default function ScoreLibraryPage() {
    const authCtx = useAuthContext();
    return (
        <div>
            {!!authCtx.profile?.Username.length ? (
                <>
                    <h1>Score Library</h1>
                    <ScoreSelector scoreClicked={(scoreID : string) => {
                        window.location.href = "/editor/" + scoreID;
                    }} />
                </>
            ) : (
                <>
                    <h1>Create an account to view your scores.</h1>
                </>
            )}
        </div>
    )
}