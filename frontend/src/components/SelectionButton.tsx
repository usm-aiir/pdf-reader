// SelectionButton.tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './SelectionButton.module.css'; // Import the CSS module

interface SelectionButtonProps {
  onAction: (selectedText: string, selectedSpan: Node | null) => void;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({ onAction }) => {
  const [selectionInfo, setSelectionInfo] = useState<{ text: string; rect: DOMRect | null; spanId: Node | null }>({ text: '', rect: null, spanId: null });
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref for the button

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Get the first parent element of the selection start container
        // This is a basic approach; for more robust span identification,
        // you might need to traverse up or assign unique IDs to spans.
        const firstElement = range.startContainer.parentElement;
        setSelectionInfo({ text: selection.toString(), rect, spanId: firstElement });
      } else {
        setSelectionInfo({ text: '', rect: null, spanId: null });
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

  // If no text is selected, don't render the button at all
  if (!selectionInfo.text) {
    return null;
  }

  // Calculate dynamic position based on selection rectangle
  const dynamicStyle: React.CSSProperties = {
    position: 'absolute', // Position is absolute relative to the nearest positioned ancestor
    left: selectionInfo.rect ? `${selectionInfo.rect.right + window.scrollX - 50}px` : '0',
    top: selectionInfo.rect ? `${selectionInfo.rect.bottom + window.scrollY + 5}px` : '0',
  };

  return (
    <button
      ref={buttonRef} // Attach the ref
      // Apply base styles and conditionally add the 'visible' class
      className={`${styles.selectionButton} ${selectionInfo.text ? styles.selectionButtonVisible : ''}`}
      style={dynamicStyle} // Apply dynamic position via inline style
      onClick={() => onAction(selectionInfo.text, selectionInfo.spanId)}
    >
      Search in MathMex
    </button>
  );
};

export default SelectionButton;