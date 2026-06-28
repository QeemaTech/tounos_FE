import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

export function PortalDropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY, left: rect.right - 208 });
      setOpen(true);
    }
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleOpen} className="inline-block">
        {trigger}
      </div>
      {open && createPortal(
        <>
          <div id="portal-overlay" className="fixed inset-0 z-[999]" onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 1000 }}>
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
