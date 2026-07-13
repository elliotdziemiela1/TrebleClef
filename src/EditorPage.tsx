import Editor from './Components/Editor';
import styles from './EditorPage.module.scss';

export const HISTORY_SIZE = 8; // number of scores to keep in history for undo/redo

export default function EditorPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to the Editor Page</h1>
            <p className={styles.description}>This is where you can create and edit scores.</p>
            <Editor historySize={HISTORY_SIZE} />
        </div>
    )
}