import React from 'react';
import './Palette.css';

interface PaletteProps {
  palette: string[];
  selectedColor: string | null;
  setSelectedColor: React.Dispatch<React.SetStateAction<string | null>>;
  onAddColor: (newColor: string) => void;
  onRemoveColor: (color: string) => void;
  onEditColor: (oldColor: string, newColor: string) => void;
}

const Palette: React.FC<PaletteProps> = ({ palette, selectedColor, setSelectedColor, onAddColor, onRemoveColor, onEditColor }) => {
  return (
    <div>
      <div className="palette">
        {palette.map((color, index) => (
          <div
            key={index}
            title={color}
            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          >
            <input
              type="color"
              value={color}
              className="edit-color-input"
              onChange={(e) => onEditColor(color, e.target.value)}
            />
            <button className="remove-color" onClick={(e) => {
              e.stopPropagation();
              onRemoveColor(color);
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