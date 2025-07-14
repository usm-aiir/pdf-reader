import React from 'react';

interface PDFErrorPageProps {
  errorMessage: string;
}

const PDFErrorPage = ({ errorMessage }: PDFErrorPageProps) => {
  const errorContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly less transparent white overlay
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Ensure it's on top of other content
    fontFamily: 'Inter, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    transition: 'opacity 0.3s ease-in-out', // Smooth fade in/out
  };

  const errorTitleStyle = {
    fontSize: '2rem', // text-3xl
    fontWeight: '600', // font-semibold
    color: '#dc2626', // A strong red for error indication (similar to Tailwind red-600)
    marginBottom: '1.5rem', // mb-6
  };

  const errorMessageDetailStyle = {
    fontSize: '1rem', // text-base
    color: '#b91c1c', // A slightly darker red for the detailed message (similar to Tailwind red-700)
    fontWeight: '400',
    textAlign: 'center' as 'center', // Ensure text is centered
    padding: '0 1rem', // Add some padding on smaller screens
    maxWidth: '600px', // Limit width for better readability
  };

  return (
    <div style={errorContainerStyle}>
      <p style={errorTitleStyle}>Oops! Something went wrong.</p>
      <p style={errorMessageDetailStyle}>{errorMessage}</p>
    </div>
  );
};

export default PDFErrorPage;
