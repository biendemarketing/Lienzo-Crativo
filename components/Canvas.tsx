import React, { useState, useEffect, useRef } from 'react';
import { type DesignElement, ElementType, TextElement, RectangleElement, ImageElement, EllipseElement, LineElement, SvgElement, QrCodeElement, BorderRadius, Fill, TriangleElement, StarElement, GroupElement, CanvasSettings, ViewState } from '../types';
import { SNAP_THRESHOLD } from '../constants';

interface CanvasProps {
  elements: DesignElement[];
  activeElements: DesignElement[]; // All elements at the root for snapping
  canvasSettings: CanvasSettings;
  guides: { horizontal: number[], vertical: number[] };
  onUpdateGuide: (axis: 'horizontal' | 'vertical', index: number, position: number) => void;
  onDeleteGuide: (axis: 'horizontal' | 'vertical', index: number) => void;
  selectedElementIds: string[];
  editingGroupId: string | null;
  onSetEditingGroupId: (id: string | null) => void;
  onSelectElement: (id: string | null, shiftKey: boolean) => void;
  onUpdateElements: (ids: string[], updates: Partial<DesignElement>) => void;
  onContextMenu: (e: React.MouseEvent, elementId: string) => void;
  activeTool: 'select' | 'eraser' | 'magicWand';
  onMagicWandSelect: (elementId: string, localX: number, localY: number) => void;
  onEditMask: (element: DesignElement) => void;
  viewState: ViewState;
  isPanning: boolean;
}

const findElementById = (elements: DesignElement[], id: string): DesignElement | null => {
    for (const el of elements) {
        if (el.id === id) return el;
        if (el.type === ElementType.Group) {
            const found = findElementById((el as GroupElement).children, id);
            if (found) return found;
        }
    }
    return null;
};

