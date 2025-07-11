import React from 'react';
import './Grid.css';

interface GridProps {
  rows: number;
  cols: number;
  size: number;
}

const Grid: React.FC<GridProps> = ({ rows, cols, size }) => {
  const gridStyle = {
    gridTemplateRows: `repeat(${rows}, ${size}px)`,
    gridTemplateColumns: `repeat(${cols}, ${size}px)`,
  };

  const cells = [];
  for (let i = 0; i < rows * cols; i++) {
    cells.push(<div key={i} className="grid-cell"></div>);
  }

  return (
    <div className="grid" style={gridStyle}>
      {cells}
    </div>
  );
};

export default Grid;
