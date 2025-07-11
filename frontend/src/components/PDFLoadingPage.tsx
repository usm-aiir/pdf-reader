interface PDFLoadingPageProps {
  progress: number;
  statusMessage: string;
}

const PDFLoadingPage = ({ progress, statusMessage }: PDFLoadingPageProps) => {
  const loadingContainerStyle: React.CSSProperties = {
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

  const loadingTextStyle = {
    fontSize: '2rem', // text-3xl
    fontWeight: '600', // font-semibold
    color: '#1f2937', // text-gray-800
    marginBottom: '1.5rem', // mb-6
  };

  const progressBarContainerStyle = {
    width: '80%',
    maxWidth: '400px',
    height: '10px',
    backgroundColor: '#e0e0e0', // Light grey background for the bar
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '1rem', // Space below the bar
  };

  const progressBarFillStyle = {
    height: '100%',
    width: `${progress}%`, // Dynamic width based on progress prop
    backgroundColor: '#3b82f6', // Blue fill color
    borderRadius: '5px',
    transition: 'width 0.2s ease-out', // Smooth transition for progress updates
  };

  const statusMessageStyle = {
    fontSize: '1rem', // text-base
    color: '#4b5563', // text-gray-600
    fontWeight: '400',
  };

  return (
    <div style={loadingContainerStyle}>
      <p style={loadingTextStyle}>Your PDF is loading...</p>
      <div style={progressBarContainerStyle}>
        <div style={progressBarFillStyle}></div>
      </div>
      <p style={statusMessageStyle}>{statusMessage}</p>
    </div>
  );
};

export default PDFLoadingPage;