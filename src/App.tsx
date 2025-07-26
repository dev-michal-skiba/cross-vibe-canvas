// @ts-nocheck
import { useState } from 'react';
import JSZip from 'jszip';
import Canvas from './components/Canvas';
import ControlsInfo from './components/ControlsInfo';
import Palette from './components/Palette';
import './App.css';
import type { Line } from './types';

function App() {
  const [gridSize, setGridSize] = useState<{ rows: number; cols: number } | null>(null);
  const [rowsInput, setRowsInput] = useState(60);
  const [colsInput, setColsInput] = useState(60);
  const [zoom, setZoom] = useState(1);
  const [showControlsInfo, setShowControlsInfo] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [coloredCells, setColoredCells] = useState<Map<string, string>>(new Map());
  const [palette, setPalette] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleCreateGrid = (e: React.FormEvent) => {
    e.preventDefault();
    setGridSize({ rows: rowsInput, cols: colsInput });
  };

  const handleExport = async () => {
    if (!gridSize) return;

    const projectData = {
      gridSize,
      lines,
      coloredCells: Array.from(coloredCells.entries()),
      palette,
    };

    const zip = new JSZip();
    zip.file("project.json", JSON.stringify(projectData));
    const content = await zip.generateAsync({ type: "blob" });

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'cross-stitch-project.zip',
          types: [{
            description: 'ZIP Files',
            accept: { 'application/zip': ['.zip'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
      }
    }

    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cross-stitch-project.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    JSZip.loadAsync(file).then((zip: any) => {
      const projectFile = zip.file("project.json");
      if (projectFile) {
        projectFile.async("string").then((content: string) => {
          const projectData = JSON.parse(content);
          setGridSize(projectData.gridSize);
          setLines(projectData.lines);
          setColoredCells(new Map(projectData.coloredCells));
          setPalette(projectData.palette);
        });
      }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cross-Stitch Pattern Creator</h1>
      </header>
      <main>
        {!gridSize ? (
          <form onSubmit={handleCreateGrid} className="controls">
            <label>
              Rows:
              <input
                type="number"
                value={rowsInput}
                onChange={(e) => setRowsInput(parseInt(e.target.value, 10))}
                min="1"
              />
            </label>
            <label>
              Columns:
              <input
                type="number"
                value={colsInput}
                onChange={(e) => setColsInput(parseInt(e.target.value, 10))}
                min="1"
              />
            </label>
            <button type="submit">Create Grid</button>
            <label className="import-button">
              Import Project
              <input type="file" onChange={handleImport} accept=".zip" />
            </label>
          </form>
        ) : (
          <div className="main-content">
            <div className="canvas-section">
              <div className="controls">
                <button onClick={() => setZoom(z => z * 1.2)}>Zoom In</button>
                <button onClick={() => setZoom(z => z / 1.2)}>Zoom Out</button>
                <button onClick={() => setZoom(1)}>Reset Zoom</button>
                <button onClick={() => setShowControlsInfo(true)}>How to Use</button>
                <button onClick={() => setGridSize(null)}>Reset Grid</button>
                <button onClick={handleExport}>Export Project</button>
              </div>
              <Canvas
                rows={gridSize.rows}
                cols={gridSize.cols}
                zoom={zoom}
                lines={lines}
                setLines={setLines}
                coloredCells={coloredCells}
                setColoredCells={setColoredCells}
                selectedColor={selectedColor}
              />
            </div>
            <Palette
              palette={palette}
              setPalette={setPalette}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
          </div>
        )}
        {showControlsInfo && <ControlsInfo onClose={() => setShowControlsInfo(false)} />}
      </main>
    </div>
  );
}

export default App;
