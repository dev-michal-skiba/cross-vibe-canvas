import React, { useLayoutEffect, useRef, useState } from 'react';
import Grid from './Grid';
import './Canvas.css';

interface CanvasProps {
  rows: number;
  cols: number;
  zoom: number;
}

const PADDING = 20


const Canvas: React.FC<CanvasProps> = ({ rows, cols, zoom }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      let { clientWidth, clientHeight } = canvasRef.current;
      clientWidth -= PADDING;
      clientHeight -= PADDING;
      let cellSize: number;
      if (cols > rows) {
        cellSize = clientWidth / cols;
        setCellSize(cellSize);
      } else {
        cellSize = clientHeight / rows;
        setCellSize(cellSize);
      }
      setGridWidth(cellSize * cols);
      setGridHeight(cellSize * rows);
    }
  }, [rows, cols]);

  return (
    <div
      ref={canvasRef}
      className="canvas-container"
      style={{
        overflow: zoom > 1 ? 'auto' : 'hidden',
        padding: `${PADDING}px`,
      }}
    >
      <div style={{
        display: 'inline-block',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        width: `${gridWidth}px`,
        height: `${gridHeight}px`,
      }}>
        <Grid rows={rows} cols={cols} size={cellSize}/>
      </div>
    </div>
  );
};

export default Canvas;