const escapeHtml = (unsafe: string): string => {
    if(!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

const getBorderRadiusStyles = (borderRadius: BorderRadius | undefined): React.CSSProperties => {
    if (typeof borderRadius === 'number') { return { borderRadius: `${borderRadius}px` }; }
    if (typeof borderRadius === 'object' && borderRadius !== null) { return { borderTopLeftRadius: `${borderRadius.tl}px`, borderTopRightRadius: `${borderRadius.tr}px`, borderBottomRightRadius: `${borderRadius.br}px`, borderBottomLeftRadius: `${borderRadius.bl}px` }; }
    return {};
};

const getFillStyle = (fill: Fill): React.CSSProperties => {
    if (fill.type === 'solid') { return { background: fill.color }; }
    if (fill.type === 'linear') { const stops = fill.stops.map(stop => `${stop.color} ${stop.position * 100}%`).join(', '); return { background: `linear-gradient(${fill.angle}deg, ${stops})` }; }
    return {};
};

const renderElement = (element: DesignElement, isDimmed: boolean): React.ReactNode => {
  const baseStyle: React.CSSProperties = { position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, pointerEvents: 'none', transform: `rotate(${element.rotation}deg)`, opacity: isDimmed ? 0.2 : element.opacity ?? 1, transition: 'opacity 0.2s ease-in-out' };
  const contentStyle: React.CSSProperties = { width: '100%', height: '100%', overflow: 'hidden' };

  switch (element.type) {
    case ElementType.Group: { const el = element as GroupElement; return <div style={baseStyle}><div style={contentStyle}>{el.children.map(child => renderElement(child, isDimmed))}</div></div>; }
    case ElementType.Text: {
        const el = element as TextElement;
        let fillAttr = '';
        let defs = '';
        if (el.fill.type === 'solid') {
            fillAttr = `fill="${el.fill.color}"`;
        } else if (el.fill.type === 'linear') {
            const gradientId = `grad-${el.id}`;
            const angleRad = (el.fill.angle - 90) * Math.PI / 180;
            const x1 = Math.round(50 + 50 * Math.cos(angleRad));
            const y1 = Math.round(50 + 50 * Math.sin(angleRad));
            const stops = el.fill.stops.map(s => `<stop offset="${s.position * 100}%" stop-color="${s.color}" />`).join('');
            defs = `<defs><linearGradient id="${gradientId}" x1="${100-x1}%" y1="${100-y1}%" x2="${x1}%" y2="${y1}%">${stops}</linearGradient></defs>`;
            fillAttr = `fill="url(#${gradientId})"`;
        }

        const strokeAttr = el.strokeWidth && el.strokeWidth > 0 ? `stroke="${el.strokeColor || '#000'}" stroke-width="${el.strokeWidth}"` : '';
        const textAnchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
        const xPos = el.textAlign === 'center' ? el.width / 2 : el.textAlign === 'right' ? el.width : 0;
        
        const lines = el.content.split('\n');
        const lineHeight = (el.fontSize || 16) * 1.2;
        const totalTextHeight = lines.length * lineHeight;
        const startY = (el.height - totalTextHeight) / 2 + lineHeight * 0.8; // Approximate vertical centering

        const tspans = lines.map((line, index) => `<tspan x="${xPos}" dy="${index === 0 ? startY : lineHeight}">${escapeHtml(line)}</tspan>`).join('');

        const svgString = `<svg width="${el.width}" height="${el.height}" style="overflow: visible; font-family: ${el.fontFamily}; font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; text-anchor: ${textAnchor};">
            ${defs}
            <text ${fillAttr} ${strokeAttr}>${tspans}</text>
        </svg>`;
        return <div style={baseStyle}><div style={{...contentStyle}} dangerouslySetInnerHTML={{ __html: svgString }} /></div>;
    }
    case ElementType.Rectangle: {
        const el = element as RectangleElement;
        const rectStyle: React.CSSProperties = { ...contentStyle, ...getFillStyle(el.fill), borderWidth: `${el.strokeWidth ?? 0}px`, borderColor: el.strokeColor ?? 'transparent', borderStyle: el.strokeStyle ?? 'solid', boxSizing: 'border-box', ...getBorderRadiusStyles(el.borderRadius) };
        if (el.backdropFilter?.enabled) { const filterValue = `blur(${el.backdropFilter.blur}px) brightness(${el.backdropFilter.brightness}) contrast(${el.backdropFilter.contrast})`; rectStyle.backdropFilter = filterValue; (rectStyle as any).WebkitBackdropFilter = filterValue; }
        return <div style={baseStyle}><div style={rectStyle}></div></div>;
    }
    case ElementType.Image: { const el = element as ImageElement; const imgStyle: React.CSSProperties = {...contentStyle, objectFit: 'cover', ...getBorderRadiusStyles(el.borderRadius)}; return <div style={baseStyle}><img src={el.src} alt="user content" style={imgStyle} draggable={false} /></div>; }
    case ElementType.Ellipse: {
        const el = element as EllipseElement;
        const ellipseStyle: React.CSSProperties = { ...contentStyle, ...getFillStyle(el.fill), borderRadius: '50%', borderWidth: `${el.strokeWidth ?? 0}px`, borderColor: el.strokeColor ?? 'transparent', borderStyle: el.strokeStyle ?? 'solid', boxSizing: 'border-box' };
        if (el.backdropFilter?.enabled) { const filterValue = `blur(${el.backdropFilter.blur}px) brightness(${el.backdropFilter.brightness}) contrast(${el.backdropFilter.contrast})`; ellipseStyle.backdropFilter = filterValue; (ellipseStyle as any).WebkitBackdropFilter = filterValue; }
        return <div style={baseStyle}><div style={ellipseStyle}></div></div>;
    }
    case ElementType.Line: { const el = element as LineElement; const lineContentStyle: React.CSSProperties = { ...contentStyle, height: `${el.strokeWidth}px`, backgroundColor: el.strokeColor, top: `calc(50% - ${el.strokeWidth/2}px)`, position: 'absolute' }; return <div style={baseStyle}><div style={lineContentStyle}></div></div>; }
    case ElementType.Svg: { const el = element as SvgElement; const fillStyle = getFillStyle(el.fill); let coloredSvg = el.svgContent; if (el.fill.type === 'solid') { coloredSvg = el.svgContent.replace(/<svg(.*?)>/, `<svg$1 fill="${el.fill.color}">`); } return <div style={baseStyle}><div style={{...contentStyle, ...fillStyle }} dangerouslySetInnerHTML={{ __html: coloredSvg }}></div></div>; }
    case ElementType.QrCode: { const el = element as QrCodeElement; const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${Math.round(el.width)}x${Math.round(el.height)}&data=${encodeURIComponent(el.data)}`; const qrStyle: React.CSSProperties = {...contentStyle, objectFit: 'contain' }; return <div style={baseStyle}><img src={qrApiUrl} alt="QR Code" style={qrStyle} draggable={false} /></div>; }
    case ElementType.Triangle: { const el = element as TriangleElement; const fillStyle = getFillStyle(el.fill); return <div style={baseStyle}><div style={{...contentStyle, ...fillStyle, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div></div> }
    case ElementType.Star: {
        const el = element as StarElement; const { width, height, points, innerRadius, fill } = el; const cx = width / 2; const cy = height / 2; const outerRadius = Math.min(width, height) / 2; const innerRadiusValue = outerRadius * innerRadius;
        const pathPoints = Array.from({ length: points * 2 }, (_, i) => { const radius = i % 2 === 0 ? outerRadius : innerRadiusValue; const angle = (i * Math.PI) / points - Math.PI / 2; const x = cx + radius * Math.cos(angle); const y = cy + radius * Math.sin(angle); return `${x},${y}`; }).join(' ');
        let fillAttr = ''; let defs = '';
        if (fill.type === 'solid') { fillAttr = `fill="${fill.color}"`; }
        else if (fill.type === 'linear') { const gradientId = `grad-${element.id}`; const x1 = Math.round(50 + 50 * Math.cos((fill.angle - 90) * Math.PI / 180)); const y1 = Math.round(50 + 50 * Math.sin((fill.angle - 90) * Math.PI / 180)); const stops = fill.stops.map(s => `<stop offset="${s.position * 100}%" stop-color="${s.color}" />`).join(''); defs = `<defs><linearGradient id="${gradientId}" x1="${100-x1}%" y1="${100-y1}%" x2="${x1}%" y2="${y1}%">${stops}</linearGradient></defs>`; fillAttr = `fill="url(#${gradientId})"`; }
        const svgString = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}<polygon points="${pathPoints}" ${fillAttr} /></svg>`;
        return <div style={baseStyle}><div style={{...contentStyle}} dangerouslySetInnerHTML={{ __html: svgString }} /></div>;
    }
    default: return null;
  }
};

type Handle = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br';
interface DraggingState { elementId: string; offsetX: number; offsetY: number; }
interface ResizingState { elementId: string; handle: Handle; startX: number; startY: number; startWidth: number; startHeight: number; startElementX: number; startElementY: number; }
interface SmartGuide { axis: 'horizontal' | 'vertical'; position: number; start: number; end: number; }
interface DraggingGuideState { axis: 'horizontal' | 'vertical'; index: number; isDeleting: boolean; }

export const Canvas: React.FC<CanvasProps> = ({ elements, activeElements, canvasSettings, guides: userGuides, onUpdateGuide, onDeleteGuide, selectedElementIds, editingGroupId, onSetEditingGroupId, onSelectElement, onUpdateElements, onContextMenu, activeTool, onMagicWandSelect, onEditMask, viewState, isPanning }) => {
  const [draggingState, setDraggingState] = useState<DraggingState | null>(null);
  const [resizingState, setResizingState] = useState<ResizingState | null>(null);
  const [draggingGuide, setDraggingGuide] = useState<DraggingGuideState | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [smartGuides, setSmartGuides] = useState<SmartGuide[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);

  const elementsToRender = elements;
  const renderOffset = editingGroupId ? { x: (activeElements.find(el => el.id === editingGroupId) as GroupElement)?.x, y: (activeElements.find(el => el.id === editingGroupId) as GroupElement)?.y } : { x: 0, y: 0 };

  const handleElementMouseDown = (e: React.MouseEvent<HTMLDivElement>, elementId: string) => {
    if (isPanning) return;
    e.stopPropagation();

    const element = findElementById(elementsToRender, elementId);
    if (!element || element.isLocked) return;
    
    if (activeTool === 'eraser') {
      onEditMask(element);
      return;
    }

    if (activeTool !== 'select') return;

    if (editingElementId === elementId) return;

    onSelectElement(elementId, e.shiftKey);
    if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const absoluteX = element.x + renderOffset.x;
        const absoluteY = element.y + renderOffset.y;
        const mouseX = (e.clientX - canvasRect.left) / viewState.zoom;
        const mouseY = (e.clientY - canvasRect.top) / viewState.zoom;
        setDraggingState({ elementId, offsetX: mouseX - absoluteX, offsetY: mouseY - absoluteY });
    }
  };

  const handleElementClick = (e: React.MouseEvent<HTMLDivElement>, el: DesignElement) => {
    e.stopPropagation();
    if (el.isLocked || isPanning) return;
    if (activeTool === 'magicWand' && el.type === ElementType.Image) {
      const rect = e.currentTarget.getBoundingClientRect();
      const localX = (e.clientX - rect.left) / viewState.zoom;
      const localY = (e.clientY - rect.top) / viewState.zoom;
      onMagicWandSelect(el.id, localX, localY);
    }
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent<HTMLDivElement>, elementId: string, handle: Handle) => {
      e.stopPropagation();
      if (isPanning) return;
      const element = findElementById(elementsToRender, elementId);
      if (element && !element.isLocked) {
          setResizingState({ elementId, handle, startX: e.clientX, startY: e.clientY, startWidth: element.width, startHeight: element.height, startElementX: element.x, startElementY: element.y });
      }
  }

  const handleElementDoubleClick = (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      if (isPanning) return;
      const element = findElementById(activeElements, elementId);
      if (element && !element.isLocked) {
        if (element.type === ElementType.Text) { setEditingElementId(elementId); onSelectElement(elementId, false); }
        else if (element.type === ElementType.Group) { onSetEditingGroupId(element.id); }
      }
  }
  
  const finishTextEditing = () => { if (editingElementId && editingTextareaRef.current) { onUpdateElements([editingElementId], { content: editingTextareaRef.current.value }); } setEditingElementId(null); }

  const handleGuideMouseDown = (e: React.MouseEvent, axis: 'horizontal' | 'vertical', index: number) => {
      e.stopPropagation();
      if (isPanning) return;
      setDraggingGuide({ axis, index, isDeleting: false });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();

      if (draggingGuide) {
          let newPosition = 0;
          let isDeleting = false;
          const rulerThickness = 24;
          if (draggingGuide.axis === 'horizontal') {
              newPosition = (e.clientY - canvasRect.top - viewState.pan.y) / viewState.zoom;
              if (e.clientY < canvasRect.top + rulerThickness) isDeleting = true;
          } else {
              newPosition = (e.clientX - canvasRect.left - viewState.pan.x) / viewState.zoom;
              if (e.clientX < canvasRect.left + rulerThickness) isDeleting = true;
          }
          setDraggingGuide(prev => prev ? {...prev, isDeleting} : null);
          onUpdateGuide(draggingGuide.axis, draggingGuide.index, newPosition);
          return;
      }

      if (resizingState) {
          const { elementId, handle, startX, startY, startWidth, startHeight, startElementX, startElementY } = resizingState;
          const element = findElementById(elementsToRender, elementId);
          if (!element || element.isLocked) return;
          const dx = (e.clientX - startX) / viewState.zoom; const dy = (e.clientY - startY) / viewState.zoom;
          let newX = startElementX; let newY = startElementY; let newWidth = startWidth; let newHeight = startHeight;
          const minSize = 10;
          if (handle.includes('l')) { newWidth = Math.max(minSize, startWidth - dx); newX = startElementX + dx; }
          if (handle.includes('r')) { newWidth = Math.max(minSize, startWidth + dx); }
          if (handle.includes('t')) { newHeight = Math.max(minSize, startHeight - dy); newY = startElementY + dy; }
          if (handle.includes('b')) { newHeight = Math.max(minSize, startHeight + dy); }
          if (newWidth === minSize && handle.includes('l')) newX = startElementX + startWidth - minSize;
          if (newHeight === minSize && handle.includes('t')) newY = startElementY + startHeight - minSize;
          const updates: Partial<DesignElement> = { x: newX, y: newY, width: newWidth, height: newHeight };
          if (element?.type === ElementType.Line) { (updates as Partial<LineElement>).strokeWidth = newHeight; }
          onUpdateElements([elementId], updates);
          return;
      }
      if (draggingState) {
          const draggedElement = findElementById(elementsToRender, draggingState.elementId);
          if (!draggedElement || draggedElement.isLocked) return;
          
          let currentX = (e.clientX - canvasRect.left) / viewState.zoom - draggingState.offsetX - renderOffset.x;
          let currentY = (e.clientY - canvasRect.top) / viewState.zoom - draggingState.offsetY - renderOffset.y;
          
          let finalX = currentX;
          let finalY = currentY;

          const otherElements = (editingGroupId ? (activeElements.find(el => el.id === editingGroupId) as GroupElement)?.children || [] : activeElements).filter(el => el.id !== draggingState.elementId && (el.isVisible ?? true));
          const newSmartGuides: SmartGuide[] = [];
          const snapThreshold = SNAP_THRESHOLD / viewState.zoom;
          
          const draggedBounds = { left: currentX, right: currentX + draggedElement.width, top: currentY, bottom: currentY + draggedElement.height, hCenter: currentX + draggedElement.width / 2, vCenter: currentY + draggedElement.height / 2 };
          
          let minDx = Infinity;
          let minDy = Infinity;

          const checkSnap = (dragValue: number, staticValue: number, axis: 'h' | 'v') => {
              const d = dragValue - staticValue;
              if (Math.abs(d) < snapThreshold) {
                  if (axis === 'h' && Math.abs(d) < Math.abs(minDx)) minDx = d;
                  if (axis === 'v' && Math.abs(d) < Math.abs(minDy)) minDy = d;
                  return true;
              }
              return false;
          };
          
          const staticTargets = [...otherElements, ...userGuides.vertical.map(pos => ({x:pos, isGuide: true})), ...userGuides.horizontal.map(pos => ({y:pos, isGuide: true}))];
          
          for(const target of staticTargets) {
              if ('type' in target) {
                const staticBounds = { left: target.x, right: target.x + target.width, top: target.y, bottom: target.y + target.height, hCenter: target.x + target.width / 2, vCenter: target.y + target.height / 2 };
                if (checkSnap(draggedBounds.left, staticBounds.left, 'h')) newSmartGuides.push({ axis: 'vertical', position: staticBounds.left, start: Math.min(draggedBounds.top, staticBounds.top), end: Math.max(draggedBounds.bottom, staticBounds.bottom) });
                if (checkSnap(draggedBounds.right, staticBounds.right, 'h')) newSmartGuides.push({ axis: 'vertical', position: staticBounds.right, start: Math.min(draggedBounds.top, staticBounds.top), end: Math.max(draggedBounds.bottom, staticBounds.bottom) });
                if (checkSnap(draggedBounds.hCenter, staticBounds.hCenter, 'h')) newSmartGuides.push({ axis: 'vertical', position: staticBounds.hCenter, start: Math.min(draggedBounds.top, staticBounds.top), end: Math.max(draggedBounds.bottom, staticBounds.bottom) });
                if (checkSnap(draggedBounds.top, staticBounds.top, 'v')) newSmartGuides.push({ axis: 'horizontal', position: staticBounds.top, start: Math.min(draggedBounds.left, staticBounds.left), end: Math.max(draggedBounds.right, staticBounds.right) });
                if (checkSnap(draggedBounds.bottom, staticBounds.bottom, 'v')) newSmartGuides.push({ axis: 'horizontal', position: staticBounds.bottom, start: Math.min(draggedBounds.left, staticBounds.left), end: Math.max(draggedBounds.right, staticBounds.right) });
                if (checkSnap(draggedBounds.vCenter, staticBounds.vCenter, 'v')) newSmartGuides.push({ axis: 'horizontal', position: staticBounds.vCenter, start: Math.min(draggedBounds.left, staticBounds.left), end: Math.max(draggedBounds.right, staticBounds.right) });
              } else if ('x' in target) { // vertical user guide
                  checkSnap(draggedBounds.left, target.x, 'h'); checkSnap(draggedBounds.right, target.x, 'h'); checkSnap(draggedBounds.hCenter, target.x, 'h');
              } else if ('y' in target) { // horizontal user guide
                  checkSnap(draggedBounds.top, (target as {y:number}).y, 'v'); checkSnap(draggedBounds.bottom, (target as {y:number}).y, 'v'); checkSnap(draggedBounds.vCenter, (target as {y:number}).y, 'v');
              }
          }
         
          if (Math.abs(minDx) < snapThreshold) { finalX -= minDx; }
          if (Math.abs(minDy) < snapThreshold) { finalY -= minDy; }
          
          setSmartGuides(newSmartGuides);
          onUpdateElements([draggingState.elementId], { x: finalX, y: finalY });
      }
    };
    const handleMouseUp = () => {
        if (draggingGuide && draggingGuide.isDeleting) {
            onDeleteGuide(draggingGuide.axis, draggingGuide.index);
        }
        setDraggingState(null);
        setResizingState(null);
        setSmartGuides([]);
        setDraggingGuide(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [draggingState, resizingState, draggingGuide, elements, onUpdateElements, editingGroupId, viewState, userGuides, onDeleteGuide]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) { onSelectElement(null, false); finishTextEditing(); } };

  const handles: { position: Handle; cursor: string; style: React.CSSProperties }[] = [ { position: 'tl', cursor: 'nwse-resize', style: { top: -4, left: -4 } }, { position: 'tm', cursor: 'ns-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)' } }, { position: 'tr', cursor: 'nesw-resize', style: { top: -4, right: -4 } }, { position: 'ml', cursor: 'ew-resize', style: { top: '50%', left: -4, transform: 'translateY(-50%)' } }, { position: 'mr', cursor: 'ew-resize', style: { top: '50%', right: -4, transform: 'translateY(-50%)' } }, { position: 'bl', cursor: 'nesw-resize', style: { bottom: -4, left: -4 } }, { position: 'bm', cursor: 'ns-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } }, { position: 'br', cursor: 'nwse-resize', style: { bottom: -4, right: -4 } }, ];

  const renderSelectionBox = (el: DesignElement, offset: {x:number, y:number}) => {
    const isSelected = selectedElementIds.includes(el.id);
    const isEditing = editingElementId === el.id;
    const isLocked = el.isLocked ?? false;
    const isText = el.type === ElementType.Text;
    const textEl = isText ? el as TextElement : null;

    const getCursor = () => {
        if (isLocked) return 'not-allowed';
        if (activeTool === 'magicWand' && el.type === ElementType.Image) return 'crosshair';
        if (activeTool === 'eraser') return 'crosshair';
        if (draggingState && draggingState.elementId === el.id) return 'grabbing';
        if (el.type === ElementType.Group && !editingGroupId) return 'cell';
        return 'grab';
    };

    const elementStyles: React.CSSProperties = { position: 'absolute', left: `${el.x + offset.x}px`, top: `${el.y + offset.y}px`, width: `${el.width}px`, height: `${el.height}px`, transform: `rotate(${el.rotation}deg)`, cursor: getCursor(), outline: isSelected && !isEditing && !isLocked ? '2px solid #6366f1' : 'none', outlineOffset: '2px', filter: el.shadow?.enabled ? `drop-shadow(${el.shadow.offsetX}px ${el.shadow.offsetY}px ${el.shadow.blur}px ${el.shadow.color})` : 'none', zIndex: 20 };
    
    if (el.mask?.enabled && el.mask.dataUrl) { elementStyles.WebkitMaskImage = `url(${el.mask.dataUrl})`; elementStyles.maskImage = `url(${el.mask.dataUrl})`; elementStyles.WebkitMaskSize = '100% 100%'; elementStyles.maskSize = '100% 100%'; }

    return (
        <div key={el.id} style={elementStyles} onMouseDown={(e) => handleElementMouseDown(e, el.id)} onClick={(e) => handleElementClick(e, el)} onDoubleClick={(e) => handleElementDoubleClick(e, el.id)} onContextMenu={(e) => onContextMenu(e, el.id)}>
            <div className="w-full h-full" style={{transform: `rotate(0deg)`}}>
                {isEditing && isText && <textarea ref={editingTextareaRef} defaultValue={textEl?.content} onBlur={finishTextEditing} onKeyDown={(e) => { if(e.key === 'Escape') { e.currentTarget.blur(); } }} autoFocus onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ width: '100%', height: '100%', background: 'transparent', border: '1px dashed #94a3b8', resize: 'none', outline: 'none', color: textEl?.fill.type === 'solid' ? textEl.fill.color : '#000', fontSize: `${textEl?.fontSize}px`, fontWeight: textEl?.fontWeight, fontFamily: textEl?.fontFamily, lineHeight: 1.2, padding: '2px', textAlign: textEl?.textAlign ?? 'left' }}/>}
            </div>
            {isSelected && !isEditing && !isLocked && selectedElementIds.length === 1 && handles.map(handle => ( <div key={handle.position} className="absolute w-2 h-2 bg-white border border-indigo-600 rounded-full" style={{ ...handle.style, cursor: handle.cursor, zIndex: 100 }} onMouseDown={(e) => handleResizeHandleMouseDown(e, el.id, handle.position)} /> ))}
        </div>
    );
  };
  
  const numArtboards = canvasSettings.artboards || 1;
  const layout = canvasSettings.artboardLayout || 'grid';
  const gap = canvasSettings.artboardSpacing || 50;

  let artboardsPerRow = 1;
  if (layout === 'grid') {
      artboardsPerRow = Math.max(1, Math.floor(Math.sqrt(numArtboards)));
      if(numArtboards === 2) artboardsPerRow = 2; // Special case for 2
  } else if (layout === 'row') {
      artboardsPerRow = numArtboards;
  }

  const numRows = Math.ceil(numArtboards / artboardsPerRow);
  const totalWidth = artboardsPerRow * canvasSettings.width + (artboardsPerRow - 1) * gap;
  const totalHeight = numRows * canvasSettings.height + (numRows - 1) * gap;

  const isGuideDeleting = draggingGuide?.isDeleting ?? false;
  const guideCursorClass = draggingGuide ? (draggingGuide.axis === 'horizontal' ? (isGuideDeleting ? 'cursor-no-drop' : 'cursor-row-resize') : (isGuideDeleting ? 'cursor-no-drop' : 'cursor-col-resize')) : '';

  return (
    <div ref={canvasRef} id="printable-canvas" className={`relative ${guideCursorClass}`} style={{ width: totalWidth, height: 'min-content' }} onClick={handleCanvasClick}>
        <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
             {Array.from({ length: numArtboards }).map((_, i) => { const row = Math.floor(i / artboardsPerRow); const col = i % artboardsPerRow; const x = col * (canvasSettings.width + gap); const y = row * (canvasSettings.height + gap); return <div key={i} className="absolute bg-white shadow-lg" style={{ left: x, top: y, width: canvasSettings.width, height: canvasSettings.height, background: canvasSettings.background === 'transparent' ? 'conic-gradient(#d1d5db 25%, #f9fafb 0 50%, #d1d5db 0 75%, #f9fafb 0)' : canvasSettings.background, backgroundSize: canvasSettings.background === 'transparent' ? '16px 16px' : undefined }} />; })}
             {viewState.isRulersVisible && userGuides.horizontal.map((y, i) => <div key={`h-guide-${i}`} onMouseDown={(e) => handleGuideMouseDown(e, 'horizontal', i)} className="absolute w-full h-px bg-cyan-400 opacity-70 z-40 hover:h-1 cursor-row-resize" style={{ top: y, background: draggingGuide?.axis === 'horizontal' && draggingGuide?.index === i && isGuideDeleting ? '#ef4444' : '#22d3ee' }} />)}
             {viewState.isRulersVisible && userGuides.vertical.map((x, i) => <div key={`v-guide-${i}`} onMouseDown={(e) => handleGuideMouseDown(e, 'vertical', i)} className="absolute h-full w-px bg-cyan-400 opacity-70 z-40 hover:w-1 cursor-col-resize" style={{ left: x, background: draggingGuide?.axis === 'vertical' && draggingGuide?.index === i && isGuideDeleting ? '#ef4444' : '#22d3ee' }} />)}
            {activeElements.filter(el => el.isVisible ?? true).map(el => (<React.Fragment key={el.id}>{renderElement(el, editingGroupId ? el.id !== editingGroupId : false)}</React.Fragment>))}
            {elementsToRender.filter(el => el.isVisible ?? true).map(el => (<React.Fragment key={`sel-${el.id}`}>{renderSelectionBox(el, editingGroupId ? renderOffset : {x:0, y:0})}</React.Fragment>))}
            {smartGuides.map((guide, index) => ( <div key={index} className="absolute bg-fuchsia-500 z-30" style={{ ...(guide.axis === 'horizontal' ? { top: guide.position + renderOffset.y, left: guide.start + renderOffset.x, width: guide.end - guide.start, height: 1 } : { left: guide.position + renderOffset.x, top: guide.start + renderOffset.y, height: guide.end - guide.start, width: 1 }), }} /> ))}
        </div>
    </div>
  );
};