import React, { useState, useEffect, useRef } from 'react';

interface SelectionButtonProps {
  onAction: (selectedText: string) => void;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({ onAction }) => {
  const [selectionInfo, setSelectionInfo] = useState<{ text: string; rect: DOMRect | null }>({ text: '', rect: null });
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref for the button

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionInfo({ text: selection.toString(), rect });
      } else {
        setSelectionInfo({ text: '', rect: null });
      }
    };

    // Add a check to prevent interaction with the button itself
    const handleMouseDown = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        e.preventDefault(); // Prevent text deselection when clicking the button
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const style: React.CSSProperties = {
    position: 'absolute', // Use 'absolute' if you plan to append it to a specific container, otherwise 'fixed' for viewport
    left: selectionInfo.rect ? `${selectionInfo.rect.right + window.scrollX - 50}px` : '0',
    top: selectionInfo.rect ? `${selectionInfo.rect.bottom + window.scrollY + 5}px` : '0',
    zIndex: 1000,
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '6px 12px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    visibility: selectionInfo.text ? 'visible' : 'hidden',
    opacity: selectionInfo.text ? 1 : 0, // Use opacity for smoother transitions if desired
    transition: 'opacity 0.2s ease-in-out',
  };

  if (!selectionInfo.text) {
    return null; // Don't render if no text is selected
  }

  return (
    <button
      ref={buttonRef} // Attach the ref
      style={style}
      onClick={() => onAction(selectionInfo.text)}
    >
      Open in MathMex
    </button>
  );
};

export default SelectionButton;