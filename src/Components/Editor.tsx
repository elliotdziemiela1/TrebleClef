import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { calcNoteWidth, clefPadding, effectiveMeasureWidth, renderScore } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, staveStartX, staveStartY, 
	rendererWidth, measuresPerStave, measureWidthPadding } from '../engine/renderer'; // Will use these soon

// function getWidthOfNote(duration : Duration) : number {
// 	if (duration === 'w')
// 		return effectiveMeasureWidth;
// 	if (duration === 'h')
// 		return pixelsPerMeasureX / 2;
// 	if (duration === 'q')
// 		return pixelsPerMeasureX / 2;
// 	if (duration === '8')
// 		return pixelsPerMeasureX / 8;
// 	if (duration === '16')
// 		return pixelsPerMeasureX / 16;
// 	if (duration === '32')
// 		return pixelsPerMeasureX / 32;
// 	return 0;
// }



export default function Editor() {
		const scoreContainerRef = useRef<HTMLDivElement>(null);
		const [ score, setScore ] = useState<Score>(demoScore);
		const [ selectedMeasure, setSelectedMeasure ] = useState<Measure | null>(null);
		const [ selectedNoteIdx, setSelectedNoteIdx ] = useState<number[] | null>(null);
		const measureNoteLocationsRef = useRef<number[][]>(getMeasureNoteXLocations()); // stores the x locations of the notes in the selected measure

		// calculates the offset within the measure for each note in the score. returns a 2D array where 
		// each subarray corresponds to a measure and contains the x offsets of the notes in that measure.
		function getMeasureNoteXLocations() : number[][] {
			let measureNoteXLocations : number[][] = [[]];
			for (let i = 0; i < score.measures.length; i++){
				const selectedNotes = score.measures[i].notes;
				measureNoteXLocations[i] = [];
				// // the rightmost note is drawn one of it's widths away from the effective right edge of the measure. That is the middle of the note. The space it occupies is middle - 
				// // (0.5*width) to middle + (0.5*width).
				// measureNoteXLocations[i][selectedNotes.length - 1] = pixelsPerMeasureX - (measureWidthPadding/2) - 
				// 	(calcNoteWidth(selectedNotes[selectedNotes.length - 1].duration) * 1.5);
				// for (let j = selectedNotes.length - 2; j >= 0; j--){
				// 	measureNoteXLocations[i][j] = measureNoteXLocations[i][j + 1] - calcNoteWidth(selectedNotes[j].duration); 
				// }
				measureNoteXLocations[i][0] = (measureWidthPadding / 2) - (calcNoteWidth(selectedNotes[0].duration) / 2);
				for (let j = 1; j < selectedNotes.length; j++){
					measureNoteXLocations[i][j] = measureNoteXLocations[i][j - 1] + calcNoteWidth(selectedNotes[j - 1].duration);
				}
			}
			return measureNoteXLocations;
		}

		// function called when the score container is clicked. It determines which note was clicked on and updates the selectedNoteIdx state accordingly.
		const selectNote = useCallback((event: React.MouseEvent<HTMLDivElement>) : boolean => {
			setSelectedNoteIdx(null);
			setSelectedMeasure(null);
			if (!scoreContainerRef.current)
				return false;
			const boundingRect = scoreContainerRef.current.getBoundingClientRect();
			const scoreLeft = boundingRect.left + staveStartX + 7; // 7 is a fudge factor to account for the clef and stave padding
			const scoreTop = boundingRect.top;
			for (let i = 0; i < score.measures.length; i++){
				const effectiveMeasureLeft = scoreLeft + clefPadding + (i * pixelsPerMeasureX) + (measureWidthPadding / 2);
				const effectiveMeasureRight = effectiveMeasureLeft + effectiveMeasureWidth;
				const measureTop = scoreTop + (Math.floor(i/4) * pixelsPerStaveY); 
				const measureBottom = measureTop + pixelsPerStaveY;
				// if clicked inside of this measure
				debugger
				if (event.clientX > effectiveMeasureLeft && event.clientX < effectiveMeasureRight && event.clientY > measureTop && event.clientY < measureBottom){
					setSelectedMeasure(score.measures[i]);
					// find the note that was clicked on
					for (let j = measureNoteLocationsRef.current[i].length - 1; j >= 0; j--){
						measureNoteLocationsRef.current[i][j];
						if (event.clientX - effectiveMeasureLeft > measureNoteLocationsRef.current[i][j]) {
							setSelectedNoteIdx([i, j]);
							return true;
						}
					}
				} 
			}
			return false;
		}, [score]);

// TODO change selectNote() to modify a copied score value, then just call setScore and bypass the useEffect


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
