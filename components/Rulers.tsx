import React, { useRef, useEffect } from 'react';
import { ViewState } from '../types';

interface RulersProps {
    viewState: ViewState;
    onAddGuide: (axis: 'horizontal' | 'vertical', position: number) => void;
    workspaceRef: React.RefObject<HTMLDivElement>;
}

const RULER_WIDTH = 24; // in pixels

export const Rulers: React.FC<RulersProps> = ({ viewState, onAddGuide, workspaceRef }) => {
    const horizontalRulerRef = useRef<HTMLCanvasElement>(null);
    const verticalRulerRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const horizontalCanvas = horizontalRulerRef.current;
        const verticalCanvas = verticalRulerRef.current;
        const workspace = workspaceRef.current;

        if (!horizontalCanvas || !verticalCanvas || !workspace) return;
        
        const ctxH = horizontalCanvas.getContext('2d');
        const ctxV = verticalCanvas.getContext('2d');
        if (!ctxH || !ctxV) return;

        const dpr = window.devicePixelRatio || 1;
        
        const drawRulers = () => {
            const { width, height } = workspace.getBoundingClientRect();
            
            horizontalCanvas.width = width * dpr;
            horizontalCanvas.height = RULER_WIDTH * dpr;
            ctxH.scale(dpr, dpr);
            
            verticalCanvas.width = RULER_WIDTH * dpr;
            verticalCanvas.height = height * dpr;
            ctxV.scale(dpr, dpr);

            // Clear
            ctxH.clearRect(0, 0, width, RULER_WIDTH);
            ctxV.clearRect(0, 0, RULER_WIDTH, height);

            // Background
            ctxH.fillStyle = '#f8fafc';
            ctxH.fillRect(0, 0, width, RULER_WIDTH);
            ctxV.fillStyle = '#f8fafc';
            ctxV.fillRect(0, 0, RULER_WIDTH, height);
            
            // Style
            ctxH.strokeStyle = '#cbd5e1';
            ctxH.fillStyle = '#64748b';
            ctxH.font = '10px sans-serif';
            ctxV.strokeStyle = '#cbd5e1';
            ctxV.fillStyle = '#64748b';
            ctxV.font = '10px sans-serif';

            const { zoom, pan } = viewState;

            // Determine tick spacing based on zoom
            const increments = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
            let majorTick = 100;
            for(const inc of increments) {
                if (inc * zoom > 40) { // minimum pixels between major ticks
                    majorTick = inc;
                    break;
                }
            }
            const minorTick = majorTick / 5;
            
            // Horizontal Ruler
            ctxH.beginPath();
            const startX = -pan.x / zoom;
            const endX = (width - pan.x) / zoom;
            for (let i = Math.floor(startX / minorTick) * minorTick; i < endX; i += minorTick) {
                const x = pan.x + i * zoom;
                const isMajor = i % majorTick === 0;
                ctxH.moveTo(x, RULER_WIDTH);
                ctxH.lineTo(x, RULER_WIDTH - (isMajor ? 10 : 5));
                if (isMajor) {
                    ctxH.fillText(String(i), x + 2, 12);
                }
            }
            ctxH.stroke();

            // Vertical Ruler
            ctxV.beginPath();
            const startY = -pan.y / zoom;
            const endY = (height - pan.y) / zoom;
             for (let i = Math.floor(startY / minorTick) * minorTick; i < endY; i += minorTick) {
                const y = pan.y + i * zoom;
                const isMajor = i % majorTick === 0;
                ctxV.moveTo(RULER_WIDTH, y);
                ctxV.lineTo(RULER_WIDTH - (isMajor ? 10 : 5), y);
                if (isMajor) {
                    ctxV.save();
                    ctxV.translate(10, y + 2);
                    ctxV.rotate(-Math.PI / 2);
                    ctxV.fillText(String(i), 0, 0);
                    ctxV.restore();
                }
            }
            ctxV.stroke();
        };

        const observer = new ResizeObserver(drawRulers);
        observer.observe(workspace);
        
        drawRulers();

        return () => observer.disconnect();

    }, [viewState, workspaceRef]);
    
    const handleMouseDown = (e: React.MouseEvent, axis: 'horizontal' | 'vertical') => {
        const workspace = workspaceRef.current;
        if (!workspace) return;
        const rect = workspace.getBoundingClientRect();
        
        const startPos = {
            x: e.clientX,
            y: e.clientY,
        };
        
        const preview = document.createElement('div');
        preview.style.position = 'fixed';
        preview.style.backgroundColor = 'rgba(0, 187, 255, 0.7)';
        preview.style.pointerEvents = 'none';
        preview.style.zIndex = '9999';
        
        if(axis === 'horizontal') {
            preview.style.width = `${rect.width}px`;
            preview.style.height = '1px';
            preview.style.left = `${rect.left}px`;
            preview.style.top = `${startPos.y}px`;
        } else {
            preview.style.width = '1px';
            preview.style.height = `${rect.height}px`;
            preview.style.left = `${startPos.x}px`;
            preview.style.top = `${rect.top}px`;
        }
        
        document.body.appendChild(preview);

        const onMouseMove = (moveE: MouseEvent) => {
            if (axis === 'horizontal') {
                preview.style.top = `${moveE.clientY}px`;
            } else {
                preview.style.left = `${moveE.clientX}px`;
            }
        };

        const onMouseUp = (upE: MouseEvent) => {
            document.body.removeChild(preview);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            let position = 0;
            if (axis === 'horizontal') {
                position = (upE.clientY - rect.top - viewState.pan.y) / viewState.zoom;
            } else {
                position = (upE.clientX - rect.left - viewState.pan.x) / viewState.zoom;
            }
            
            if ( (axis === 'horizontal' && upE.clientY > rect.top + RULER_WIDTH) || (axis === 'vertical' && upE.clientX > rect.left + RULER_WIDTH) ) {
                onAddGuide(axis, Math.round(position));
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp, { once: true });
    };

    return (
        <>
            <canvas 
                ref={horizontalRulerRef} 
                style={{ position: 'absolute', top: -RULER_WIDTH, left: -RULER_WIDTH, paddingTop: RULER_WIDTH, paddingLeft: RULER_WIDTH, cursor: 'ns-resize', zIndex: 50 }}
                onMouseDown={(e) => handleMouseDown(e, 'horizontal')}
            />
            <canvas 
                ref={verticalRulerRef} 
                style={{ position: 'absolute', top: -RULER_WIDTH, left: -RULER_WIDTH, paddingTop: RULER_WIDTH, paddingLeft: RULER_WIDTH, cursor: 'ew-resize', zIndex: 50 }}
                 onMouseDown={(e) => handleMouseDown(e, 'vertical')}
            />
            <div 
                className="absolute bg-white border-r border-b border-slate-200" 
                style={{ top: -RULER_WIDTH, left: -RULER_WIDTH, width: RULER_WIDTH, height: RULER_WIDTH, zIndex: 51 }} 
            />
        </>
    );
};