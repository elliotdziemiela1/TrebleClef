import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect, useReducer, useMemo } from 'react';
import { calcNoteWidth, clefPadding, effectiveMeasureWidth, renderScore } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, staveStartX, staveStartY, 
	rendererWidth, measuresPerStave, measureWidthPadding } from '../engine/renderer'; // Will use these soon
import { HISTORY_SIZE } from '../EditorPage';

type EditorScore = { 
	score: Score, // the musical score
	measureNoteLocations: number[][], // the x locations of each note within it's effect measure 
	selectedNoteIdx: number[] | undefined // the index of the currently selected note
}

interface EditorProps {
	historySize : number
}

const noteNames = ['a','b','c','d','e','f','g']
const octaveLevels = [3,4,5,6]
const fourRests : Note[] = [{ keys: ['b/4'], duration: 'q', type: 'r' },{ keys: ['b/4'], duration: 'q', type: 'r' },
	{ keys: ['b/4'], duration: 'q', type: 'r' },{ keys: ['b/4'], duration: 'q', type: 'r' }];

const MAX_MEASURES = 200; // maximum number of measures allowed in a score

// calculates the offset within the effective measure (the measure excluding padding for first and last notes) 
// for each note in the score. returns a 2D array where 
// each subarray corresponds to a measure and contains the x offsets of the notes in that measure.
// This function is only computed the first time a score is rendered.
function getMeasureNoteXLocations(score : Score) : number[][] {
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
	// debugger
	return measureNoteXLocations;
}

const demoMeasureNoteLocations = getMeasureNoteXLocations(demoScore);
	

//
//
//
export default function Editor({ historySize } : EditorProps) {
	const initialEditorScoresHistory = useMemo(() => {
		return Array.from({length: historySize}, (i, idx) : EditorScore =>{
			return {
				score: structuredClone(demoScore),
				measureNoteLocations: demoMeasureNoteLocations, // array of primitives: no need for deep copy
				selectedNoteIdx: undefined
			}
		})
	}, [])

	const scoreContainerRef = useRef<HTMLDivElement>(null);
	
	// index into history of scores. historySize-1 = latest score, 0 = oldest score.
	const [ historyIndex, historyIndexDispatch ] = useReducer((state, action) => {
		if (action < 0 || action >= historySize ){
			console.log("history limit reached.");
			return state;
		} 
		return action;
	}, historySize-1);
	
	// array for current EditorScore and it's history. First element is oldest, last is newest.
	const [ editorScores, editorScoresReducer ] = useReducer((state : EditorScore[], action : EditorScore) => {
		// move to newly created score frame
		debugger
		historyIndexDispatch(historySize-1); 
		// delete oldest EditorScore, and push newest EditorScore
		return [...state.slice(1,historySize), action];
	}, initialEditorScoresHistory as EditorScore[]);
	
	
	
	// deselect old node and select new node in current score
	function changeSelectedNote(newIdx : number[]){
		const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
		if (!!newEditorScore.selectedNoteIdx?.length)
			newEditorScore.score.measures[newEditorScore.selectedNoteIdx[0]].notes[newEditorScore.selectedNoteIdx[1]].color = "black";
		newEditorScore.selectedNoteIdx = newIdx;
		// debugger
		newEditorScore.score.measures[newIdx[0]].notes[newIdx[1]].color = "blue";
		newEditorScore.measureNoteLocations = getMeasureNoteXLocations(newEditorScore.score);
		editorScoresReducer(newEditorScore);
	}

	// delete a note in the current score
	function deleteNote(idx : number[]) {
		const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
		newEditorScore.score.measures[idx[0]].notes[idx[1]].type = 'r';
		newEditorScore.score.measures[idx[0]].notes[idx[1]].keys = ['b/4'];
		newEditorScore.measureNoteLocations = getMeasureNoteXLocations(newEditorScore.score);
		editorScoresReducer(newEditorScore);
	}

	// function called when the score container is clicked. It determines which note was clicked on and updates the selectedNoteIdx state accordingly.
	const selectNote = (event: React.MouseEvent<HTMLDivElement>) : boolean => {
		if (!scoreContainerRef.current)
			return false;
		const boundingRect = scoreContainerRef.current.getBoundingClientRect();
		const scoreLeft = boundingRect.left + staveStartX + 7; // 7 is a fudge factor to account for the clef and stave padding
		const scoreTop = boundingRect.top;
		for (let i = 0; i < editorScores[historyIndex].score.measures.length; i++){
			console.log("i: " + i)
			const measureLeft = scoreLeft + clefPadding + (i%4 * pixelsPerMeasureX);
			const measureRight = measureLeft + pixelsPerMeasureX;
			const effectiveMeasureLeft = measureLeft + measureWidthPadding / 2;
			const measureTop = scoreTop + Math.floor(i/4) * pixelsPerStaveY; 
			const measureBottom = measureTop + pixelsPerStaveY;
			// if clicked inside of this measure
			if (event.clientX > measureLeft && event.clientX < measureRight && event.clientY > measureTop && event.clientY < measureBottom){
				// find the note that was clicked on
				for (let j = editorScores[historyIndex].measureNoteLocations[i].length - 1; j >= 0; j--){
					if (event.clientX - effectiveMeasureLeft > editorScores[historyIndex].measureNoteLocations[i][j]) {
						changeSelectedNote([i,j]);
						return true;
					}
				}
			} 
		}
		return false;
	}

	function changeNote(position : number[], newKey : string) {
		const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
		newEditorScore.score.measures[position[0]].notes[position[1]].keys[0] = newKey;
		newEditorScore.measureNoteLocations = getMeasureNoteXLocations(newEditorScore.score);
		editorScoresReducer(newEditorScore);
	}


	// rerender score when it changes, or history index changes
	useLayoutEffect(() => {
			if (scoreContainerRef.current) {
				debugger
				renderScore(scoreContainerRef.current, editorScores[historyIndex].score);
			}
	}, [editorScores, historyIndex]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		// handle note deletion
		if (event.key == "Backspace" && !!editorScores[historyIndex].selectedNoteIdx?.length) {
			deleteNote(editorScores[historyIndex].selectedNoteIdx);
		}
	}

	function controlButtonHandler(name : string, catagory : string) {
		let currentKey : string;
		switch(catagory){
			case("control"):
				switch(name){
					case("Undo"): historyIndexDispatch(historyIndex - 1); break;
					case("Redo"): historyIndexDispatch(historyIndex + 1); break;
				}
				break;
			case("pitch"):
				currentKey = editorScores[historyIndex].score.measures[editorScores[historyIndex].selectedNoteIdx[0]].notes[editorScores[historyIndex].selectedNoteIdx[1]].keys[0];
				currentKey = name + currentKey.slice(1,3);
				changeNote(editorScores[historyIndex].selectedNoteIdx, currentKey)
				break;
			case("octave"):
				currentKey = editorScores[historyIndex].score.measures[editorScores[historyIndex].selectedNoteIdx[0]].notes[editorScores[historyIndex].selectedNoteIdx[1]].keys[0];
				currentKey = currentKey.slice(0,2) + name;
				changeNote(editorScores[historyIndex].selectedNoteIdx, currentKey)
				break;
			case("measures"):
				const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
				if (name == "+" && newEditorScore.score.measures.length < MAX_MEASURES)
					newEditorScore.score.measures.push({notes: [...fourRests]});
				else if (name == "-" && newEditorScore.score.measures.length > 1)
					newEditorScore.score.measures.pop();
				newEditorScore.measureNoteLocations = getMeasureNoteXLocations(newEditorScore.score);
				editorScoresReducer(newEditorScore);
				break;
		}
		
	}
	
	return (
		<div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
			<div className={styles['controls-div']} >
				<EditorControls buttonPressCallback={controlButtonHandler} editorScore={editorScores[historyIndex]} historyIndex={historyIndex}/>
			</div>
			<div ref={scoreContainerRef} className={styles['score-container']} onClick={selectNote}>
				
			</div>
		</div>
	);
}

