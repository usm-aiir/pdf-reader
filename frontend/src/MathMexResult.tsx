import React from 'react';

interface MathMexResultProps {
    definitionText: string;
    mathMexContent: string;
    targetSpanId: Node | null; // Changed from string to Node for better type safety
}

const MathMexResult = ({ definitionText, mathMexContent, targetSpanId }: MathMexResultProps) => {
  const handleClick = () => {
    if (targetSpanId && (targetSpanId as Element).scrollIntoView) {
      (targetSpanId as Element).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Define styles as JavaScript objects
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    marginTop: '20px',
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  };

  const stickynoteStyle: React.CSSProperties = {
    backgroundColor: '#ffc',
    border: '1px solid #e0e0b0',
    padding: '10px',
    marginRight: '20px',
    borderRadius: '5px',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
    width: '180px',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    position: 'relative',
  };

  const stickynoteTextStyle: React.CSSProperties = {
    fontFamily: "'Permanent Marker', cursive", // Note: font names with spaces need quotes
    fontSize: '0.95em',
    lineHeight: '1.3',
    margin: '0',
    color: '#333',
  };

  const stickynoteLinkIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    fontSize: '1.2em',
    color: '#555',
  };

  const mathMexContentStyle: React.CSSProperties = {
    flexGrow: 1,
    backgroundColor: '#fff',
    border: '1px solid #eee',
    padding: '15px',
    borderRadius: '5px',
    overflowX: 'auto',
  };

  // Note: Styling the <pre> tag directly within mathMexContent is not possible with pure inline styles.
  // You would need to apply styles directly to the <pre> tag itself.
  const preStyle: React.CSSProperties = {
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '0.9em',
    color: '#222',
  };


  return (
    <div style={containerStyle}>
      <div style={stickynoteStyle} onClick={handleClick}>
        <p style={stickynoteTextStyle}>{definitionText}</p>
        <div style={stickynoteLinkIndicatorStyle}>🔗</div>
      </div>
      <div style={mathMexContentStyle}>
        <pre style={preStyle}>{mathMexContent}</pre>
      </div>
    </div>
  );
};

export default MathMexResult;