// @ts-nocheck
import { useState } from 'react';
import JSZip from 'jszip';
import Canvas from './components/Canvas';
import ControlsInfo from './components/ControlsInfo';
import Palette from './components/Palette';
import './App.css';
import type { Line } from './types';
import { useHotkeys } from 'react-hotkeys-hook';

function App() {
  const [gridSize, setGridSize] = useState<{ rows: number; cols: number } | null>(null);
  const [rowsInput, setRowsInput] = useState(60);
  const [colsInput, setColsInput] = useState(60);
  const [zoom, setZoom] = useState(1);
  const [showControlsInfo, setShowControlsInfo] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [coloredCells, setColoredCells] = useState<Map<string, string>>(new Map());
  const [palette, setPalette] = useState<string[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [gridOpacity, setGridOpacity] = useState(1);
  const [fillsOpacity, setFillsOpacity] = useState(1);
  const [linesOpacity, setLinesOpacity] = useState(1);
  const [stitchOpacity, setStitchOpacity] = useState(1);
  const [crossLinesOpacity, setCrossLinesOpacity] = useState(1);

  const handleStartNewProject = () => {
    setGridSize(null);
    setLines([]);
    setColoredCells(new Map());
    setPalette([]);
    setSelectedColorIndex(null);
    setBackgroundImage(null);
    setBackgroundImageFile(null);
    setZoom(1.0);
    setImageOpacity(1);
    setGridOpacity(1);
    setStitchOpacity(1);
    setCrossLinesOpacity(1);
  };

  const handleAddColorToPalette = (newColor: string) => {
    if (newColor) {
      setPalette([...palette, newColor]);
    }
  };

  const handleRemoveColorFromPalette = (indexToRemove: number) => {
    setPalette(palette.filter((_, index) => index !== indexToRemove));
    if (selectedColorIndex !== null) {
      if (indexToRemove === selectedColorIndex) {
        setSelectedColorIndex(null);
      } else if (indexToRemove < selectedColorIndex) {
        setSelectedColorIndex(selectedColorIndex - 1);
      }
    }
  };

  const handleEditColorInPalette = (index: number, newColor: string) => {
    const oldColor = palette[index];
    if (oldColor === newColor) return;

    const newPalette = palette.map((c, i) => (i === index ? newColor : c));
    setPalette(newPalette);

    const occurrences = palette.filter(c => c === oldColor).length;
    if (occurrences === 1) {
      const newColoredCells = new Map<string, string>();
      coloredCells.forEach((color, cell) => {
        newColoredCells.set(cell, color === oldColor ? newColor : color);
      });
      setColoredCells(newColoredCells);
    }
  };

  const handleCreateGrid = (e: React.FormEvent) => {
    e.preventDefault();
    setGridSize({ rows: rowsInput, cols: colsInput });
  };

  const handleExport = async () => {
    if (!gridSize) return;

    const zip = new JSZip();
    let backgroundImageValue = null;

    if (backgroundImageFile) {
      backgroundImageValue = backgroundImageFile.name;
      zip.file(backgroundImageFile.name, backgroundImageFile);
    } else if (backgroundImage) {
      backgroundImageValue = backgroundImage;
    }

    const projectData = {
      gridSize,
      lines,
      coloredCells: Array.from(coloredCells.entries()),
      palette,
      selectedColorIndex,
      backgroundImage: backgroundImageValue,
      imageOpacity,
      gridOpacity,
      fillsOpacity,
      linesOpacity,
      stitchOpacity,
      crossLinesOpacity,
    };

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
          setSelectedColorIndex(projectData.selectedColorIndex ?? null);

          if (projectData.backgroundImage) {
            if (typeof projectData.backgroundImage === 'string' && projectData.backgroundImage.startsWith('data:image')) {
              setBackgroundImage(projectData.backgroundImage);
              setBackgroundImageFile(null);
            } else {
              const imageFile = zip.file(projectData.backgroundImage);
              if (imageFile) {
                imageFile.async("blob").then((blob: Blob) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setBackgroundImage(reader.result as string);
                  };
                  reader.readAsDataURL(blob);

                  const rehydratedFile = new File([blob], projectData.backgroundImage, { type: blob.type });
                  setBackgroundImageFile(rehydratedFile);
                });
              } else {
                setBackgroundImage(null);
                setBackgroundImageFile(null);
              }
            }
          } else {
            setBackgroundImage(null);
            setBackgroundImageFile(null);
          }

          setImageOpacity(projectData.imageOpacity ?? 1);
          setGridOpacity(projectData.gridOpacity ?? 1);
          setFillsOpacity(projectData.fillsOpacity ?? 1);
          setLinesOpacity(projectData.linesOpacity ?? 1);
          setStitchOpacity(projectData.stitchOpacity ?? 1);
          setCrossLinesOpacity(projectData.crossLinesOpacity ?? 1);
        });
      }
    });
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImageFile(file);
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
        <div className="header-left">
          <h1>Cross-Stitch Pattern Creator</h1>
        </div>
        {gridSize && (
          <div className="header-right">
            <button onClick={handleStartNewProject} className="header-button">Start New Project</button>
            <button onClick={() => setShowControlsInfo(true)} className="header-button">Controls</button>
          </div>
        )}
      </header>
      <main>
        {gridSize ? (
          <div className="main-content">
            <div className="canvas-section">
              <Canvas
                rows={gridSize.rows}
                cols={gridSize.cols}
                zoom={zoom}
                lines={lines}
                setLines={setLines}
                coloredCells={coloredCells}
                setColoredCells={setColoredCells}
                selectedColor={selectedColorIndex !== null ? palette[selectedColorIndex] : null}
                backgroundImage={backgroundImage}
                imageOpacity={imageOpacity}
                gridOpacity={gridOpacity}
                fillsOpacity={fillsOpacity}
                linesOpacity={linesOpacity}
                stitchOpacity={stitchOpacity}
                crossLinesOpacity={crossLinesOpacity}
              />
            </div>
            <div className="controls-section">
              <div className="control-group">
                <h4>Zoom</h4>
                <div className="zoom-controls">
                  <input
                    type="number"
                    value={zoom.toFixed(1)}
                    readOnly
                    className="zoom-input"
                  />
                  <button onClick={() => setZoom(z => Math.max(1.0, parseFloat((z - 0.1).toFixed(2))))}>-</button>
                  <button onClick={() => setZoom(z => parseFloat((z + 0.1).toFixed(2)))}>+</button>
                  <button onClick={() => setZoom(1)}>Reset</button>
                </div>
              </div>
              <div className="control-group">
                <h4>Opacity</h4>
                <div className="opacity-controls">
                  <div className="opacity-slider-row">
                    <label htmlFor="image-opacity">Background</label>
                    <input id="image-opacity" type="range" min="0" max="1" step="0.05" value={imageOpacity} onChange={e => setImageOpacity(parseFloat(e.target.value))} />
                  </div>
                  <div className="opacity-slider-row">
                    <label htmlFor="grid-opacity">Grid</label>
                    <input id="grid-opacity" type="range" min="0" max="1" step="0.05" value={gridOpacity} onChange={e => setGridOpacity(parseFloat(e.target.value))} />
                  </div>
                  <div className="opacity-slider-row">
                    <label htmlFor="stitch-opacity">Stitch</label>
                    <input id="stitch-opacity" type="range" min="0" max="1" step="0.05" value={stitchOpacity} onChange={e => setStitchOpacity(parseFloat(e.target.value))} />
                  </div>
                  <div className="opacity-slider-row">
                    <label htmlFor="cross-lines-opacity">Line</label>
                    <input id="cross-lines-opacity" type="range" min="0" max="1" step="0.05" value={crossLinesOpacity} onChange={e => setCrossLinesOpacity(parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="control-group">
                <h4>Other</h4>
                <div className="other-controls">
                  <button className="import-button-style-as-button" onClick={() => document.getElementById('background-image-upload')?.click()}>
                    Add Background
                  </button>
                  <input id="background-image-upload" type="file" onChange={handleBackgroundImageUpload} accept="image/*" style={{ display: 'none' }} />
                  <button onClick={handleExport}>Export Project</button>
                </div>
              </div>
              <div className="control-group">
                <h4>Color Palette</h4>
                <Palette
                  palette={palette}
                  selectedColorIndex={selectedColorIndex}
                  setSelectedColorIndex={setSelectedColorIndex}
                  onAddColor={handleAddColorToPalette}
                  onRemoveColor={handleRemoveColorFromPalette}
                  onEditColor={handleEditColorInPalette}
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="start-view-container">
            <form onSubmit={handleCreateGrid} className="create-grid-form">
              <label>
                Rows:
                <input
                  type="number"
                  value={rowsInput}
                  onChange={(e) => setRowsInput(parseInt(e.target.value, 10))}
                  min="1"
                  className="grid-size-input"
                />
              </label>
              <label>
                Columns:
                <input
                  type="number"
                  value={colsInput}
                  onChange={(e) => setColsInput(parseInt(e.target.value, 10))}
                  min="1"
                  className="grid-size-input"
                />
              </label>
              <button type="submit">Create Grid</button>
            </form>
            <span className="or-divider">or</span>
            <div>
              <button onClick={() => document.getElementById('project-import-input')?.click()}>
                Import Project
              </button>
              <input id="project-import-input" type="file" onChange={handleImport} accept=".zip" style={{ display: 'none' }} />
            </div>
          </div>
        )}
        {showControlsInfo && <ControlsInfo onClose={() => setShowControlsInfo(false)} />}
      </main>
    </div>
  );
}

export default App;
