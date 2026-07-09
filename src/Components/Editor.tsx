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
	const scoreContainerRef = useRef<HTMLDivElement>(null);
	const [ score, setScore ] = useState<Score>(demoScore);
	const [ selectedNoteIdx, setSelectedNoteIdx ] = useState<number[] | null>(null);
	const [ historyIndex, historyIndexDispatch ] = useReducer((state : number, action : number) => {
		if (action < historySize && action >= 0){
			// set score
			setScore()	
			// set selected note
			setSelectedNoteIdx()
		} else {
			console.log("history limit reached.");
		}
	}, 0); 

	// stores the x locations of the notes in the selected measure.
	const measureNoteLocations = useRef<number[][]>([]); 

	// // stores the history of the score for undo/redo functionality. First entry is the latest score, last is the oldest
	// const scoreHistory : Score[] = useHistory<Score>(score, historySize, historyIndexRef); 
	// // stores the history of the selected note for undo/redo functionality. First entry is the latest score, last is the oldest
	// const selectedNoteHistory : (number[] | null)[] = useHistory<number[] | null>(selectedNoteIdx, historySize, historyIndexRef);


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

	function changeNoteColor(indicies : number[], color : string) {
		setScore((prevScore) => {
			const newScore = { ...prevScore };
			newScore.measures[indicies[0]].notes[indicies[1]].color = color;
			return newScore;
		});
	}

	// function undo() {
	// 	if (historyIndex < historySize - 1){
	// 		setHistoryIndex((prev) => {
	// 			return prev
	// 		})
	// 		// set score
	// 		setScore(scoreHistory[historyIndexRef.current])	
	// 		// set selected note
	// 		setSelectedNoteIdx(selectedNoteHistory[historyIndexRef.current])
	// 	} else {
	// 		console.log("Undo limit reached.");
	// 	}
	// }

	// function redo() {
	// 	if (historyIndexRef.current > 0){
	// 		historyIndexRef.current--;
	// 		// set score
	// 		setScore(scoreHistory[historyIndexRef.current])			
	// 	} else {
	// 		console.log("Redo limit reached.");
	// 	}

	// }

	// function addNote(){
	// 	historyIndexRef.current = 0;

	// }

	function deleteNote(idx : number[]) {
		setScore((prevScore) => {
			const newScore = { ...prevScore };
			newScore.measures[idx[0]].notes[idx[1]].type = "r";
			newScore.measures[idx[0]].notes[idx[1]].keys = ["b/4"];
			return newScore;
		})
	}

	function changeSelectedNote(newIdx : number[]){
		if (!!selectedNoteIdx?.length)
			changeNoteColor(selectedNoteIdx, "black");
		setSelectedNoteIdx([newIdx[0], newIdx[1]]);
		changeNoteColor([newIdx[0], newIdx[1]], "blue");
	}

	// function called when the score container is clicked. It determines which note was clicked on and updates the selectedNoteIdx state accordingly.
	const selectNote = useCallback((event: React.MouseEvent<HTMLDivElement>) : boolean => {
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
			if (event.clientX > measureLeft && event.clientX < measureRight && event.clientY > measureTop && event.clientY < measureBottom){
				// find the note that was clicked on
				for (let j = measureNoteLocations.current[i].length - 1; j >= 0; j--){
					if (event.clientX - effectiveMeasureLeft > measureNoteLocations.current[i][j]) {
						changeSelectedNote([i,j]);
						return true;
					}
				}
			} 
		}
		return false;
	}, [score]);


	useLayoutEffect(() => {
			if (scoreContainerRef.current) {
				renderScore(scoreContainerRef.current, score);
				measureNoteLocations.current = getMeasureNoteXLocations();
			}
	}, [score]);

	// useEffect(() => {
	// 	const listener = (event : KeyboardEvent) => {
	// 		if (event.key == "Backspace" && !!selectedNoteIdx?.length) 
	// 			changeNoteColor(selectedNoteIdx, "black");
	// 	};
	// 	window.addEventListener("keydown", listener);
	// 	return () => window.removeEventListener("keydown", listener);
	// }, [selectedNoteIdx]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key == "Backspace" && !!selectedNoteIdx?.length) {
			// changeNoteColor(selectedNoteIdx, "black");
			deleteNote(selectedNoteIdx);
		}
	}

	function controlButtonHandler(name : string) {
		switch(name){
			case("Undo"): undo(); break;
			case("Redo"): redo(); break;
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
