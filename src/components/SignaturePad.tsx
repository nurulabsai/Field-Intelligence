import React from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
  initialValue?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignature,
  initialValue,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasContent, setHasContent] = React.useState(!!initialValue);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Fill background
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Load initial value
    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0]!;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSignature(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, rect.width * (window.devicePixelRatio || 1), rect.height * (window.devicePixelRatio || 1));
    setHasContent(false);
    onSignature('');
  };

  return (
    <div className="font-[Inter,sans-serif]">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: hasContent
            ? '1px solid rgba(255,255,255,0.08)'
            : '2px dashed rgba(255,255,255,0.15)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-40 block bg-bg-tertiary touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasContent && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-tertiary text-[13px] pointer-events-none select-none">
            Sign here
          </div>
        )}
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 bg-transparent border border-border text-text-secondary text-[13px] font-medium font-[Inter,sans-serif] py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-150"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <Eraser size={14} />
          Clear
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
