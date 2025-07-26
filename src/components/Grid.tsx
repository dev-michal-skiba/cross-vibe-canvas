import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { Line, Point } from '../types';
import './Grid.css';

interface GridProps {
  rows: number;
  cols: number;
  size: number;
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

function pointToLineSegmentDistance(p: Point, p1: Point, p2: Point): number {
  const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
  if (l2 === 0) return Math.sqrt((p.x - p1.x) ** 2 + (p.y - p1.y) ** 2);

  let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };

  return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
}

const Grid: React.FC<GridProps> = ({
  rows,
  cols,
  size,
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
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [mouseDownPos, setMouseDownPos] = useState<Point | null>(null);
  const [redrawCounter, setRedrawCounter] = useState(0);

  const { width, height } = useMemo(() => ({
    width: cols * size,
    height: rows * size,
  }), [cols, size, rows]);

  const backgroundCanvas = useMemo(() => document.createElement('canvas'), []);
  const fillsCanvas = useMemo(() => document.createElement('canvas'), []);
  const linesCanvas = useMemo(() => document.createElement('canvas'), []);
  const gridCanvas = useMemo(() => document.createElement('canvas'), []);

  // Draw background image
  useEffect(() => {
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    const ctx = backgroundCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setRedrawCounter(c => c + 1);
      };
    } else {
      setRedrawCounter(c => c + 1);
    }
  }, [backgroundImage, width, height, backgroundCanvas]);

  // Draw fills
  useEffect(() => {
    fillsCanvas.width = width;
    fillsCanvas.height = height;
    const ctx = fillsCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    coloredCells.forEach((color, cell) => {
      ctx.fillStyle = color;
      const [row, col] = cell.split('-').map(Number);
      ctx.fillRect(col * size, row * size, size, size);
    });
  }, [coloredCells, width, height, size, fillsCanvas]);

  // Draw lines
  useEffect(() => {
    linesCanvas.width = width;
    linesCanvas.height = height;
    const ctx = linesCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    lines.forEach(({ start, end, color }) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  }, [lines, width, height, linesCanvas]);
  
  // Draw grid
  useEffect(() => {
    gridCanvas.width = width;
    gridCanvas.height = height;
    const ctx = gridCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(cols * size, i * size);
      ctx.stroke();
    }
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, rows * size);
      ctx.stroke();
    }
  }, [rows, cols, size, width, height, gridCanvas]);
  
  // Composite all layers
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (backgroundImage) {
      ctx.globalAlpha = imageOpacity;
      ctx.drawImage(backgroundCanvas, 0, 0);
    }

    // Draw grid
    ctx.globalAlpha = gridOpacity;
    ctx.drawImage(gridCanvas, 0, 0);

    // Draw fills
    ctx.globalAlpha = stitchOpacity;
    ctx.drawImage(fillsCanvas, 0, 0);

    // Draw lines
    ctx.globalAlpha = crossLinesOpacity;
    ctx.drawImage(linesCanvas, 0, 0);

    // Reset alpha for temporary drawing
    ctx.globalAlpha = 1;
    if (isDrawing && startPoint && endPoint) {
      ctx.strokeStyle = selectedColor || 'black';
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  }, [
    width, height, backgroundImage, imageOpacity, stitchOpacity, crossLinesOpacity, gridOpacity,
    backgroundCanvas, fillsCanvas, linesCanvas, gridCanvas,
    isDrawing, startPoint, endPoint, selectedColor,
    lines, coloredCells, redrawCounter
  ]);

  const getSnappedPos = useCallback((pos: Point): Point => {
    const snapSize = size / 2;
    const x = Math.round(pos.x / snapSize) * snapSize;
    const y = Math.round(pos.y / snapSize) * snapSize;
    return { x, y };
  }, [size]);

  const findClickedLine = (clickPos: Point): number | null => {
    const CLICK_THRESHOLD = 5 / zoom;
    let closestLineIndex: number | null = null;
    let minDistance = Infinity;
    lines.forEach((line, index) => {
      const distance = pointToLineSegmentDistance(clickPos, line.start, line.end);
      if (distance < CLICK_THRESHOLD && distance < minDistance) {
        minDistance = distance;
        closestLineIndex = index;
      }
    });
    return closestLineIndex;
  };

  const getMousePos = (evt: React.MouseEvent): Point | null => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) / zoom,
      y: (evt.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = useCallback((evt: React.MouseEvent) => {
    const pos = getMousePos(evt);
    if (!pos) return;

    setMouseDownPos(pos);

    if (evt.ctrlKey && evt.button === 0) {
      if (!selectedColor) {
        alert("Please select a color from the palette before drawing.");
        return;
      }
      setIsDrawing(true);
      const snappedPos = getSnappedPos(pos);
      setStartPoint(snappedPos);
      setEndPoint(snappedPos);
    }
  }, [selectedColor, getSnappedPos]);

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(evt);
    if (!pos) return;
    const snappedPos = getSnappedPos(pos);
    setEndPoint(snappedPos);
  }, [isDrawing, getSnappedPos]);

  const handleMouseUp = useCallback((evt: React.MouseEvent) => {
    const pos = getMousePos(evt);
    if (!pos || !mouseDownPos) return;

    if (isDrawing && selectedColor) {
      if (startPoint && endPoint && (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y)) {
        setLines([...lines, { start: startPoint, end: endPoint, color: selectedColor }]);
      }
    } else {
      const dist = Math.sqrt(Math.pow(pos.x - mouseDownPos.x, 2) + Math.pow(pos.y - mouseDownPos.y, 2));
      if (!evt.ctrlKey && evt.button === 0 && dist < 5) {
        if (!selectedColor) {
          alert("Please select a color from the palette before filling cells.");
          return;
        }
        const col = Math.floor(pos.x / size);
        const row = Math.floor(pos.y / size);
        setColoredCells(prev => new Map(prev).set(`${row}-${col}`, selectedColor));
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
    setMouseDownPos(null);
  }, [isDrawing, selectedColor, startPoint, endPoint, mouseDownPos, lines, setLines, setColoredCells, size]);

  const handleContextMenu = (evt: React.MouseEvent) => {
    evt.preventDefault();
    const pos = getMousePos(evt);
    if (!pos) return;

    if (evt.ctrlKey) {
      const lineIndex = findClickedLine(pos);
      if (lineIndex !== null) {
        setLines(lines.filter((_, index) => index !== lineIndex));
      }
    } else {
      const col = Math.floor(pos.x / size);
      const row = Math.floor(pos.y / size);
      setColoredCells(prev => {
        const newCells = new Map(prev);
        newCells.delete(`${row}-${col}`);
        return newCells;
      });
    }
  };

  return (
    <canvas
      ref={mainCanvasRef}
      className="grid-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    />
  );
};

export default Grid;
