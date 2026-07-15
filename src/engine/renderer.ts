import VexFlow, { Element, Stem, Flag, Renderer, RenderContext, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import type { Note, Score } from './score';

export const pixelsPerStaveY = 170;
export const staveStartX = 0;
export const staveStartY = 50;
export const pixelsPerMeasureX = 270;
export const measuresPerStave = 4;
export const clefPadding = 30; // the number of extra pixels added to the width of a measure to 
// include a clef
export const rendererWidth = pixelsPerMeasureX * measuresPerStave + clefPadding;
export const baseHeight = 2 * pixelsPerStaveY; 
export const measureWidthPadding = 20;
export const spacingBetweenLines = 10;
export const ledgerWidth = 36; // the width of the ledger lines that are drawn for notes above or below the staff
export const maxNoteFontSize = 38;
export const effectiveMeasureWidth = pixelsPerMeasureX - measureWidthPadding;

export const idxOfRestGlyphs = 6;

export const glyphs = {
    noteUpGlyphs: {
        wholeNoteGlyph: "\uE1D2", 
        halfNoteGlyph: "\uE0A3",
        quarterNoteUpGlyph: "\uE1D5",
        eighthNoteUpGlyph: "\uE1D7",
        sixteenthNoteUpGlyph: "\uE1D9",
        thirtySecondNoteUpGlyph: "\uE1DB",
    },
    restGlyphs: {
        restWholeGlyph: "\uE4E3",
        restHalfGlyph: "\uE4E4",
        restQuarterGlyph: "\uE4E5",  
        rest8thGlyph: "\uE4E6",
        rest16thGlyph: "\uE4E7",
        rest32ndGlyph: "\uE4E8",
    },
    noteDownGlyphs: {
        quarterNoteDownGlyph: "\uE1D6", 
        eighthNoteDownGlyph: "\uE1D8",
        sixteenthNoteDownGlyph: "\uE1DA",
        thirtySecondNoteDownGlyph: "\uE1DC",
    },
    quarterNoteGlyph: "\uE0A4"
}

export function calcNoteFontSize(duration: number): number {
    switch (duration) {
        case 8: return maxNoteFontSize * 0.92;
        case 16: return maxNoteFontSize * 0.86;
        case 32: return maxNoteFontSize * 0.42;
        default: return maxNoteFontSize;
    }
}

export function calcNoteWidth(duration: number): number {
    return effectiveMeasureWidth / duration
}

// returns the difference between two notes' pitches. returns pitch1 - pitch2.
export function noteDiff(note1: Note, note2: Note): number { 
    const note1Offset = ((note1.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note1.keys[0][2]) - 4) * 7));
    const note2Offset = ((note2.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note2.keys[0][2]) - 4) * 7));
    return note1Offset - note2Offset;
}

function drawLedgerLine(ctx: RenderContext, x: number, y: number, width: number, ) {
    ctx.beginPath();
    ctx.moveTo(x + (width / 2), y);
    ctx.lineTo(x - (width / 2), y);
    ctx.stroke();
}

