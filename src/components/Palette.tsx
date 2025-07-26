import React from 'react';
import './Palette.css';

interface PaletteProps {
  palette: string[];
  selectedColorIndex: number | null;
  setSelectedColorIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onAddColor: (newColor: string) => void;
  onRemoveColor: (index: number) => void;
  onEditColor: (index: number, newColor: string) => void;
}

const Palette: React.FC<PaletteProps> = ({ palette, selectedColorIndex, setSelectedColorIndex, onAddColor, onRemoveColor, onEditColor }) => {
  return (
    <div>
      <div className="palette">
        {palette.map((color, index) => (
          <div
            key={index}
            title={color}
            className={`color-swatch ${selectedColorIndex === index ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColorIndex(index)}
            onDoubleClick={() => document.getElementById(`edit-color-${index}`)?.click()}
          >
            <input
              type="color"
              id={`edit-color-${index}`}
              value={color}
              className="edit-color-input"
              onChange={(e) => onEditColor(index, e.target.value)}
            />
            <button className="remove-color" onClick={(e) => {
              e.stopPropagation();
              onRemoveColor(index);
            }}>×</button>
          </div>
        ))}
        <div className="add-color-swatch" onClick={() => onAddColor('#000000')} title="Add a new color">
          +
        </div>
      </div>
    </div>
  );
};

export default Palette; 