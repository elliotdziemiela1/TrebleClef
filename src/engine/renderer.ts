import { Renderer, Stave, StaveNote, Voice, Formatter} from 'vexflow';
import type { Score } from './score';

export const pixelsPerStaveY = 100;
export const staveStartX = 10;
export const staveStartY = 0;
export const pixelsPerMeasureX = 200;
export const rendererWidth = 800;
export const measuresPerStave = 4;
export const baseHeight = 2 * pixelsPerStaveY; 

export function renderScore(container: HTMLDivElement, score: Score) {
  container.innerHTML = ''; // VexFlow can't update in place — clear and redraw
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  
  let x = staveStartX;
  let y = staveStartY;

  renderer.resize(rendererWidth, pixelsPerStaveY);
  const ctx = renderer.getContext();


  for (let i = 0 ; i < score.measures.length; i++) {
    const measure = score.measures[i];
    const stave = new Stave(x, y, pixelsPerMeasureX);
    if (x === 10) stave.addClef(score.clef);
    stave.setContext(ctx).draw();

    const notes = measure.notes.map(
      (n) => {
        let note =new StaveNote({ keys: n.keys, duration: n.duration, type: n.type });
        if (n.color){
          note.setStyle({ fillStyle: n.color, strokeStyle: n.color });
        }
        return note;
      }
    );
    const voice = new Voice({ numBeats: 4, beatValue: 4 }).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 150);
    voice.draw(ctx, stave);

    x += pixelsPerMeasureX;
    debugger
    
    
    if (((i+1) % measuresPerStave === 0 && score.measures.length >= i+1) || score.measures.length === i+1){
      if (score.measures.length >= i+1){
        y += pixelsPerStaveY;
        // Resize the renderer to accommodate the new stave
        const additionalHeight = ((i+1)/measuresPerStave) * pixelsPerStaveY;
        renderer.resize(rendererWidth, baseHeight + additionalHeight);
        x = staveStartX;
      }
    }
  }
}