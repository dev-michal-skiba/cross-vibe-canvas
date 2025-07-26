import React, { useState } from 'react';
import './Palette.css';

interface PaletteProps {
  palette: string[];
  setPalette: React.Dispatch<React.SetStateAction<string[]>>;
  selectedColor: string | null;
  setSelectedColor: React.Dispatch<React.SetStateAction<string | null>>;
}

const Palette: React.FC<PaletteProps> = ({ palette, setPalette, selectedColor, setSelectedColor }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newColor, setNewColor] = useState('#000000');

  const handleAddConfirm = () => {
    if (newColor && !palette.includes(newColor)) {
      setPalette([...palette, newColor]);
    }
    setIsAdding(false);
  };

  const removeColor = (colorToRemove: string) => {
    setPalette(palette.filter(color => color !== colorToRemove));
    if (selectedColor === colorToRemove) {
      setSelectedColor(null);
    }
  };

  return (
    <div className="palette-container">
      <h3>Color Palette</h3>
      <div className="color-input-container">
        {isAdding ? (
          <div className="add-color-controls">
            <input
              type="color"
              value={newColor}
              onInput={(e) => setNewColor(e.currentTarget.value)}
            />
            <button className="confirm-add" onClick={handleAddConfirm}>✓</button>
            <button className="cancel-add" onClick={() => setIsAdding(false)}>×</button>
          </div>
        ) : (
          <button className="add-color-button" onClick={() => setIsAdding(true)}>+</button>
        )}
      </div>
      <div className="palette">
        {palette.map(color => (
          <div
            key={color}
            title={color}
            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          >
            <button className="remove-color" onClick={(e) => {
              e.stopPropagation();
              removeColor(color);
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Palette; 