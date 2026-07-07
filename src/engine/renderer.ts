import VexFlow, { Element, Stem, Flag, Renderer, RenderContext, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import type { Note, Score } from './score';

export const pixelsPerStaveY = 130;
export const staveStartX = 0;
export const staveStartY = 0;
export const pixelsPerMeasureX = 240;
export const measuresPerStave = 4;
export const clefPadding = 30; // the number of extra pixels added to the width of a measure to 
// include a clef
export const rendererWidth = pixelsPerMeasureX * measuresPerStave + clefPadding;
export const baseHeight = 2 * pixelsPerStaveY; 
export const measureWidthPadding = 20;
export const spacingBetweenLines = 10;
export const ledgerWidth = 35; // the width of the ledger lines that are drawn for notes above or below the staff
export const maxNoteFontSize = 40;

const quarterNoteGlyph = "\uE0A4";
const halfNoteGlyph = "\uE0A3";
const wholeNoteGlyph = "\uE1D2"; 

export function calcNoteFontSize(duration: string): number {
    switch (duration) {
        case '8': return 38;
        case '16': return 30;
        case '32': return 16;
        default: return maxNoteFontSize;
    }
}

// returns the difference between two notes' pitches. returns pitch1 - pitch2.
export function noteDiff(note1: Note, note2: Note): number { 
    const note1Offset = -((note1.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note1.keys[0][2]) - 4) * 7));
    const note2Offset = -((note2.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note2.keys[0][2]) - 4) * 7));
    return note1Offset - note2Offset;
}

function drawLedgerLine(ctx: RenderContext, x: number, y: number, width: number, ) {
    ctx.beginPath();
    ctx.moveTo(x + (width / 2), y);
    ctx.lineTo(x - (width / 2), y);
    ctx.stroke();
}

export function renderScore(container: HTMLDivElement, score: Score) {
	container.innerHTML = ''; // VexFlow can't update in place — clear and redraw
	const renderer = new Renderer(container, Renderer.Backends.SVG);
	
	// let x = staveStartX;
	// let y = staveStartY;

	renderer.resize(rendererWidth + 1, pixelsPerStaveY);
	const ctx = renderer.getContext();


	
	for (let i = 0 ; i < score.measures.length; i++) {
		if (i % 4 === 0){
			renderer.resize(rendererWidth + 1, pixelsPerStaveY * (Math.floor(i / 4) + 1));
		}
		const measureStartX = (i % 4 * pixelsPerMeasureX) + clefPadding;
		const measureStartY = pixelsPerStaveY * Math.floor(i / 4);
		const stave = new Stave(measureStartX, measureStartY, pixelsPerMeasureX, {spacingBetweenLinesPx: spacingBetweenLines});
		let x = measureStartX + (measureWidthPadding / 2) ;
		let y = measureStartY + 1 + (spacingBetweenLines * 6);
		if (i % 4 === 0) {
			stave.addClef(score.clef);
			stave.setX(measureStartX - clefPadding);
			stave.setWidth(pixelsPerMeasureX + clefPadding)
		}
		stave.setContext(ctx).draw();

		const effectiveMeasureWidth = pixelsPerMeasureX - measureWidthPadding;

		for (const note of score.measures[i].notes) {
			// 
			// Rendering logic
			//

            // Calculate variables for rendering the note
            let flagGlyph = null;
            let noteHeadGlyph = quarterNoteGlyph;
            let stemDirection = Stem.DOWN; // or Stem.UP
			const noteOffset = -(((note.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note.keys[0][2]) - 4) * 7)) * (spacingBetweenLines ) / 2);
            const noteFontSize = calcNoteFontSize(note.duration);
            
            if (noteOffset > 0){
                stemDirection = Stem.UP;
            }

            switch(note.duration){
                case('w'): noteHeadGlyph = wholeNoteGlyph; break;
                case('h'): noteHeadGlyph = halfNoteGlyph; break;
                case('q'): flagGlyph = null; break;
                case('8'):
                    flagGlyph = stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag8thDown : VexFlow.Glyphs.flag8thUp;
                    break;
                case('16'):
                    flagGlyph = stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag16thDown : VexFlow.Glyphs.flag16thUp;
                    break;
                case('32'):
                    flagGlyph = stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag32ndDown : VexFlow.Glyphs.flag32ndUp;
                    break;
                default: flagGlyph = null; noteHeadGlyph = quarterNoteGlyph; break;
            }
            
            
            // draw the note head
			const glyph = new Element();
			glyph.setText(noteHeadGlyph);    
			glyph.setFontSize(noteFontSize);            // controls the glyph's rendered size
			glyph.setX(x);
			glyph.setY(y + noteOffset);
			glyph.renderText(ctx, 0, 0);
            
            // draw ledger lines if the note is above or below the staff
            const semitonesAbovef4 = noteDiff(note, {keys: ['g/4'], duration: 'q'});
            const semitonesBelowe3 = -noteDiff(note, {keys: ['e/3'], duration: 'q'});
            if (semitonesAbovef4 > 0 || semitonesBelowe3 > 0){
                debugger
                drawLedgerLine(ctx, x + (glyph.getWidth() / 2), y + noteOffset, ledgerWidth * (noteFontSize / maxNoteFontSize));
            }
            
			if (note.duration !== 'w'){
                // draw the stem
                const stemXOffset = stemDirection === Stem.UP ? glyph.getWidth() : 1; // offset the stem to the right of the notehead by half the font size
				let stemX = glyph.getX() + stemXOffset;
				const stemExtension = !!flagGlyph ? 7 : 4; // extension for flags/beams
				const stem = new Stem({
					xBegin: stemX,
					xEnd: stemX, // same or a straight stem; offset if you need it left/right of the head
					yTop: glyph.getY(), 
					yBottom: glyph.getY(),     
					stemDirection,
					stemExtension,
				});
				stem.setContext(ctx);
				stem.draw();

				// notes array is sorted from highest note to lowest note

                if (note.duration !== 'h'){
                    // draw the flag
                    const flag = new Flag();
                    if (!!flagGlyph){
                        flag.setText(flagGlyph);
                        flag.setFontSize(noteFontSize * 0.75); // match the notehead glyph's size
                        const { topY } = stem.getExtents(); // topY = the y at the far tip of the stem, away from the notehead
                        flag.setX(stemX);
                        flag.setY(topY);
                        flag.setContext(ctx);
                        flag.draw();
                    }
                }
			}
			// 
			// End of Rendering logic
			//

			x += effectiveMeasureWidth / (note.duration === 'w' ? 1 : note.duration === 'h' ? 2 : note.duration === 'q' ? 4 :  parseInt(note.duration, 10)); 
		}

	}
}