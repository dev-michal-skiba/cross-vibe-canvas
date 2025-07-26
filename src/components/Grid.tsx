import React, { useRef, useEffect, useState } from 'react';
import './Grid.css';

interface Point {
  x: number;
  y: number;
}

interface GridProps {
  rows: number;
  cols: number;
  size: number;
  zoom: number;
  lines: [Point, Point][];
  setLines: React.Dispatch<React.SetStateAction<[Point, Point][]>>;
  coloredCells: Set<string>;
  setColoredCells: React.Dispatch<React.SetStateAction<Set<string>>>;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [mouseDownPos, setMouseDownPos] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = cols * size;
    canvas.height = rows * size;

    ctx.fillStyle = 'gray';
    coloredCells.forEach(cell => {
      const [row, col] = cell.split('-').map(Number);
      ctx.fillRect(col * size, row * size, size, size);
    });

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

    ctx.strokeStyle = 'black';
    lines.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    if (isDrawing && startPoint && endPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  }, [rows, cols, size, lines, isDrawing, startPoint, endPoint, coloredCells]);

  const findClickedLine = (clickPos: Point): number | null => {
    const CLICK_THRESHOLD = 5 / zoom;
    let closestLineIndex: number | null = null;
    let minDistance = Infinity;
    lines.forEach((line, index) => {
      const distance = pointToLineSegmentDistance(clickPos, line[0], line[1]);
      if (distance < CLICK_THRESHOLD && distance < minDistance) {
        minDistance = distance;
        closestLineIndex = index;
      }
    });
    return closestLineIndex;
  };

  const getMousePos = (evt: React.MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) / zoom,
      y: (evt.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = (evt: React.MouseEvent) => {
    const pos = getMousePos(evt);
    if (!pos) return;

    setMouseDownPos(pos);

    if (evt.ctrlKey && evt.button === 0) {
      setIsDrawing(true);
      const snappedPos = {
        x: Math.round(pos.x / size) * size,
        y: Math.round(pos.y / size) * size,
      };
      setStartPoint(snappedPos);
      setEndPoint(snappedPos);
    }
  };

  const handleMouseMove = (evt: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(evt);
    if (!pos) return;
    const snappedPos = {
      x: Math.round(pos.x / size) * size,
      y: Math.round(pos.y / size) * size,
    };
    setEndPoint(snappedPos);
  };

  const handleMouseUp = (evt: React.MouseEvent) => {
    const pos = getMousePos(evt);
    if (!pos || !mouseDownPos) return;

    if (isDrawing) {
      if (startPoint && endPoint && (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y)) {
        setLines([...lines, [startPoint, endPoint]]);
      }
    } else {
      const dist = Math.sqrt(Math.pow(pos.x - mouseDownPos.x, 2) + Math.pow(pos.y - mouseDownPos.y, 2));
      if (!evt.ctrlKey && evt.button === 0 && dist < 5) {
        const col = Math.floor(pos.x / size);
        const row = Math.floor(pos.y / size);
        setColoredCells(prev => new Set(prev).add(`${row}-${col}`));
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
    setMouseDownPos(null);
  };

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
        const newCells = new Set(prev);
        newCells.delete(`${row}-${col}`);
        return newCells;
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="grid-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    />
  );
};

export default Grid;
