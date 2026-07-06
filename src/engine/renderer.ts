import { Renderer, Stave, StaveNote, Voice, Formatter} from 'vexflow';
import type { Score } from './score';


export function renderScore(container: HTMLDivElement, score: Score) {
  container.innerHTML = ''; // VexFlow can't update in place — clear and redraw
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  
  const pixelsPerStaveY = 100;
  const staveStartX = 10;
  let x = staveStartX;
  let y = 100;

  renderer.resize(800, pixelsPerStaveY);
  const ctx = renderer.getContext();


  for (let i = 0 ; i < score.measures.length; i++) {
    const measure = score.measures[i];
    const stave = new Stave(x, y, 200);
    if (x === 10) stave.addClef(score.clef);
    stave.setContext(ctx).draw();

    const notes = measure.notes.map(
      (n) => new StaveNote({ keys: n.keys, duration: n.duration }),
    );
    const voice = new Voice({ numBeats: 4, beatValue: 4 }).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 150);
    voice.draw(ctx, stave);

    x += 200;
    debugger
    
    
    if (((i+1) % 4 === 0 && score.measures.length >= i+1) || score.measures.length === i+1){
      if (score.measures.length >= i+1){
        y += 100;
        // Resize the renderer to accommodate the new stave
        const baseHeight = 2 * pixelsPerStaveY; 
        const additionalHeight = ((i+1)/4) * pixelsPerStaveY;
        renderer.resize(800, baseHeight + additionalHeight);
        x = staveStartX;
      }
    }
  }
}