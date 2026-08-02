import { Score } from "../engine/score"

export interface UserProfile {
    Username: string,
    Number_of_scores: number,
    Bio: string
}

export interface DatabaseUserProfile extends UserProfile {
    Email: string
}

export interface ScoreMetadata {
    Name: string,
    Author_name: string,
    Date_time_created: string, // Requires exact UTC format: YYYY-MM-DDTHH:mm:ssZ
    Date_time_last_edited: string, // Requires exact UTC format: YYYY-MM-DDTHH:mm:ssZ
    Primary_genre: string,
    Secondary_genres?: string[],
    Number_of_ratings: number,
    Total_number_of_stars: number,
    Popularity_score: number,
    Total_measures: number,
    BPM: number,
    Primary_instrument: string,
    Secondary_instruments?: string[]
}

export interface DatabaseScore {
    scoreID: string,
    metadata: ScoreMetadata,
    score: Score
}