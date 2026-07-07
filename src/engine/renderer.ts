import VexFlow, { Element, Stem, Flag, Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import type { Note, Score } from './score';

export const pixelsPerStaveY = 100;
// export const staveStartX = 10;
// export const staveStartY = 0;
export const pixelsPerMeasureX = 200;
export const rendererWidth = 900;
export const measuresPerStave = 4;
export const baseHeight = 2 * pixelsPerStaveY; 
export const measureWidthPadding = 20;
export const spacingBetweenLines = 10;
export const clefPadding = 30; // the number of extra pixels added to the width of a measure to 
// include a clef

const quarterNoteGlyph = "\ue0a4";

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
      // let staveNote =new StaveNote({ keys: note.keys, duration: note.duration, type: note.type });
      // if (note.color){
      //   staveNote.setStyle({ fillStyle: note.color, strokeStyle: note.color });
      // }
      // staveNote.setX(20);
      // staveNote.setY(40); // Adjust Y position to align with the stave
      // // staveNote.setOriginX(10);
      // // staveNote.setOriginY(10);
      // staveNote.setYs([1])
      // debugger

      // staveNote.setContext(ctx).draw();


      // 
      // Rendering logic
      //
      const glyph = new Element();
      glyph.setText(quarterNoteGlyph);      // any SMuFL glyph from the Glyphs enum
      glyph.setFontSize(40);            // controls the glyph's rendered size
      glyph.setX(x);
      debugger
      const noteOffset = (((note.keys[0][0].charCodeAt(0) - 'b'.charCodeAt(0)) + ((Number(note.keys[0][2]) - 4) * 7)) * (spacingBetweenLines ) / 2);
      glyph.setY(y - noteOffset);
      glyph.renderText(ctx, 0, 0);
      const stemX = glyph.getX() + 1;
      const stemDirection = Stem.DOWN; // or Stem.UP
      const stemExtension = 10; // extension for flags/beams

      const stem = new Stem({
        xBegin: stemX,
        xEnd: stemX, // same x for a straight stem; offset if you need it left/right of the head
        yTop: glyph.getY(),   // top of stem (above the head, since direction is UP)
        yBottom: glyph.getY(),     // bottom of stem, anchored at the notehead
        stemDirection,
        stemExtension,
      });
      stem.setContext(ctx);
      stem.draw();

      // Attach an eighth-note flag at the tip of the stem (only for un-beamed 8th/16th/etc. notes)
      const flag = new Flag();
      flag.setText(stemDirection === Stem.DOWN ? VexFlow.Glyphs.flag8thDown : VexFlow.Glyphs.flag8thDown);
      flag.setFontSize(30); // match the notehead glyph's size
      const { topY } = stem.getExtents(); // topY = the y at the far tip of the stem, away from the notehead
      flag.setX(stemX - Stem.WIDTH / 2);
      flag.setY(topY);
      flag.setContext(ctx);
      flag.draw();
      // 
      // End of Rendering logic
      //

      x += effectiveMeasureWidth / (note.duration === 'w' ? 1 : note.duration === 'h' ? 2 : note.duration === 'q' ? 4 :  parseInt(note.duration, 10)); 
    }

  }



  // for (let i = 0 ; i < score.measures.length; i++) {
  //   const measure = score.measures[i];
  //   const stave = new Stave(x, y, pixelsPerMeasureX);
  //   if (x === 10) stave.addClef(score.clef);
  //   stave.setContext(ctx).draw();


  //   const glyph = new Element();
  //   glyph.setText(quarterNoteGlyph);      // any SMuFL glyph from the Glyphs enum
  //   glyph.setFontSize(40);            // controls the glyph's rendered size
  //   glyph.setX(30);
  //   glyph.setY(20);
  //   glyph.renderText(ctx, 0, 0);





  //   const notes = measure.notes.map(
  //     (n) => {
  //       let note =new StaveNote({ keys: n.keys, duration: n.duration, type: n.type });
  //       debugger;
  //       if (n.color){
  //         note.setStyle({ fillStyle: n.color, strokeStyle: n.color });
  //       }
  //       return note;
  //     }
  //   );
  //   const voice = new Voice({ numBeats: 4, beatValue: 4 }).addTickables(notes);
  //   new Formatter().joinVoices([voice]).format([voice], 150);
  //   voice.draw(ctx, stave);

  //   x += pixelsPerMeasureX;
    
    
  //   if (((i+1) % measuresPerStave === 0 && score.measures.length >= i+1) || score.measures.length === i+1){
  //     if (score.measures.length >= i+1){
  //       y += pixelsPerStaveY;
  //       // Resize the renderer to accommodate the new stave
  //       const additionalHeight = ((i+1)/measuresPerStave) * pixelsPerStaveY;
  //       renderer.resize(rendererWidth, baseHeight + additionalHeight);
  //       x = staveStartX;
  //     }
  //   }
  // }
}