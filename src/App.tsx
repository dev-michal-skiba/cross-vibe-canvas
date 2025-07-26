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
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [gridOpacity, setGridOpacity] = useState(1);
  const [fillsOpacity, setFillsOpacity] = useState(1);
  const [linesOpacity, setLinesOpacity] = useState(1);

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
      backgroundImage,
      imageOpacity,
      gridOpacity,
      fillsOpacity,
      linesOpacity,
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
      } catch (err: any) {
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
          setBackgroundImage(projectData.backgroundImage);
          setImageOpacity(projectData.imageOpacity ?? 1);
          setGridOpacity(projectData.gridOpacity ?? 1);
          setFillsOpacity(projectData.fillsOpacity ?? 1);
          setLinesOpacity(projectData.linesOpacity ?? 1);
        });
      }
    });
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                <label className="import-button">
                  Add Background
                  <input type="file" onChange={handleBackgroundImageUpload} accept="image/*" />
                </label>
              </div>
              <div className="sliders">
                <label>
                  Image Opacity:
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={imageOpacity}
                    onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Grid Opacity:
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Fills Opacity:
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fillsOpacity}
                    onChange={(e) => setFillsOpacity(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Lines Opacity:
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={linesOpacity}
                    onChange={(e) => setLinesOpacity(parseFloat(e.target.value))}
                  />
                </label>
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
                backgroundImage={backgroundImage}
                imageOpacity={imageOpacity}
                gridOpacity={gridOpacity}
                fillsOpacity={fillsOpacity}
                linesOpacity={linesOpacity}
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
