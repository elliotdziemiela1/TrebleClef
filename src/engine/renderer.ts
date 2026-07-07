import VexFlow, { Element, Stem, Flag, Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import type { Note, Score } from './score';

export const pixelsPerStaveY = 130;
export const staveStartX = 0;
export const staveStartY = 0;
export const pixelsPerMeasureX = 200;
export const rendererWidth = 900;
export const measuresPerStave = 4;
export const baseHeight = 2 * pixelsPerStaveY; 
export const measureWidthPadding = 20;
export const spacingBetweenLines = 10;
export const clefPadding = 30; // the number of extra pixels added to the width of a measure to 
// include a clef

const quarterNoteGlyph = "\uE0A4";
const halfNoteGlyph = "\uE0A3";
const wholeNoteGlyph = "\uE1D2"; 

export function calcNoteFontSize(duration: string): number {
    switch (duration) {
        case '8': return 30;
        case '16': return 15;
        case '32': return 8;
        default: return 40;
    }
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
            let flagGlyph = null;
            let noteHeadGlyph = quarterNoteGlyph;
            let stemDirection = Stem.DOWN; // or Stem.UP
			const noteOffset = -(((note.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note.keys[0][2]) - 4) * 7)) * (spacingBetweenLines ) / 2);
            
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
            
            
            
            const noteFontSize = calcNoteFontSize(note.duration);
            
            
			const glyph = new Element();
			glyph.setText(noteHeadGlyph);    
			glyph.setFontSize(noteFontSize);            // controls the glyph's rendered size
			glyph.setX(x);
			glyph.setY(y + noteOffset);
			glyph.renderText(ctx, 0, 0);

            const stemXOffset = stemDirection === Stem.UP ? glyph.getWidth() : 1; // offset the stem to the right of the notehead by half the font size
            
			if (note.duration !== 'w'){
                debugger
				let stemX = glyph.getX() + stemXOffset;
				const stemExtension = !!flagGlyph ? 7 : 4; // extension for flags/beams
				const stem = new Stem({
					xBegin: stemX,
					xEnd: stemX, // same x for a straight stem; offset if you need it left/right of the head
					yTop: glyph.getY(), 
					yBottom: glyph.getY(),     
					stemDirection,
					stemExtension,
				});
				stem.setContext(ctx);
				stem.draw();

				// notes array is sorted from highest note to lowest note

                if (note.duration !== 'h'){
                    // Attach an eighth-note flag at the tip of the stem (only for un-beamed 8th/16th/etc. notes)
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