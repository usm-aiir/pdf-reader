import styles from './PDFLoadingPage.module.css'; // Import the CSS module

interface PDFLoadingPageProps {
    progress: number;
    statusMessage: string;
}

const PDFLoadingPage = ({ progress, statusMessage }: PDFLoadingPageProps) => {
    return (
        <div className={styles.loadingContainer}>
            <p className={styles.loadingText}>Your PDF is loading...</p>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: `${progress}%` }} // Dynamic width still applied via inline style
                ></div>
            </div>
            <p className={styles.statusMessage}>{statusMessage}</p>
        </div>
    );
};

export default PDFLoadingPage;