import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

let openModalCount = 0;
let previousBodyOverflow = '';

export function ModalLayer({ children, labelledBy, describedBy, onClose, closeOnBackdrop = false }) {
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openModalCount += 1;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && onCloseRef.current) onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = previousBodyOverflow;
      if (previousFocusRef.current instanceof HTMLElement) previousFocusRef.current.focus();
    };
  }, []);

  const handleBackdropPointerDown = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget && onCloseRef.current) onCloseRef.current();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="mn-modal-layer"
      onMouseDown={handleBackdropPointerDown}
    >
      {children}
    </div>,
    document.body
  );
}
