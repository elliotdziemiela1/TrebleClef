import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { calcNoteWidth, effectiveMeasureWidth, renderScore } from '../engine/renderer';
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

		function getMeasureNoteXLocations() : number[][] {
			let measureNoteXLocations : number[][] = [[]];
			for (let i = 0; i < score.measures.length; i++){
				const selectedNotes = score.measures[i].notes;
				// create an array of the starting points of each note in the measure
				measureNoteXLocations[i] = [];
				for (let j = selectedNotes.length - 1; j >= 0; j--){
					measureNoteXLocations[i][j] = effectiveMeasureWidth - calcNoteWidth(selectedNotes[j].duration);
				}
			}
			return measureNoteXLocations;
		}


		const selectNote = useCallback((event: React.MouseEvent<HTMLDivElement>) : boolean => {
			setSelectedNoteIdx(null);
			setSelectedMeasure(null);
			if (!scoreContainerRef.current)
				return false;
			const boundingRect = scoreContainerRef.current.getBoundingClientRect();
			const scoreLeft = boundingRect.left + staveStartX;
			const scoreTop = boundingRect.top;
			for (let i = 0; i < score.measures.length; i++){
				const effectiveMeasureLeft = scoreLeft + (i * pixelsPerMeasureX) + (measureWidthPadding / 2);
				const effectiveMeasureRight = effectiveMeasureLeft + effectiveMeasureWidth;
				const measureTop = scoreTop + (i * pixelsPerStaveY); 
				const measureBottom = measureTop + pixelsPerStaveY;
				// if clicked inside of this measure
				if (event.screenX > effectiveMeasureLeft && event.screenX < effectiveMeasureRight && event.screenY > measureTop && event.screenY < measureBottom){
					setSelectedMeasure(score.measures[i]);
					// find the note that was clicked on
					for (let j = measureNoteLocationsRef.current[i].length - 1; j >= 0; j--){
						if (event.screenX > effectiveMeasureLeft + measureNoteLocationsRef.current[i][j]) {
							setSelectedNoteIdx([i, j]);
							break;
						}
					}
				} 
			}
			return true;
		}, [score]);

		useEffect(() => {
			if (selectedNoteIdx) {
				setScore((prevScore) => {
					const newScore = { ...prevScore };
					newScore.measures[selectedNoteIdx[0]].notes[selectedNoteIdx[1]].color = "blue";
					return newScore;
				});
			}
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
