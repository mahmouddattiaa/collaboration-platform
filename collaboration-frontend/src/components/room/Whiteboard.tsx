import React, { useRef, useEffect } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useWhiteboard } from '@/hooks/useWhiteboard';
import { Button } from '@/components/ui/button';
import { Pen, Minus, Type, Square, Trash } from 'lucide-react';

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentRoom, updateWhiteboard, clearWhiteboard } = useCollaboration();

  const { startDrawing, finishDrawing, draw, setTool, setColor, clear } = useWhiteboard({
    canvasRef,
    initialElements: currentRoom?.whiteboard?.elements || [],
    onDraw: updateWhiteboard,
  });
  
  useEffect(() => {
    // This effect will run when the component mounts and when `currentRoom` changes.
    // It resizes the canvas to fit its container and redraws the elements from the server.
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    }
  }, [currentRoom]); // Redraw on any room update for simplicity
  
  const handleClear = () => {
    // This function will call the collaboration context to clear the board for everyone.
    // The `whiteboard:update` event from the server will then trigger the local clear.
    clearWhiteboard();
  };

  return (
    <div className="flex flex-col h-full bg-dark/50 rounded-lg overflow-hidden">
      <div className="p-2 bg-dark/70 border-b border-gray-700 flex items-center gap-2">
         <Button variant="ghost" size="icon" onClick={() => setTool('pencil')}><Pen className="h-5 w-5" /></Button>
         <Button variant="ghost" size="icon" onClick={() => setTool('line')}><Minus className="h-5 w-5" /></Button>
         <Button variant="ghost" size="icon" onClick={() => setTool('rectangle')}><Square className="h-5 w-5" /></Button>
         <input type="color" onChange={(e) => setColor(e.target.value)} className="bg-dark border-none" />
         <div className="flex-grow" />
         <Button variant="ghost" size="icon" onClick={handleClear}><Trash className="h-5 w-5 text-red-500" /></Button>
      </div>
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing} // Finish drawing if mouse leaves canvas
          className="absolute top-0 left-0"
        />
      </div>
    </div>
  );
}
