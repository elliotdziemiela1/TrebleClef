import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback, useLayoutEffect, useReducer, useMemo } from 'react';
import { calcNoteWidth, clefPadding, effectiveMeasureWidth, renderScore, glyphs } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, staveStartX, staveStartY, 
	rendererWidth, measuresPerStave, measureWidthPadding } from '../engine/renderer'; // Will use these soon
import { HISTORY_SIZE } from '../EditorPage';

type EditorScore = { 
	score: Score, // the musical score
	measureNoteLocations: number[][], // the x locations of each note within it's effect measure 
	selectedNoteIdx: number[] | undefined // the index of the currently selected note [measure, position]
}

interface EditorProps {
	historySize : number
}

const noteNames = ['a','b','c','d','e','f','g']
const octaveLevels = [3,4,5,6]
const durations = [1, 2, 4, 8, 16, 32]
const noteUpGlyphs = Object.values(glyphs.noteUpGlyphs);
const restGlyphs = Object.values(glyphs.restGlyphs);
const fourRests : Note[] = [{ keys: ['b/4'], duration: 4, type: 'r' },{ keys: ['b/4'], duration: 4, type: 'r' },
	{ keys: ['b/4'], duration: 4, type: 'r' },{ keys: ['b/4'], duration: 4, type: 'r' }];

