import styles from './PDFErrorPage.module.css'; // Import the CSS module

interface PDFErrorPageProps {
  errorMessage: string;
}

const PDFErrorPage = ({ errorMessage }: PDFErrorPageProps) => {
  return (
    <div className={styles.errorContainer}>
      <p className={styles.errorTitle}>Oops! Something went wrong.</p>
      <p className={styles.errorMessageDetail}>{errorMessage}</p>
    </div>
  );
};

export default PDFErrorPage;