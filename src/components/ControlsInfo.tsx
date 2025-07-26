import React, { useRef, useEffect } from 'react';
import './ControlsInfo.css';

interface ControlsInfoProps {
  onClose: () => void;
}

const ControlsInfo: React.FC<ControlsInfoProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <button onClick={onClose} className="close-button">&times;</button>
        <ul>
          <li><b>Ctrl + Left Drag:</b> Draw line</li>
          <li><b>Ctrl + Right Click:</b> Remove line</li>
          <li><b>Left Click:</b> Add stitch</li>
          <li><b>Right Click:</b> Remove stitch</li>
        </ul>
      </div>
    </div>
  );
};

export default ControlsInfo; 