const MAX_MEASURES = 100; // maximum number of measures allowed in a score

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
		historyIndexDispatch(historySize-1); 

		// update x locations of notes in the new score
		action.measureNoteLocations = getMeasureNoteXLocations(action.score);
		// delete oldest EditorScore, and push newest EditorScore
		return [...state.slice(1,historySize), action];
	}, initialEditorScoresHistory as EditorScore[]);
	
	
	
	// deselect old node and select new node in current score
	function changeSelectedNote(newIdx : number[]){
		const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
		if (!!newEditorScore.selectedNoteIdx?.length)
			newEditorScore.score.measures[newEditorScore.selectedNoteIdx[0]].notes[newEditorScore.selectedNoteIdx[1]].color = "black";
		newEditorScore.selectedNoteIdx = newIdx;
		newEditorScore.score.measures[newIdx[0]].notes[newIdx[1]].color = "blue";
		editorScoresReducer(newEditorScore);
	}

	// delete a note in the current score
	function deleteNote(idx : number[]) {
		const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
		newEditorScore.score.measures[idx[0]].notes[idx[1]].type = 'r';
		newEditorScore.score.measures[idx[0]].notes[idx[1]].keys = ['b/4'];
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
			// console.log("i: " + i)
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

	function changeNoteKey(position : number[], newKey : string) {
		const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
		newEditorScore.score.measures[position[0]].notes[position[1]].keys[0] = newKey;
		editorScoresReducer(newEditorScore);
	}


	// rerender score when it changes, or history index changes
	useLayoutEffect(() => {
			if (scoreContainerRef.current) {
				renderScore(scoreContainerRef.current, editorScores[historyIndex].score);
			}
	}, [editorScores, historyIndex]);

	function changeNoteDuration(duration : number, noteType?: string){
		if (editorScores[historyIndex].selectedNoteIdx) {
			const currentNotes : Note[]  = editorScores[historyIndex].score.measures[editorScores[historyIndex].selectedNoteIdx[0]].notes;	
			const currentNote : Note = currentNotes[editorScores[historyIndex].selectedNoteIdx[1]]
			const durationDiff = 1/(duration as Duration) - 1/currentNote.duration;
			const newScore : EditorScore = structuredClone(editorScores[historyIndex])
			const newMeasure : Measure = newScore.score.measures[newScore.selectedNoteIdx![0]];
			if (durationDiff > 0){ // if the new duration is larger than the old duration
				let runningDuration :  number = 0;
				let i = 0; 
				// calculate the sum of the previous notes durations in the measure
				for (i = 0; i < editorScores[historyIndex].selectedNoteIdx[1]; i++){
					runningDuration += 1/newMeasure.notes[i].duration;
					if ((1 - runningDuration) < (1/(duration as Duration))){ // if previous duration is too great to fit requested note change
						break;
					}
				}
				// if loop didn't finish, meaning there's not enough space in the rest of the measure for this note
				// and i == the index of the first note that the requested duration change cannot be at
				if (i < editorScores[historyIndex].selectedNoteIdx[1]){ 
					// remove duration of the note we are changing from the running duration
					runningDuration -= 1/newMeasure.notes[i].duration;
				}
				// the note index i may point to a note before the one that was selected to be changed. This is the behavior of this
				// function. It rewrites the measure to fit the new change by deleting notes before or after it.
				runningDuration += 1/(duration as Duration);

				// change to the new duration
				newScore.score.measures[newScore.selectedNoteIdx![0]].notes[i].duration = (duration as Duration);
				// change to new type 
				newScore.score.measures[newScore.selectedNoteIdx![0]].notes[i].type = noteType ?? undefined;
				// change to blue
				newScore.score.measures[newScore.selectedNoteIdx![0]].notes[i].color = "blue";
				if (noteType == 'r')
					newScore.score.measures[newScore.selectedNoteIdx![0]].notes[i].keys = ["b/4"]
				// set new selected note to the note that was changed
				newScore.selectedNoteIdx = [newScore.selectedNoteIdx![0], i];
				
				// for each note after the changed note, check if it still fits in the measure. If not, recurse by breaking it in half 
				// until it fits or hits 32nd notes, at which point it will be deleted if it still doesn't fit.
				for (let j = newMeasure.notes.length - 1; j > i; j--){
					console.log("j: " + j)
					debugger
					runningDuration += 1/newMeasure.notes[j].duration;
					if (runningDuration > 1){ // if this note doesn't fit in the measure anymore
						if (newMeasure.notes[j].duration == 32){ // if this note is already a 32nd note, delete it 
							newScore.score.measures[newScore.selectedNoteIdx![0]].notes = newScore.score.measures[newScore.selectedNoteIdx![0]].notes.slice(0, j)
								.concat(newScore.score.measures[newScore.selectedNoteIdx![0]].notes.slice(j + 1));
						} else {
							// undo increase to duration
							runningDuration -= 1/newMeasure.notes[j].duration;
							// if the note is not a 32nd note, break it in half
							const newNote : Note = {keys: newMeasure.notes[j].keys, duration: (newMeasure.notes[j].duration * 2) as Duration, type: newMeasure.notes[j].type};
							newScore.score.measures[newScore.selectedNoteIdx![0]].notes = [
								...newScore.score.measures[newScore.selectedNoteIdx![0]].notes.slice(0, j),
								structuredClone(newNote),
								structuredClone(newNote),
								...newScore.score.measures[newScore.selectedNoteIdx![0]].notes.slice(j + 1)
							];
							j += 2; // recheck this note in the next iteration
						}
					}
				}
			} else { // else new duration is less than old duration
				// The number of notes we will insert
				const numberOfInsertedRests = (1/currentNote.duration) / (1/(duration as Duration)) - 1;
				const newNote : Note = {keys: currentNote.keys, duration: duration as Duration, color: "blue", type: noteType ?? undefined};
				if (noteType == 'r')
					newNote.keys = ["b/4"]
				const newRest : Note = {keys: ['b/4'], duration: duration as Duration, type: 'r'};
				const newNotes : Note[] = [structuredClone(newNote)]
				for (let i = 0; i < numberOfInsertedRests; i++){
					newNotes.push(structuredClone(newRest))
				}

				newScore.score.measures[newScore.selectedNoteIdx![0]].notes = [
					...newScore.score.measures[newScore.selectedNoteIdx![0]].notes.slice(0, newScore.selectedNoteIdx![1]),
					...newNotes,
					...newScore.score.measures[newScore.selectedNoteIdx![0]].notes.slice(newScore.selectedNoteIdx![1] + 1)
				];
			}
			editorScoresReducer(newScore);
		}
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		// handle note deletion
		if (event.key == "Backspace" && !!editorScores[historyIndex].selectedNoteIdx?.length) {
			deleteNote(editorScores[historyIndex].selectedNoteIdx);
		}
	}

	function controlButtonHandler(buttonName : string | number, catagory : string) {
		let currentKey : string;
		switch(catagory){
			case("control"):
				switch(buttonName){
					case("Undo"): historyIndexDispatch(historyIndex - 1); break;
					case("Redo"): historyIndexDispatch(historyIndex + 1); break;
				}
				break;
			case("pitch"):
				if (editorScores[historyIndex].selectedNoteIdx) {
					currentKey = editorScores[historyIndex].score.measures[editorScores[historyIndex].selectedNoteIdx[0]].notes[editorScores[historyIndex].selectedNoteIdx[1]].keys[0];
					currentKey = buttonName + currentKey.slice(1,3);
					changeNoteKey(editorScores[historyIndex].selectedNoteIdx, currentKey)
				}
				break;
			case("octave"):
				if (editorScores[historyIndex].selectedNoteIdx) {
					currentKey = editorScores[historyIndex].score.measures[editorScores[historyIndex].selectedNoteIdx[0]].notes[editorScores[historyIndex].selectedNoteIdx[1]].keys[0];
					currentKey = currentKey.slice(0,2) + buttonName;
					changeNoteKey(editorScores[historyIndex].selectedNoteIdx, currentKey)
				}
				break;
			case("measures"):
				const newEditorScore : EditorScore = structuredClone(editorScores[historyIndex]);
				if (buttonName == "+" && newEditorScore.score.measures.length < MAX_MEASURES)
					newEditorScore.score.measures.push({notes: [...fourRests]});
				else if (buttonName == "-" && newEditorScore.score.measures.length > 1){
					newEditorScore.score.measures.pop();
					newEditorScore.selectedNoteIdx = undefined; // deselect note if the measure it was in was deleted
				}
				editorScoresReducer(newEditorScore);
				break;
			case("notes"):
				changeNoteDuration(buttonName as number);
				break;
			case("rests"):
				changeNoteDuration(buttonName as number, 'r');
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
	buttonPressCallback: (buttonName : string | number, catagory: string) => void,
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
						((editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].keys[0][0] == name) ||
						(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].type == 'r'))}>{name}</button>)
					})}
				</div>
				<div className={styles['octave-container']}>
					<p>Octave: </p>
					{octaveLevels.map((num : number, idx : number) => {
						return (<button key={idx} onClick={() => buttonPressCallback(num.toString(), "octave")} disabled={ !!editorScore.selectedNoteIdx?.length &&
						((editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].keys[0][2] == num.toString()) ||
						(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].type == 'r'))}>{num}</button>)
					})}						
				</div>
				<div className={styles['measures-container']}>
					<p>Measures: </p>
					<button onClick={() => buttonPressCallback("+", "measures")} disabled={editorScore.score.measures.length >= MAX_MEASURES}>+</button>
					<button onClick={() => buttonPressCallback("-", "measures")} disabled={editorScore.score.measures.length <= 1}>-</button>					
				</div>
				<div className={styles['notes-and-rests-container']}>
					{durations.map((duration : number, idx: number) =>
						<button onClick={() => buttonPressCallback(duration, "notes")} key={idx} disabled={!!editorScore.selectedNoteIdx?.length &&
							(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].duration == duration) &&
							(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].type != 'r')
						}>
							<p style={{fontFamily: 'Bravura', fontSize: '24px'}}>{noteUpGlyphs[idx]}</p>
						</button>
					)}
					{durations.map((duration : number, idx: number) =>
						<button onClick={() => buttonPressCallback(duration, "rests")} key={idx} disabled={!!editorScore.selectedNoteIdx?.length &&
							(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].duration == duration) &&
							(editorScore.score.measures[editorScore.selectedNoteIdx[0]].notes[editorScore.selectedNoteIdx[1]].type == 'r')
						}>
							<p style={{fontFamily: 'Bravura', fontSize: '24px'}}>{restGlyphs[idx]}</p>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
