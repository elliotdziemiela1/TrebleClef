import { useState, useEffect } from "react";
import type { ScoreMetadataWithID } from "../types/types";
import { useServerCalls } from "../serverCalls/serverCalls";
import styles from "./ScoreSelector.module.scss"

export default function ScoreSelector({scoreClicked} : {scoreClicked : (scoreID: string) => void}){
    const serverCalls = useServerCalls();
    const [ scoreMetadatas, setScoreMetadatas ] = useState<ScoreMetadataWithID[]>([]);

    useEffect(() => {
        const update = async () => {
            const metadatas = (await serverCalls.getAllMyScoreMetadatas()).sort(
                (a : ScoreMetadataWithID, b : ScoreMetadataWithID) => {
                    return b.Date_time_last_edited > a.Date_time_last_edited ? -1 : 1;
                }
            )
            setScoreMetadatas(metadatas);
        }
        update();
    }, [])

    return (
        <div className={styles["score-selector-container"]}>
            {scoreMetadatas.map((metadata : ScoreMetadataWithID) => {
                return (
                    <ScoreMetaCard key={metadata.scoreID} metadata={metadata} onClick={scoreClicked} />
                )
            })}
        </div>
    )
}

function ScoreMetaCard({metadata, onClick} : {metadata : ScoreMetadataWithID, onClick : (scoreID: string) => void}){
    return (
        <span onClick={() => onClick(metadata.scoreID)}>
            <p>{metadata.Name}</p>
            <p>By: {metadata.Author_name}</p>
            <p>Created: {metadata.Date_time_created}</p>
            <p>Last Edited: {metadata.Date_time_last_edited}</p>
            <p>Primary Genre: {metadata.Primary_genre}</p>
            <p>Secondary Genres: {metadata.Secondary_genres?.join(", ")}</p>
            <p>Number of Ratings: {metadata.Number_of_ratings}</p>
            <p>Total Stars: {metadata.Total_number_of_stars}</p>
            <p>Popularity Score: {metadata.Popularity_score}</p>
            <p>Total Measures: {metadata.Total_measures}</p>
            <p>BPM: {metadata.BPM}</p>
            <p>Primary Instrument: {metadata.Primary_instrument}</p>
            <p>Secondary Instruments: {metadata.Secondary_instruments?.join(", ")}</p>
        </span>
    )
}