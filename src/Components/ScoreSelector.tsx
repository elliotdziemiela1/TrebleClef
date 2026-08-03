import { useState, useEffect } from "react";
import type { ScoreMetadataWithID } from "../types/types";
import { useServerCalls } from "../serverCalls/serverCalls";
import styles from "./ScoreSelector.module.scss"

export default function ScoreSelector({scoreClicked} : {scoreClicked : (scoreID: string) => void}){
    const serverCalls = useServerCalls();
    const [ scoreMetadatas, setScoreMetadatas ] = useState<ScoreMetadataWithID[]>([]);

    const update = async () => {
        const metadatas = (await serverCalls.getAllMyScoreMetadatas()).sort(
            (a : ScoreMetadataWithID, b : ScoreMetadataWithID) => {
                return b.Date_time_last_edited > a.Date_time_last_edited ? 1 : -1;
            }
        )
        setScoreMetadatas(metadatas);
    }
    useEffect(() => {
        update();
    }, [])

    return (
        <div className={styles["score-selector-container"]}>
            {scoreMetadatas.map((metadata : ScoreMetadataWithID) => {
                return (
                    <ScoreMetaCard key={metadata.scoreID} metadata={metadata} onClick={scoreClicked} 
                        deleteCallback={async () => {
                            try {
                                await serverCalls.deleteScore(metadata.scoreID)
                                console.log("Deleted score with ID:", metadata.scoreID)
                                update();
                            } catch (err) {
                                console.error("Error deleting score:", err)
                            }
                        }} />
                )
            })}
        </div>
    )
}

function ScoreMetaCard({metadata, onClick, deleteCallback} : {metadata : ScoreMetadataWithID, 
    onClick : (scoreID: string) => void, deleteCallback : (scoreID: string) => void }){
    return (
        <span onClick={() => onClick(metadata.scoreID)} className={styles["score-meta-card"]} >
            <p>{metadata.Name}</p>
            <p>By: {metadata.Author_name}</p>
            <p>Created: {metadata.Date_time_created?.slice(5,10) + "-" + metadata.Date_time_created?.slice(0, 4)}</p>
            <p>Last Edited: {metadata.Date_time_last_edited?.slice(5,10) + "-" + metadata.Date_time_last_edited?.slice(0, 4)}</p>
            <button onClick={(e) => {
                e.stopPropagation();
                deleteCallback(metadata.scoreID);
            }}>
                Delete
            </button>
        </span>
    )
}