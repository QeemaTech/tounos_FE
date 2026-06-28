import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: rect.right + window.scrollX,
        width: rect.width,
        height: rect.height,
        windowTop: rect.bottom // distance from viewport top
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const isNearBottom = coords.windowTop > window.innerHeight - 200;

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="inline-block">
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{ 
            position: 'fixed', 
            top: isNearBottom ? 'auto' : coords.top - window.scrollY + 8,
            bottom: isNearBottom ? (window.innerHeight - (coords.top - window.scrollY - coords.height)) + 8 : 'auto',
            left: align === 'right' ? 'auto' : coords.left,
            right: align === 'right' ? (window.innerWidth - coords.right) : 'auto',
            zIndex: 9999
          }}
          className="w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2 animate-in fade-in zoom-in duration-150 origin-top-right"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
