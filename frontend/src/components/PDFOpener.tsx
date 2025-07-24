import { useState, type SetStateAction } from 'react';
// Import the CSS module
import styles from './PDFOpener.module.css';

/**
 * PDFOpener Component
 * A modular React component for users to input a link and open it as a PDF.
 * It takes up the whole screen and provides basic URL validation.
 */
const PDFOpener = () => {
    // State to store the user-entered link
    const [link, setLink] = useState('');
    // State to manage messages displayed to the user (e.g., error, success)
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

    /**
     * Handles the change event for the input field.
     * Updates the 'link' state with the current value of the input.
     * Clears any existing messages when the user starts typing.
     * @param {Object} e - The event object from the input change.
     */
    const handleLinkChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setLink(e.target.value);
        // Clear any previous messages when the user starts typing again
        setMessage({ text: '', type: '' });
    };

    /**
     * Validates the URL format.
     * This is a basic check to ensure the string can be parsed as a URL
     * and has an http or https protocol.
     * @param {string} urlString - The URL string to validate.
     * @returns {boolean} - True if the URL is valid, false otherwise.
     */
    const isValidUrl = (urlString: string | URL) => {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (e) {
            // If URL constructor throws an error, the string is not a valid URL
            return false;
        }
    };

    /**
     * Handles the click event for the "Open PDF" button.
     * Performs validation on the input link.
     * If valid, it attempts to open the link in a new browser tab.
     * Displays appropriate messages based on validation results.
     */
    const handleOpenPdf = () => {
        if (!link.trim()) {
            // If the input is empty or only whitespace, show an error message
            setMessage({ text: 'Please enter a link.', type: 'error' });
            return;
        }

        if (isValidUrl(link)) {
            // If the URL is valid, open it in the same tab
            // Note: For security reasons in a real application, you might want to
            // sanitize the URL or use a proxy to prevent direct external navigation.
            // For this example, we're directly constructing the URL.
            const currentUrl = window.location.href;
            const newUrl = `${currentUrl}/pdf/${link}`; // Assuming a route like /pdf/:url
            window.location.href = newUrl;
        } else {
            // If the URL is invalid, show an error message with format guidance
            setMessage({ text: 'Please enter a valid URL (e.g., https://example.com/document.pdf).', type: 'error' });
        }
    };

    return (
        // Main container for the whole page
        <div className={styles.container}>
            {/* Card-like container for the input and button */}
            <div className={styles.card}>
                {/* Title of the UI */}
                <h1 className={styles.title}>
                    Open Your PDF
                </h1>

                {/* Input field for the URL */}
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter or paste your PDF link here..."
                        value={link}
                        onChange={handleLinkChange}
                        aria-label="PDF Link Input"
                    />
                </div>

                {/* Message display area */}
                {message.text && (
                    <div
                        className={`${styles.message} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}
                        role={message.type === 'error' ? 'alert' : 'status'}
                    >
                        {message.text}
                    </div>
                )}

                {/* Button to trigger the PDF opening action */}
                <button
                    onClick={handleOpenPdf}
                    className={styles.button}
                    aria-label="Open PDF Button"
                >
                    Open PDF
                </button>
            </div>
        </div>
    );
};

export default PDFOpener;