export function renderScore(container: HTMLDivElement, score: Score) {
    var startTimems = Date.now();
	container.innerHTML = ''; // VexFlow can't update in place — clear and redraw
	const renderer = new Renderer(container, Renderer.Backends.SVG);

	renderer.resize(rendererWidth + 1, pixelsPerStaveY);
	const ctx = renderer.getContext();


	
	for (let i = 0 ; i < score.measures.length; i++) {
		if (i % 4 === 0){
			renderer.resize(rendererWidth + 1, pixelsPerStaveY * (Math.floor(i / 4) + 1));
		}
		const measureStartX = (i % 4 * pixelsPerMeasureX) + clefPadding + staveStartX;
		const measureStartY = pixelsPerStaveY * Math.floor(i / 4) + staveStartY;
		const stave = new Stave(measureStartX, measureStartY, pixelsPerMeasureX, {spacingBetweenLinesPx: spacingBetweenLines});
		let x = measureStartX + (measureWidthPadding / 2) ;
		let y = measureStartY + 1 + (spacingBetweenLines * 6);
		if (i % 4 === 0) {
			stave.addClef(score.clef);
			stave.setX(measureStartX - clefPadding);
			stave.setWidth(pixelsPerMeasureX + clefPadding)
		}
		stave.setContext(ctx).draw();

		for (const note of score.measures[i].notes) {
			// 
			// Rendering logic
			//
            const semitonesAboveb4 = noteDiff(note, {keys: ['b/4'], duration: 4});
            const noteFontSize = calcNoteFontSize(note.duration);
            if (note.color){
                ctx.fillStyle = note.color;
            }

            if (note.type === 'r'){
                // draw the rest glyph
                const restGlyph = new Element();
                switch(note.duration){
                    case(1): restGlyph.setText(glyphs.restGlyphs.restWholeGlyph); break;
                    case(2): restGlyph.setText(glyphs.restGlyphs.restHalfGlyph); break;
                    case(4): restGlyph.setText(glyphs.restGlyphs.restQuarterGlyph); break;
                    case(8): restGlyph.setText(glyphs.restGlyphs.rest8thGlyph); break;
                    case(16): restGlyph.setText(glyphs.restGlyphs.rest16thGlyph); break;
                    case(32): restGlyph.setText(glyphs.restGlyphs.rest32ndGlyph); break;
                    default: restGlyph.setText(glyphs.restGlyphs.restQuarterGlyph); break;
                }
                restGlyph.setFontSize(noteFontSize);
                restGlyph.setX(x);
                restGlyph.setY(y - (semitonesAboveb4 * (spacingBetweenLines / 2)));
                restGlyph.renderText(ctx, 0, 0);
            } else { // else the note is a regular note, not a rest
                // Calculate variables for rendering the note
                let flagGlyph = null;
                let noteHeadGlyph = glyphs.quarterNoteGlyph;
                let stemDirection = Stem.UP; // or Stem.UP
                // const noteOffset = -(((note.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note.keys[0][2]) - 4) * 7)) * (spacingBetweenLines ) / 2);
                
                if (semitonesAboveb4 > 0){
                    stemDirection = Stem.DOWN;
                }

                switch(note.duration){
                    case(1): noteHeadGlyph = glyphs.noteUpGlyphs.wholeNoteGlyph; break;
                    case(2): noteHeadGlyph = glyphs.noteUpGlyphs.halfNoteGlyph; break;
                    case(4): flagGlyph = null; break;
                    case(8):
                        flagGlyph = stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag8thDown : VexFlow.Glyphs.flag8thUp;
                        break;
                    case(16):
                        flagGlyph = stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag16thDown : VexFlow.Glyphs.flag16thUp;
                        break;
                    case(32):
                        flagGlyph = stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag32ndDown : VexFlow.Glyphs.flag32ndUp;
                        break;
                    default: flagGlyph = null; noteHeadGlyph = glyphs.quarterNoteGlyph; break;
                }
                
                
                // draw the note head
                const glyph = new Element();
                glyph.setText(noteHeadGlyph);    
                glyph.setFontSize(noteFontSize);            // controls the glyph's rendered size
                glyph.setX(x);
                glyph.setY(y - (semitonesAboveb4 * (spacingBetweenLines / 2)));
                glyph.renderText(ctx, 0, 0);
                
                // draw ledger lines if the note is above or below the staff
                if (semitonesAboveb4 >= 6){
                    for (let j = semitonesAboveb4; j >= 6; j--){
                        if (j % 2 === 0){
                            drawLedgerLine(ctx, x + (glyph.getWidth() / 2), y - (j * (spacingBetweenLines / 2)), ledgerWidth * (noteFontSize / maxNoteFontSize));
                        }
                    }
                } else if (semitonesAboveb4 <= -6){
                    for (let j = semitonesAboveb4; j <= -6; j++){
                        if (j % 2 === 0){
                            drawLedgerLine(ctx, x + (glyph.getWidth() / 2), y - (j * (spacingBetweenLines / 2)), ledgerWidth * (noteFontSize / maxNoteFontSize));
                        }
                    }
                }
                
                if (note.duration !== 1){
                    // draw the stem
                    const stemXOffset = stemDirection === Stem.UP ? glyph.getWidth() - 1 : 1; // offset the stem to the right of the notehead by half the font size
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

                    if (note.duration !== 2){
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
            }
			// 
			// End of Rendering logic
			//
            ctx.fillStyle = "black"; // reset the fill color to black for each note


			x += calcNoteWidth(note.duration); 
		}
	}
    if (process.env.NODE_ENV === 'development') {
        console.log(`Rendering took ${Date.now() - startTimems} ms`);
    }
}