interface EditorControlsProps {
	buttonPressCallback: (name : string, catagory: string) => void,
	editorScore : EditorScore,
	historyIndex: number,
	scrolledPast?: boolean
}

function EditorControls({ buttonPressCallback, editorScore, historyIndex } : EditorControlsProps) {
	return (
		<div className={styles['editor-controls']}>
			<div className='history-and-file-buttons'>
				<button onClick={() => buttonPressCallback("Undo", "control")} disabled={historyIndex == 0}>Undo</button>
				<button onClick={() => buttonPressCallback("Redo", "control")} disabled={historyIndex == HISTORY_SIZE - 1}>Redo</button>
				<button onClick={() => buttonPressCallback("Save", "control")}>Save</button>
				<button onClick={() => buttonPressCallback("Load", "control")}>Load</button>
			</div>
			<div className={styles['score-buttons']}>
				<div className={styles['pitch-container']}>
					<p>Pitch: </p>
					{noteNames.map((name : string, idx : number) => {
						return (<button key={idx} onClick={() => buttonPressCallback(name, "pitch")} disabled={ !!editorScore.selectedNoteIdx?.length &&
						(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].keys[0][0] == name)}>{name}</button>)
					})}
				</div>
				<div className={styles['octave-container']}>
					<p>Octave: </p>
					{octaveLevels.map((num : number, idx : number) => {
						return (<button key={idx} onClick={() => buttonPressCallback(num.toString(), "octave")} disabled={ !!editorScore.selectedNoteIdx?.length &&
						editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].keys[0][2] == num.toString()}>{num}</button>)
					})}						
				</div>
				<div className={styles['measures-container']}>
					<p>Measures: </p>
					<button onClick={() => buttonPressCallback("+", "measures")}>+</button>
					<button onClick={() => buttonPressCallback("-", "measures")}>-</button>					

				</div>
			</div>
		</div>
	);
}
