import styles from './Editor.module.scss';
import { useRef, useEffect, useState, useCallback } from 'react';
import { renderScore } from '../engine/renderer';
import { demoScore, emptyScore, type Score, type Note, type Measure, type Duration } from '../engine/score';
import { pixelsPerMeasureX, pixelsPerStaveY, 
  rendererWidth, measuresPerStave } from '../engine/renderer'; // Will use these soon

function getWidthOfNote(duration : Duration) : number {
  if (duration === 'w')
    return pixelsPerMeasureX;
  if (duration === 'h')
    return pixelsPerMeasureX / 2;
  if (duration === 'q')
    return pixelsPerMeasureX / 2;
  if (duration === '8')
    return pixelsPerMeasureX / 8;
  if (duration === '16')
    return pixelsPerMeasureX / 16;
  if (duration === '32')
    return pixelsPerMeasureX / 32;
  return 0;
}

export default function Editor() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [ score, setScore ] = useState<Score>(demoScore);
    const [ selectedMeasure, setSelectedMeasure ] = useState<Measure | null>(null);
    const [ selectedNote, setSelectedNote ] = useState<Note | null>(null);

    const selectNote = useCallback((event: React.MouseEvent<HTMLDivElement>) : boolean => {
      setSelectedNote(null);
      setSelectedMeasure(null);
      if (!containerRef.current)
        return false;
      const boundingRect = containerRef.current.getBoundingClientRect();
      const scoreLeft = boundingRect.left + staveStartX;
      const scoreTop = boundingRect.top;
      for (let i = 0; i < score.measures.length; i++){
        const measureLeft = scoreLeft + (i * pixelsPerMeasureX);
        const measureRight = measureLeft + pixelsPerMeasureX;
        const measureTop = scoreTop + (i * pixelsPerStaveY); 
        const measureBottom = measureTop + pixelsPerStaveY;
        // if clicked inside of this measure
        if (event.screenX > measureLeft && event.screenX < measureRight && event.screenY > measureTop && event.screenY < measureBottom){
          const selectedNotes = score.measures[i].notes;
          // create an array of the starting points of each note in the measure
          let measureNoteLocations : Number[] = [];
          for (let j = selectedNotes.length - 1; j >= 0; j--){
            measureNoteLocations[j] = measureRight - getWidthOfNote(selectedNotes[j].duration);
          }
        } 
      }
      return true;
    }, [score]);


    useEffect(() => {
        if (containerRef.current) {
            renderScore(containerRef.current, score);
        }
    }, [score]);


  return (
    <div ref={containerRef} className={styles.container} onClick={selectNote}>
    </div>
  );
}
