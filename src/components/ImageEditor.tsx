import React, { useEffect, useRef, useState, MouseEvent, TouchEvent } from 'react';
import { Download, Pencil, Eraser, RotateCcw } from 'lucide-react';

interface ImageEditorProps {
  binaryData: string;
  onClose: () => void;
}

export function ImageEditor({ binaryData, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const lines = binaryData.split('\n');
  const height = lines.length;
  const width = 100;
  const [isDrawMode, setIsDrawMode] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const cellSize = 6; // Smaller cell size for better mobile experience

  useEffect(() => {
    // Initialize grid with binary data in first 8 columns
    const initialGrid = lines.map(line => {
      const row = new Array(width).fill(false);
      // Fill first 8 columns with binary data
      for (let i = 0; i < 8; i++) {
        row[i] = line[i] === '1';
      }
      return row;
    });
    setGrid(initialGrid);
  }, [binaryData]);

  useEffect(() => {
    if (!canvasRef.current || grid.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#111827'; // bg-gray-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = '#ec4899'; // text-pink-500
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
        }
      });
    });
  }, [grid]);

  const handleDrawStart = (row: number, col: number) => {
    if (col < 8) return; // First 8 columns are read-only
    setIsDrawing(true);
    toggleCell(row, col);
  };

  const handleDrawMove = (row: number, col: number) => {
    if (!isDrawing || col < 8) return;
    toggleCell(row, col);
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
  };

  const toggleCell = (row: number, col: number) => {
    const newGrid = grid.map((r, y) =>
      r.map((cell, x) => (y === row && x === col ? isDrawMode : cell))
    );
    setGrid(newGrid);
  };

  const handlePointerEvent = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
    isStart = false
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);

    if (isStart) {
      handleDrawStart(y, x);
    } else {
      handleDrawMove(y, x);
    }
  };

  const resetCanvas = () => {
    const initialGrid = lines.map(line => {
      const row = new Array(width).fill(false);
      for (let i = 0; i < 8; i++) {
        row[i] = line[i] === '1';
      }
      return row;
    });
    setGrid(initialGrid);
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    // Use the actual canvas with full artwork
    const link = document.createElement('a');
    link.download = 'x.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-pink-500/30 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-pink-500">Image Editor</h2>
          <button
            onClick={onClose}
            className="text-pink-500 hover:text-pink-400 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Tool buttons */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsDrawMode(true)}
              className={`p-2 rounded-md transition-colors ${
                isDrawMode
                  ? 'bg-pink-500 text-gray-900'
                  : 'bg-gray-700 text-pink-500 hover:bg-gray-600'
              }`}
              title="Draw mode"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setIsDrawMode(false)}
              className={`p-2 rounded-md transition-colors ${
                !isDrawMode
                  ? 'bg-pink-500 text-gray-900'
                  : 'bg-gray-700 text-pink-500 hover:bg-gray-600'
              }`}
              title="Erase mode"
            >
              <Eraser size={16} />
            </button>
            <button
              onClick={resetCanvas}
              className="p-2 bg-gray-700 text-pink-500 rounded-md hover:bg-gray-600 transition-colors"
              title="Reset canvas"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 bg-gray-700 text-pink-500 rounded-md hover:bg-gray-600 transition-colors"
              title="Export as PNG"
            >
              <Download size={16} />
            </button>
          </div>

          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={width * cellSize}
              height={height * cellSize}
              className="border border-pink-500/30 touch-none"
              onMouseDown={(e) => handlePointerEvent(e, true)}
              onMouseMove={handlePointerEvent}
              onMouseUp={handleDrawEnd}
              onMouseLeave={handleDrawEnd}
              onTouchStart={(e) => handlePointerEvent(e, true)}
              onTouchMove={handlePointerEvent}
              onTouchEnd={handleDrawEnd}
            />
            <div className="absolute left-12 top-0 h-full border-l border-pink-500/30" />
          </div>

          <div className="text-xs text-pink-500/70 text-center">
            First 8 columns are read-only • {isDrawMode ? 'Draw' : 'Erase'} mode
          </div>
        </div>
      </div>
    </div>
  );
}
