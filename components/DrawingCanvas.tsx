import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { DesignElement, BrushPreset } from '../types';
import { EraserIcon, BrushIcon } from 'lucide-react';
import { BRUSH_PRESETS } from '../constants';

interface DrawingCanvasProps {
    elementToEdit: DesignElement;
    onSave: (elementId: string, dataUrl: string) => void;
    onClose: () => void;
}

type Tool = 'erase' | 'reveal';

const Property: React.FC<{ label: string, children: React.ReactNode, className?: string }> = ({ label, children, className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <label className="text-xs text-slate-600 w-16">{label}</label>
        <div className="flex-1">{children}</div>
    </div>
);

const BrushVisualizer: React.FC<{ size: number, hardness: number }> = ({ size, hardness }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        const radius = size / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(Math.min(1, hardness + 0.01), 'black');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

    }, [size, hardness]);

    return <canvas ref={canvasRef} className="w-24 h-24 bg-slate-200 rounded-md" />;
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ elementToEdit, onSave, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const lastPointRef = useRef<{x: number, y: number} | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const [activeTool, setActiveTool] = useState<Tool>('erase');
    const [activeBrush, setActiveBrush] = useState<BrushPreset>(BRUSH_PRESETS[0]);
    const [brushSize, setBrushSize] = useState(activeBrush.settings.size);
    const [brushHardness, setBrushHardness] = useState(activeBrush.settings.hardness);
    const [brushOpacity, setBrushOpacity] = useState(activeBrush.settings.opacity);
    
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = elementToEdit.width;
        canvas.height = elementToEdit.height;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        contextRef.current = context;

        if (elementToEdit.mask?.enabled && elementToEdit.mask.dataUrl) {
            const img = new Image();
            img.onload = () => context.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = elementToEdit.mask.dataUrl;
        } else {
            // If no mask, start with a fully revealed (white) mask
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [elementToEdit]);

    useEffect(() => {
        setBrushSize(activeBrush.settings.size);
        setBrushHardness(activeBrush.settings.hardness);
        setBrushOpacity(activeBrush.settings.opacity);
    }, [activeBrush]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const clientX = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientX : e.nativeEvent.clientX;
        const clientY = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientY : e.nativeEvent.clientY;
        return { offsetX: clientX - rect.left, offsetY: clientY - rect.top };
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDrawing(true);
        const { offsetX, offsetY } = getCoords(e);
        lastPointRef.current = { x: offsetX, y: offsetY };
        draw(e); // Draw a single point on click
    };

    const finishDrawing = () => {
        setIsDrawing(false);
        lastPointRef.current = null;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !contextRef.current) return;
        e.preventDefault();
        
        const { offsetX, offsetY } = getCoords(e);
        const context = contextRef.current;
        
        const lastPoint = lastPointRef.current || { x: offsetX, y: offsetY };
        const dist = Math.hypot(offsetX - lastPoint.x, offsetY - lastPoint.y);
        const angle = Math.atan2(offsetY - lastPoint.y, offsetX - lastPoint.x);
        
        context.globalAlpha = brushOpacity;
        if (activeTool === 'erase') {
             context.globalCompositeOperation = 'destination-out';
        } else {
             context.globalCompositeOperation = 'source-over';
        }
        
        // Draw circles along the path to ensure a solid line
        for (let i = 0; i < dist; i++) {
            const x = lastPoint.x + (Math.cos(angle) * i);
            const y = lastPoint.y + (Math.sin(angle) * i);
            
            const gradient = context.createRadialGradient(x, y, 0, x, y, brushSize / 2);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(Math.max(0, brushHardness), 'rgba(255,255,255,1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, brushSize / 2, 0, Math.PI * 2);
            context.fill();
        }

        lastPointRef.current = { x: offsetX, y: offsetY };
    };
    
    return (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
            <div className="absolute top-4 left-4 z-50 w-72 max-h-[calc(100vh-2rem)] bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border overflow-hidden flex flex-col">
                <div className="p-3 border-b">
                    <h3 className="text-sm font-semibold text-slate-800">Editar Máscara</h3>
                </div>
                 <div className="p-3 border-b flex items-center gap-2">
                    <button onClick={() => setActiveTool('erase')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md ${activeTool === 'erase' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`} title="Borrar (oculta)">
                        <EraserIcon className="h-5 w-5" /> <span className="text-sm font-medium">Borrar</span>
                    </button>
                    <button onClick={() => setActiveTool('reveal')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md ${activeTool === 'reveal' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`} title="Revelar">
                        <BrushIcon className="h-5 w-5" /> <span className="text-sm font-medium">Revelar</span>
                    </button>
                </div>
                <div className="p-3 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ajustes</h4>
                    <div className="flex justify-center">
                        <BrushVisualizer size={brushSize} hardness={brushHardness} />
                    </div>
                    <Property label={`Tamaño: ${brushSize}px`}>
                        <input type="range" min="1" max="200" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value, 10))} className="w-full" />
                    </Property>
                    <Property label={`Dureza: ${Math.round(brushHardness*100)}%`}>
                        <input type="range" min="0" max="1" step="0.01" value={brushHardness} onChange={e => setBrushHardness(parseFloat(e.target.value))} className="w-full" />
                    </Property>
                    <Property label={`Opacidad: ${Math.round(brushOpacity*100)}%`}>
                         <input type="range" min="0" max="1" step="0.01" value={brushOpacity} onChange={e => setBrushOpacity(parseFloat(e.target.value))} className="w-full" />
                    </Property>
                </div>
                <div className="p-3 border-t">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Pinceles</h4>
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2">
                        {BRUSH_PRESETS.map(preset => (
                            <button key={preset.id} onClick={() => setActiveBrush(preset)} className={`p-2 rounded-md border-2 transition ${activeBrush.id === preset.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-slate-100'}`}>
                                <div className="h-16 bg-slate-200 rounded-sm flex items-center justify-center" dangerouslySetInnerHTML={{ __html: preset.preview }} />
                                <p className="text-xs text-slate-700 mt-1 truncate">{preset.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-3 mt-auto border-t flex items-center gap-2">
                     <button onClick={onClose} className="flex-1 px-3 py-2 rounded-md bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-sm font-medium" title="Cancelar">
                        Cancelar
                    </button>
                    <button onClick={() => onSave(elementToEdit.id, canvasRef.current!.toDataURL())} className="flex-1 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent text-sm font-medium" title="Finalizar">
                        Finalizar
                    </button>
                </div>
            </div>

            <div className="relative" style={{ width: elementToEdit.width, height: elementToEdit.height }}>
                <div className="absolute inset-0 bg-white" style={{ background: 'conic-gradient(#d1d5db 25%, #f9fafb 0 50%, #d1d5db 0 75%, #f9fafb 0)', backgroundSize: '20px 20px' }}></div>
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseLeave={finishDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={finishDrawing}
                    onTouchMove={draw}
                />
            </div>
        </div>
    );
};
