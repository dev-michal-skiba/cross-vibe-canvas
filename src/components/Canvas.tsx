import React, { useLayoutEffect, useRef, useState } from 'react';
import Grid from './Grid';
import './Canvas.css';
import type { Line } from '../types';
import { useResizeObserver } from '../hooks/useResizeObserver';

interface CanvasProps {
  rows: number;
  cols: number;
  zoom: number;
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  coloredCells: Map<string, string>;
  setColoredCells: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  selectedColor: string | null;
  backgroundImage: string | null;
  imageOpacity: number;
  gridOpacity: number;
  stitchOpacity: number;
  crossLinesOpacity: number;
}

const Canvas: React.FC<CanvasProps> = ({
  rows,
  cols,
  zoom,
  lines,
  setLines,
  coloredCells,
  setColoredCells,
  selectedColor,
  backgroundImage,
  imageOpacity,
  gridOpacity,
  stitchOpacity,
  crossLinesOpacity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeEntry = useResizeObserver(containerRef as React.RefObject<HTMLElement>);
  const [cellSize, setCellSize] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);

  useLayoutEffect(() => {
    if (resizeEntry) {
      const { width, height } = resizeEntry.contentRect;
      const hCellSize = height / rows;
      const wCellSize = width / cols;
      const newCellSize = Math.min(hCellSize, wCellSize);
      setCellSize(newCellSize);
      setGridWidth(newCellSize * cols);
      setGridHeight(newCellSize * rows);
    }
  }, [rows, cols, resizeEntry]);

  return (
    <div
      ref={containerRef}
      className="canvas-container"
    >
      <div style={{
        width: `${gridWidth}px`,
        height: `${gridHeight}px`,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {cellSize > 0 && <Grid
          rows={rows}
          cols={cols}
          size={cellSize}
          zoom={zoom}
          lines={lines}
          setLines={setLines}
          coloredCells={coloredCells}
          setColoredCells={setColoredCells}
          selectedColor={selectedColor}
          backgroundImage={backgroundImage}
          imageOpacity={imageOpacity}
          gridOpacity={gridOpacity}
          stitchOpacity={stitchOpacity}
          crossLinesOpacity={crossLinesOpacity}
        />}
      </div>
    </div>
  );
};

export default Canvas;
