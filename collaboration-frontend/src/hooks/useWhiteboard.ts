import { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardElement } from '@/contexts/CollaborationContext';

interface UseWhiteboardProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  initialElements?: WhiteboardElement[];
  onDraw: (elements: WhiteboardElement[]) => void;
}

export function useWhiteboard({ canvasRef, initialElements = [], onDraw }: UseWhiteboardProps) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const [elements, setElements] = useState<WhiteboardElement[]>(initialElements);
  const [tool, setTool] = useState<'pencil' | 'line' | 'rectangle'>('pencil');
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
    }
  }, [canvasRef]);

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  
    switch (element.type) {
      case 'pencil':
        ctx.beginPath();
        if (element.points && element.points.length > 0) {
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
        }
        ctx.stroke();
        break;
      case 'line':
        if (element.points && element.points.length === 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          ctx.lineTo(element.points[1].x, element.points[1].y);
          ctx.stroke();
        }
        break;
      case 'rectangle':
        if (element.x && element.y && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;
      default:
        break;
    }
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(element => drawElement(ctx, element));
  }, [canvasRef, elements, drawElement]);

  useEffect(() => {
    redrawCanvas();
  }, [elements, redrawCanvas]);

  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);


  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    isDrawing.current = true;
    const newElement: WhiteboardElement = {
      id: new Date().toISOString(),
      type: tool,
      color,
      strokeWidth,
      points: [{ x: offsetX, y: offsetY }],
      x: offsetX,
      y: offsetY,
      width: 0,
      height: 0,
    };
    setElements(prev => [...prev, newElement]);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = event.nativeEvent;
    
    setElements(prev =>
      prev.map((el, index) => {
        if (index === prev.length - 1) {
          if (el.type === 'pencil') {
            return { ...el, points: [...(el.points || []), { x: offsetX, y: offsetY }] };
          }
          if (el.type === 'line') {
             return { ...el, points: [el.points![0], { x: offsetX, y: offsetY }] };
          }
          if (el.type === 'rectangle') {
            return { ...el, width: offsetX - el.x!, height: offsetY - el.y! };
          }
        }
        return el;
      })
    );
  };

  const finishDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    onDraw(elements);
  };
  
  const clear = () => {
    setElements([]);
  }

  return {
    startDrawing,
    finishDrawing,
    draw,
    setTool,
    setColor,
    setStrokeWidth,
    clear,
  };
}
