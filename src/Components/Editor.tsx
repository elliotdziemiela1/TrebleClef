import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { calcNoteWidth, clefPadding, effectiveMeasureWidth, renderScore } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, staveStartX, staveStartY, 
	rendererWidth, measuresPerStave, measureWidthPadding } from '../engine/renderer'; // Will use these soon

export default function Editor() {
		const scoreContainerRef = useRef<HTMLDivElement>(null);
		const [ score, setScore ] = useState<Score>(demoScore);
		const [ selectedNoteIdx, setSelectedNoteIdx ] = useState<number[] | null>(null);
		const measureNoteLocationsRef = useRef<number[][]>([]); // stores the x locations of the notes in the selected measure

		// calculates the offset within the effective measure (the measure excluding padding for first and last notes) 
		// for each note in the score. returns a 2D array where 
		// each subarray corresponds to a measure and contains the x offsets of the notes in that measure.
		// This function is only computed the first time a score is rendered. Subsequent edits will go in and edit the locations array in place.
		// Therefore, it's ok that this function is complex.
		const getMeasureNoteXLocations = useCallback(() : number[][] => {
			let measureNoteXLocations : number[][] = [[]];
			for (let i = 0; i < score.measures.length; i++){
				const selectedNotes = score.measures[i].notes;
				measureNoteXLocations[i] = [];
				measureNoteXLocations[i][0] = -(measureWidthPadding / 2); // the leftmost pixel of the whole measure
				if (selectedNotes.length > 1){
					measureNoteXLocations[i][1] = calcNoteWidth(selectedNotes[0].duration) / 2;
				}
				for (let j = 2; j < selectedNotes.length; j++){
					// measureNoteXLocations[i][j] = measureNoteXLocations[i][j - 1] + (calcNoteWidth(selectedNotes[j - 1].duration) * 1.5) - (calcNoteWidth(selectedNotes[j].duration) / 2);
					let nextLocation = measureNoteXLocations[i][j - 1] + (calcNoteWidth(selectedNotes[j - 2].duration) / 2) + (calcNoteWidth(selectedNotes[j - 1].duration) / 2);
					measureNoteXLocations[i][j] = nextLocation;

				}
			}
			return measureNoteXLocations;
		}, [score]);

		function unselectNote() {
			setScore((prevScore) => {
				const newScore = { ...prevScore };
				newScore.measures[selectedNoteIdx?.[0] ?? 0].notes[selectedNoteIdx?.[1] ?? 0].color = "black";
				return newScore;
			});
		}

		// function called when the score container is clicked. It determines which note was clicked on and updates the selectedNoteIdx state accordingly.
		const selectNote = useCallback((event: React.MouseEvent<HTMLDivElement>) : boolean => {
			unselectNote();

			if (!scoreContainerRef.current)
				return false;
			const boundingRect = scoreContainerRef.current.getBoundingClientRect();
			const scoreLeft = boundingRect.left + staveStartX + 7; // 7 is a fudge factor to account for the clef and stave padding
			const scoreTop = boundingRect.top;
			for (let i = 0; i < score.measures.length; i++){
				const measureLeft = scoreLeft + clefPadding + (i%4 * pixelsPerMeasureX);
				const measureRight = measureLeft + pixelsPerMeasureX;
				const effectiveMeasureLeft = measureLeft + measureWidthPadding / 2;
				const measureTop = scoreTop + Math.floor(i/4) * pixelsPerStaveY; 
				const measureBottom = measureTop + pixelsPerStaveY;
				// if clicked inside of this measure
				debugger
				if (event.clientX > measureLeft && event.clientX < measureRight && event.clientY > measureTop && event.clientY < measureBottom){
					// find the note that was clicked on
					for (let j = measureNoteLocationsRef.current[i].length - 1; j >= 0; j--){
						// measureNoteLocationsRef.current[i][j];
						if (event.clientX - effectiveMeasureLeft > measureNoteLocationsRef.current[i][j]) {
							setSelectedNoteIdx([i, j]);
							return true;
						}
					}
				} 
			}
			return false;
		}, [score]);

		useEffect(() => {
			
			setScore((prevScore) => {
				const newScore = { ...prevScore };
				if (selectedNoteIdx) {
					newScore.measures[selectedNoteIdx[0]].notes[selectedNoteIdx[1]].color = "blue";
				}
				return newScore;
			});
		}, [selectedNoteIdx]);


		useLayoutEffect(() => {
				if (scoreContainerRef.current) {
					renderScore(scoreContainerRef.current, score);
					if (measureNoteLocationsRef.current.length === 0) {
						measureNoteLocationsRef.current = getMeasureNoteXLocations();
					}
				}
		}, [score]);


	return (
		<div className={styles.container}>
			<div className={styles['editor-controls']}>

			</div>
			<div ref={scoreContainerRef} className={styles['score-container']} onClick={selectNote}>
				
			</div>
		</div>
	);
}
