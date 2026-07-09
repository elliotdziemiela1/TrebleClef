import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect, useReducer } from 'react';
import { calcNoteWidth, clefPadding, effectiveMeasureWidth, renderScore } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, staveStartX, staveStartY, 
	rendererWidth, measuresPerStave, measureWidthPadding } from '../engine/renderer'; // Will use these soon
import { useHistory } from '../custom_hooks';

interface EditorProps {
	historySize : number
}

export default function Editor({ historySize } : EditorProps) {
	const [ historyIndex, setHistoryIndex ] = useState<number>(0);
	const scoreContainerRef = useRef<HTMLDivElement>(null);
	const [ score, setScore ] = useState<Score[]>([demoScore]); // array for history
	const [ selectedNoteIdx, selectedNoteDispatch ] = useReducer((state, action : number[]) => {
		debugger
		if (!!state[historyIndex].length)
			changeNoteColor(state[historyIndex], "black");
		const newState : number[][] = [...state];
		newState[historyIndex] = action;
		changeNoteColor(action, "blue");
		return newState;
	}, [[]] as number[][]); // array for history

	// stores the x locations of the notes in the selected measure.
	const measureNoteLocations = useRef<number[][]>([]); 

	// calculates the offset within the effective measure (the measure excluding padding for first and last notes) 
	// for each note in the score. returns a 2D array where 
	// each subarray corresponds to a measure and contains the x offsets of the notes in that measure.
	// This function is only computed the first time a score is rendered.
	const getMeasureNoteXLocations = useCallback(() : number[][] => {
		let measureNoteXLocations : number[][] = [[]];
		for (let i = 0; i < score[historyIndex].measures.length; i++){
			const selectedNotes = score[historyIndex].measures[i].notes;
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

	function changeNoteColor(indicies : number[], color : string) {
		setScore((prevScore) => {
			const newScore = { ...prevScore };
			newScore[historyIndex].measures[indicies[0]].notes[indicies[1]].color = color;
			return newScore;
		});
	}

	function deleteNote(idx : number[]) {
		setScore((prevScore) => {
			const newScore = { ...prevScore };
			newScore[historyIndex].measures[idx[0]].notes[idx[1]].type = "r";
			newScore[historyIndex].measures[idx[0]].notes[idx[1]].keys = ["b/4"];
			return newScore;
		})
	}

	// function changeSelectedNote(newIdx : number[]){
	// 	if (!!selectedNoteIdx[historyIndex])
	// 		changeNoteColor(selectedNoteIdx[historyIndex], "black");
	// 	const newSelectedNoteIdx = [...selectedNoteIdx];
	// 	newSelectedNoteIdx[historyIndex] = newIdx;
	// 	setSelectedNoteIdx(newSelectedNoteIdx);
	// 	// debugger
	// 	changeNoteColor([newIdx[0], newIdx[1]], "blue");
	// }

	// function called when the score container is clicked. It determines which note was clicked on and updates the selectedNoteIdx state accordingly.
	const selectNote = useCallback((event: React.MouseEvent<HTMLDivElement>) : boolean => {
		debugger
		if (!scoreContainerRef.current)
			return false;
		const boundingRect = scoreContainerRef.current.getBoundingClientRect();
		const scoreLeft = boundingRect.left + staveStartX + 7; // 7 is a fudge factor to account for the clef and stave padding
		const scoreTop = boundingRect.top;
		for (let i = 0; i < score[historyIndex].measures.length; i++){
			const measureLeft = scoreLeft + clefPadding + (i%4 * pixelsPerMeasureX);
			const measureRight = measureLeft + pixelsPerMeasureX;
			const effectiveMeasureLeft = measureLeft + measureWidthPadding / 2;
			const measureTop = scoreTop + Math.floor(i/4) * pixelsPerStaveY; 
			const measureBottom = measureTop + pixelsPerStaveY;
			// if clicked inside of this measure
			if (event.clientX > measureLeft && event.clientX < measureRight && event.clientY > measureTop && event.clientY < measureBottom){
				// find the note that was clicked on
				for (let j = measureNoteLocations.current[i].length - 1; j >= 0; j--){
					if (event.clientX - effectiveMeasureLeft > measureNoteLocations.current[i][j]) {
						selectedNoteDispatch([i,j]);
						return true;
					}
				}
			} 
		}
		return false;
	}, [score]);


	useLayoutEffect(() => {
			if (scoreContainerRef.current) {
				renderScore(scoreContainerRef.current, score[historyIndex]);
				measureNoteLocations.current = getMeasureNoteXLocations();
			}
	}, [score]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key == "Backspace" && !!selectedNoteIdx?.length) {
			// changeNoteColor(selectedNoteIdx, "black");
			if (!!selectedNoteIdx[historyIndex])
				deleteNote(selectedNoteIdx[historyIndex]);
		}
	}

	function controlButtonHandler(name : string) {
		switch(name){
			case("Undo"): setHistoryIndex(historyIndex + 1); break;
			case("Redo"): setHistoryIndex(historyIndex - 1); break;
		}
	}

	return (
		<div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
			<EditorControls buttonPressCallback={controlButtonHandler}/>
			<div ref={scoreContainerRef} className={styles['score-container']} onClick={selectNote}>
				
			</div>
		</div>
	);
}

interface EditorControlsProps {
	buttonPressCallback: (name : string) => void;
}

function EditorControls({ buttonPressCallback } : EditorControlsProps) {
	return (
		<div className={styles['editor-controls']}>
			<button onClick={() => buttonPressCallback("Undo")}>Undo</button>
			<button onClick={() => buttonPressCallback("Redo")}>Redo</button>
			<button onClick={() => buttonPressCallback("Save")}>Save</button>
			<button onClick={() => buttonPressCallback("Load")}>Load</button>
		</div>
	);
}
