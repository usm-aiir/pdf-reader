import { useState, type SetStateAction } from 'react';

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

    // States for dynamic inline styles (e.g., hover, focus)
    const [isCardHovered, setIsCardHovered] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isInputHovered, setIsInputHovered] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isButtonPressed, setIsButtonPressed] = useState(false);

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
            const currentUrl = window.location.href;
            const newUrl = `${currentUrl}/pdf/${link}`;
            window.location.href = newUrl;
        } else {
            // If the URL is invalid, show an error message with format guidance
            setMessage({ text: 'Please enter a valid URL (e.g., https://example.com/document.pdf).', type: 'error' });
        }
    };

    // Inline styles for various elements
    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', // from-blue-50 to-indigo-100
        padding: '1rem',
        fontFamily: 'Inter, sans-serif', // Using Inter as specified in instructions
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
    };

    const cardStyle = {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem', // rounded-2xl
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
        width: '100%',
        maxWidth: '28rem', // max-w-md
        border: '1px solid #e5e7eb', // border border-gray-200
        transition: 'transform 0.3s ease-in-out',
        transform: isCardHovered ? 'scale(1.01)' : 'scale(1)', // hover:scale-[1.01]
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '2.25rem', // text-4xl
        fontWeight: '800', // font-extrabold
        color: '#1f2937', // text-gray-800
        marginBottom: '2rem', // mb-8
        textAlign: 'center', // text-center
        letterSpacing: '-0.025em', // tracking-tight
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', // w-full
        padding: '0.75rem 1.25rem', // px-5 py-3
        border: isInputFocused ? '1px solid #3b82f6' : '1px solid #d1d5db', // border border-gray-300, focus:border-blue-500
        borderRadius: '0.75rem', // rounded-xl
        fontSize: '1.125rem', // text-lg
        color: '#374151', // text-gray-700
        // Placeholder color cannot be set directly inline, it needs a pseudo-element
        // For demonstration, we'll just set the base text color.
        outline: 'none', // focus:outline-none
        boxShadow: isInputFocused
            ? '0 0 0 4px rgba(147, 197, 253, 0.5)' // focus:ring-4 focus:ring-blue-300
            : isInputHovered
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // hover:shadow-md
                : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', // shadow-inner
        transition: 'all 0.3s ease-in-out', // transition duration-300 ease-in-out,
        boxSizing: 'border-box', // Ensure padding and border are included in the element's total width and height
    };

    const messageStyle: React.CSSProperties = {
        marginBottom: '1.5rem', // mb-6
        padding: '1rem', // p-4
        borderRadius: '0.5rem', // rounded-lg
        fontSize: '1rem', // text-md
        textAlign: 'center', // text-center
        fontWeight: 500, // font-medium
        transition: 'opacity 0.3s ease-in-out',
        backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5', // bg-red-100 / bg-green-100
        color: message.type === 'error' ? '#b91c1c' : '#065f46', // text-red-700 / text-green-700
        border: message.type === 'error' ? '1px solid #fca5a5' : '1px solid #a7f3d0', // border-red-300 / border-green-300
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%', // w-full
        background: isButtonHovered
            ? 'linear-gradient(to right, #1d4ed8, #4338ca)' // hover:from-blue-700 hover:to-indigo-800
            : 'linear-gradient(to right, #2563eb, #4f46e5)', // from-blue-600 to-indigo-700
        color: 'white', // text-white
        fontWeight: '700', // font-bold
        padding: '1rem 1.5rem', // py-4 px-6
        // rounded-xl
        boxSizing: 'border-box',
        fontSize: '1.25rem', // text-xl
        transition: 'all 0.3s ease-in-out', // transition duration-300 ease-in-out
        transform: isButtonPressed
            ? 'scale(0.95)' // active:scale-95
            : isButtonHovered
                ? 'scale(1.05)' // hover:scale-105
                : 'scale(1)',
        outline: 'none', // focus:outline-none
        boxShadow: isButtonHovered
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' // hover:shadow-xl
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
        cursor: 'pointer',
        border: 'none', // Ensure no default button border
    };

    return (
        // Main container for the whole page
        <div style={containerStyle}>
            {/* Card-like container for the input and button */}
            <div
                style={cardStyle}
                onMouseEnter={() => setIsCardHovered(true)}
                onMouseLeave={() => setIsCardHovered(false)}
            >
                {/* Title of the UI */}
                <h1 style={titleStyle}>
                    Open Your PDF
                </h1>

                {/* Input field for the URL */}
                <div style={{ marginBottom: '1.5rem' }}> {/* mb-6 */}
                    <input
                        type="text"
                        style={inputStyle}
                        placeholder="Enter or paste your PDF link here..."
                        value={link}
                        onChange={handleLinkChange}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onMouseEnter={() => setIsInputHovered(true)}
                        onMouseLeave={() => setIsInputHovered(false)}
                        aria-label="PDF Link Input"
                    />
                </div>

                {/* Message display area */}
                {message.text && (
                    <div
                        style={messageStyle}
                        role={message.type === 'error' ? 'alert' : 'status'}
                    >
                        {message.text}
                    </div>
                )}

                {/* Button to trigger the PDF opening action */}
                <button
                    onClick={handleOpenPdf}
                    style={buttonStyle}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    onMouseDown={() => setIsButtonPressed(true)}
                    onMouseUp={() => setIsButtonPressed(false)}
                    aria-label="Open PDF Button"
                >
                    Open PDF
                </button>
            </div>
        </div>
    );
};

export default PDFOpener;