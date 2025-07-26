import React, { useLayoutEffect, useRef, useState } from 'react';
import Grid from './Grid';
import './Canvas.css';

interface Point {
  x: number;
  y: number;
}

interface CanvasProps {
  rows: number;
  cols: number;
  zoom: number;
  lines: [Point, Point][];
  setLines: React.Dispatch<React.SetStateAction<[Point, Point][]>>;
  coloredCells: Set<string>;
  setColoredCells: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const PADDING = 20


const Canvas: React.FC<CanvasProps> = ({
  rows,
  cols,
  zoom,
  lines,
  setLines,
  coloredCells,
  setColoredCells,
}) => {
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
        <Grid
          rows={rows}
          cols={cols}
          size={cellSize}
          zoom={zoom}
          lines={lines}
          setLines={setLines}
          coloredCells={coloredCells}
          setColoredCells={setColoredCells}
        />
      </div>
    </div>
  );
};

export default Canvas;
