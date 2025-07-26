import { useState } from 'react'
import Canvas from './components/Canvas'
import ControlsInfo from './components/ControlsInfo'
import './App.css'

function App() {
  const [gridSize, setGridSize] = useState<{ rows: number; cols: number } | null>(null)
  const [rowsInput, setRowsInput] = useState(60)
  const [colsInput, setColsInput] = useState(60)
  const [zoom, setZoom] = useState(1)
  const [showControlsInfo, setShowControlsInfo] = useState(false)

  const handleCreateGrid = (e: React.FormEvent) => {
    e.preventDefault()
    setGridSize({ rows: rowsInput, cols: colsInput })
  }

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
          </form>
        ) : (
          <div>
            <div className="controls">
              <button onClick={() => setZoom(z => z * 1.2)}>Zoom In</button>
              <button onClick={() => setZoom(z => z / 1.2)}>Zoom Out</button>
              <button onClick={() => setZoom(1)}>Reset Zoom</button>
              <button onClick={() => setShowControlsInfo(true)}>How to Use</button>
            </div>
            <Canvas rows={gridSize.rows} cols={gridSize.cols} zoom={zoom} />
          </div>
        )}
        {showControlsInfo && <ControlsInfo onClose={() => setShowControlsInfo(false)} />}
      </main>
    </div>
  )
}

export default App
