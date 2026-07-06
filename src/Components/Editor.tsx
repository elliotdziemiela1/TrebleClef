import styles from './Editor.module.scss';
import { useRef, useEffect } from 'react';
import { renderScore } from '../engine/renderer';
import { demoScore } from '../engine/score';

export default function Editor() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            renderScore(containerRef.current, demoScore);
        }
    }, []);

  return (
    <div ref={containerRef} className={styles.container}>
    </div>
  );
}
