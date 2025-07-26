import React from 'react';
import './ControlsInfo.css';

interface ControlsInfoProps {
  onClose: () => void;
}

const ControlsInfo: React.FC<ControlsInfoProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Controls</h2>
        <ul>
          <li><b>Ctrl + Left Drag:</b> Draw line</li>
          <li><b>Ctrl + Right Click:</b> Delete line</li>
          <li><b>Left Click:</b> Fill cell</li>
          <li><b>Right Click:</b> Unfill cell</li>
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ControlsInfo; 