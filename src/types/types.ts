import { type Score } from "../engine/score"

export const UUIDV4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

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

export interface ScoreMetadataWithID extends ScoreMetadata {
    scoreID: string
}

export interface DatabaseScore {
    scoreID: string,
    metadata: ScoreMetadata,
    score: Score
}

export const DefaultScoreMetadata : ScoreMetadata = {
    Name: "",
    Author_name: "",
    Date_time_created: "",
    Date_time_last_edited: "",
    Primary_genre: "",
    Secondary_genres: [],
    Number_of_ratings: 0,
    Total_number_of_stars: 0,
    Popularity_score: 0,
    Total_measures: 0,
    BPM: 0,
    Primary_instrument: "",
    Secondary_instruments: []
}