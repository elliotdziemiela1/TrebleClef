import { useParams } from 'react-router-dom';
import Editor from '../Components/Editor';
import styles from './EditorPage.module.scss';
import { UUIDV4_REGEX } from '../types/types';

export const HISTORY_SIZE = 8; // number of scores to keep in history for undo/redo

export default function EditorPage() {
    const { scoreID } = useParams();
    return (
        <div className={styles.container}>
            {(!!scoreID && UUIDV4_REGEX.test(scoreID)) ? (
                <div>
                    <h1 className={styles.title}>Welcome to the Editor Page</h1>
                    <p className={styles.description}>This is where you can create and edit scores.</p>
                    <Editor historySize={HISTORY_SIZE} scoreID={scoreID} />
                </div>
            ) : (
                <div>
                    <h2>Incorrect url parameter format.</h2>
                </div>
            )}
            
        </div>
    )
}       