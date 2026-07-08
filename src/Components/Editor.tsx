import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { calcNoteWidth, clefPadding, effectiveMeasureWidth, renderScore } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, staveStartX, staveStartY, 
	rendererWidth, measuresPerStave, measureWidthPadding } from '../engine/renderer'; // Will use these soon
import { useHistory } from '../custom_hooks';

export default function Editor() {
		const scoreContainerRef = useRef<HTMLDivElement>(null);
		const [ score, setScore ] = useState<Score>(demoScore);
		const [ selectedNoteIdx, setSelectedNoteIdx ] = useState<number[] | null>(null);
		const [ measureNoteLocations, setMeasureNoteLocations ] = useState<number[][]>([]); // stores the x locations of the notes in the selected measure
		const scoreHistory = useHistory<Score>(score, 8); // stores the history of the score for undo/redo functionality. The history size is 8.
		// TODO 
		// 
		// if changing measureNoteLocations back to a ref, you cant use it's history anymore.
		//
		const noteLocationsHistory = useHistory<number[][]>(measureNoteLocations, 8); // stores the history of the score for undo/redo functionality. The history size is 8.
		const selectedNoteHistory = useHistory<number[][]>(selectedNoteIdx);
		const historyIndexRef = useRef<number>(0); 


		// calculates the offset within the effective measure (the measure excluding padding for first and last notes) 
		// for each note in the score. returns a 2D array where 
		// each subarray corresponds to a measure and contains the x offsets of the notes in that measure.
		// This function is only computed the first time a score is rendered.
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

		function undo() {

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
					for (let j = measureNoteLocations[i].length - 1; j >= 0; j--){
						if (event.clientX - effectiveMeasureLeft > measureNoteLocations[i][j]) {
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
					if (measureNoteLocations.length === 0) {
						setMeasureNoteLocations(getMeasureNoteXLocations());
					}
				}
		}, [score]);


	return (
		<div className={styles.container}>
			<EditorControls />
			<div ref={scoreContainerRef} className={styles['score-container']} onClick={selectNote}>
				
			</div>
		</div>
	);
}

function EditorControls() {
	return (
		<div className={styles['editor-controls']}>
			<button>Undo</button>
			<button>Redo</button>
			<button>Save</button>
			<button>Load</button>
		</div>
	);
}
