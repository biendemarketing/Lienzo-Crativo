import React, { useState, useEffect, useRef } from 'react';
import { type DesignElement, ElementType, TextElement, RectangleElement, ImageElement, EllipseElement, LineElement, SvgElement, QrCodeElement, BorderRadius, BorderRadiusObject, Shadow, BackdropFilter, Fill, GradientStop, StarElement } from '../types';
import { ChevronDownIcon, LinkIcon, UnlinkIcon, PlusIcon, TrashIcon, TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon, TextAlignJustifyIcon, WandSparklesIcon, LockIcon } from './icons';
import { GRADIENT_PRESETS, TEXT_STYLE_PRESETS } from '../presets';

interface InspectorPanelProps {
  selectedElements: DesignElement[];
  onUpdateElements: (ids: string[], updates: Partial<DesignElement>) => void;
  onEditMask: () => void;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-200">
            <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOpen && <div className="px-4 pb-4 pt-0">{children}</div>}
        </div>
    );
};

const Property: React.FC<{ label: string, children: React.ReactNode, className?: string }> = ({ label, children, className = '' }) => (
    <div className={className}>
        <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
        <div>{children}</div>
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-200" />
);
const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
);
const StyledTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
);

const hexToRgba = (hex: string): { r: number, g: number, b: number } => {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
};

const parseRgba = (rgba: string | undefined): { r: number, g: number, b: number, a: number } => {
    if (!rgba) return { r: 0, g: 0, b: 0, a: 1 };
    if (rgba.startsWith('#')) {
        const {r,g,b} = hexToRgba(rgba);
        return {r,g,b, a: 1};
    }
    const result = rgba.match(/(\d+(\.\d+)?)/g);
    if (result && result.length >= 3) {
        return { r: Number(result[0]), g: Number(result[1]), b: Number(result[2]), a: result.length === 4 ? Number(result[3]) : 1 };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
};

const rgbaToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const ColorStop: React.FC<{ stop: GradientStop, onUpdate: (stop: GradientStop) => void, onSelect: () => void, isSelected: boolean }> = ({ stop, onUpdate, onSelect, isSelected }) => {
    const handleDrag = (e: React.DragEvent) => {
        if (e.clientX === 0) return; // Prevent weird jump on drag end
        const rect = e.currentTarget.parentElement!.getBoundingClientRect();
        const newPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onUpdate({ ...stop, position: newPos });
    };
    return <div draggable onDrag={handleDrag} onClick={onSelect} style={{ left: `${stop.position * 100}%`}} className="absolute -top-1 h-5 w-5 -translate-x-1/2 cursor-pointer rounded-full border-2 bg-white" >
        <div className="h-full w-full rounded-full border-2" style={{ borderColor: isSelected ? '#6366f1' : 'white', background: stop.color }} />
    </div>;
};

const FillControl: React.FC<{ fill: Fill, onChange: (fill: Fill) => void }> = ({ fill, onChange }) => {
    const [activeTab, setActiveTab] = useState(fill.type);
    const [selectedStopIndex, setSelectedStopIndex] = useState(0);
    const gradientBarRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setActiveTab(fill.type);
        if (fill.type === 'linear') {
            setSelectedStopIndex(0);
        }
    }, [fill.type]);

    const handleTabChange = (type: 'solid' | 'linear') => {
        if (type === 'solid') {
            onChange({ type: 'solid', color: '#cccccc' });
        } else {
            onChange({ type: 'linear', angle: 90, stops: [{ color: '#ff0000', position: 0 }, { color: '#0000ff', position: 1 }] });
        }
    };
    
    const handleSolidColorChange = (color: string) => onChange({ type: 'solid', color });

    const handleGradientPropChange = (prop: string, value: any) => {
        if (fill.type === 'linear') {
            onChange({ ...fill, [prop]: value });
        }
    };

    const handleStopUpdate = (index: number, updatedStop: GradientStop) => {
        if (fill.type === 'linear') {
            const newStops = [...fill.stops];
            newStops[index] = updatedStop;
            newStops.sort((a, b) => a.position - b.position);
            const newIndex = newStops.findIndex(s => s === updatedStop);
            setSelectedStopIndex(newIndex);
            onChange({ ...fill, stops: newStops });
        }
    };
    
    const addStop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (fill.type !== 'linear') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        
        // Find insert index
        const insertIndex = fill.stops.findIndex(s => s.position > position);
        const prevColor = fill.stops[insertIndex -1]?.color || '#000000';
        const nextColor = fill.stops[insertIndex]?.color || '#ffffff';
        // Basic color interpolation (can be improved)
        const newColor = '#cccccc';

        const newStop: GradientStop = { color: newColor, position };
        const newStops = [...fill.stops, newStop].sort((a,b) => a.position - b.position);
        setSelectedStopIndex(newStops.findIndex(s => s === newStop));
        onChange({ ...fill, stops: newStops });
    };

    const removeSelectedStop = () => {
        if (fill.type === 'linear' && fill.stops.length > 2) {
            const newStops = fill.stops.filter((_, i) => i !== selectedStopIndex);
            setSelectedStopIndex(Math.max(0, selectedStopIndex - 1));
            onChange({ ...fill, stops: newStops });
        }
    }

    const gradientStops = fill.type === 'linear' ? fill.stops : [];
    const gradientAngle = fill.type === 'linear' ? fill.angle : 90;
    const gradientPreview = fill.type === 'linear' ? `linear-gradient(90deg, ${gradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})` : '';

    return (
        <div className="space-y-3">
            <div className="flex rounded-md border bg-slate-100 p-1">
                <button onClick={() => handleTabChange('solid')} className={`flex-1 rounded px-2 py-1 text-sm ${activeTab === 'solid' ? 'bg-white shadow-sm font-semibold text-indigo-600' : 'text-slate-600'}`}>Sólido</button>
                <button onClick={() => handleTabChange('linear')} className={`flex-1 rounded px-2 py-1 text-sm ${activeTab === 'linear' ? 'bg-white shadow-sm font-semibold text-indigo-600' : 'text-slate-600'}`}>Degradado</button>
            </div>
            {activeTab === 'solid' && (
                <div className="flex items-center gap-2">
                    <input type="color" value={fill.type === 'solid' ? fill.color : '#000000'} onChange={e => handleSolidColorChange(e.target.value)} className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border-slate-300 p-0"/>
                    <StyledInput type="text" value={fill.type === 'solid' ? fill.color : ''} onChange={e => handleSolidColorChange(e.target.value)} />
                </div>
            )}
            {activeTab === 'linear' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-1">
                        {GRADIENT_PRESETS.map((preset, i) => (
                           <button key={i} onClick={() => onChange({type: 'linear', ...preset})} className="h-6 w-full rounded" style={{ background: `linear-gradient(${preset.angle}deg, ${preset.stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`}} />
                        ))}
                    </div>
                    <Property label="Ángulo">
                        <StyledInput type="number" value={gradientAngle} onChange={e => handleGradientPropChange('angle', parseFloat(e.target.value) || 0)} />
                    </Property>
                    <Property label="Paradas de Color">
                        <div ref={gradientBarRef} onDoubleClick={addStop} className="relative h-6 w-full cursor-pointer rounded-md" style={{ background: gradientPreview }}>
                             {gradientStops.map((stop, i) => <ColorStop key={i} stop={stop} onUpdate={(s) => handleStopUpdate(i, s)} onSelect={() => setSelectedStopIndex(i)} isSelected={i === selectedStopIndex} />)}
                        </div>
                    </Property>
                    <div className="flex items-center gap-2">
                        <input type="color" value={gradientStops[selectedStopIndex]?.color || '#000000'} onChange={e => handleStopUpdate(selectedStopIndex, {...gradientStops[selectedStopIndex], color: e.target.value})} className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border-slate-300 p-0"/>
                        <StyledInput type="text" value={gradientStops[selectedStopIndex]?.color || ''} onChange={e => handleStopUpdate(selectedStopIndex, {...gradientStops[selectedStopIndex], color: e.target.value})} />
                        {gradientStops.length > 2 && <button onClick={removeSelectedStop} className="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>}
                    </div>
                </div>
            )}
        </div>
    );
};

const BorderRadiusControl: React.FC<{ value: BorderRadius | undefined, onChange: (value: BorderRadius) => void }> = ({ value, onChange }) => {
    const isLinked = typeof value !== 'object' || value === null;
    const [isLinkedState, setIsLinkedState] = useState(isLinked);

    const getRadiusValue = (corner: keyof BorderRadiusObject) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'object' && value !== null) return value[corner];
        return 0;
    };
    
    useEffect(() => {
        setIsLinkedState(typeof value !== 'object' || value === null);
    }, [value]);
    
    const handleLinkToggle = () => {
        const newLinkedState = !isLinkedState;
        setIsLinkedState(newLinkedState);
        if (newLinkedState) {
            const uniformValue = getRadiusValue('tl');
            onChange(uniformValue);
        } else {
            const uniformValue = typeof value === 'number' ? value : 0;
            onChange({ tl: uniformValue, tr: uniformValue, br: uniformValue, bl: uniformValue });
        }
    };

    const handleIndividualChange = (corner: keyof BorderRadiusObject, cornerValue: string) => {
        const numValue = parseFloat(cornerValue) || 0;
        if (typeof value === 'object' && value !== null) {
            onChange({ ...value, [corner]: numValue });
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                 <label className="block text-xs text-slate-500">Radio de Borde</label>
                 <button onClick={handleLinkToggle} className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100">
                    {isLinkedState ? <LinkIcon className="h-4 w-4" /> : <UnlinkIcon className="h-4 w-4" />}
                 </button>
            </div>
            {isLinkedState ? (
                <StyledInput type="number" value={typeof value === 'number' ? value : 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} min="0" />
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <StyledInput type="number" placeholder="TL" value={getRadiusValue('tl')} onChange={e => handleIndividualChange('tl', e.target.value)} min="0" />
                    <StyledInput type="number" placeholder="TR" value={getRadiusValue('tr')} onChange={e => handleIndividualChange('tr', e.target.value)} min="0" />
                    <StyledInput type="number" placeholder="BL" value={getRadiusValue('bl')} onChange={e => handleIndividualChange('bl', e.target.value)} min="0" />
                    <StyledInput type="number" placeholder="BR" value={getRadiusValue('br')} onChange={e => handleIndividualChange('br', e.target.value)} min="0" />
                </div>
            )}
        </div>
    );
};


export const InspectorPanel: React.FC<InspectorPanelProps> = ({ selectedElements, onUpdateElements, onEditMask }) => {
  if (selectedElements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center text-slate-500">
        <div className="rounded-full bg-slate-100 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </div>
        <p className="mt-4 font-medium">Sin selección</p>
        <p className="text-sm text-slate-400 mt-1">Selecciona un elemento en el lienzo para editar sus propiedades.</p>
      </div>
    );
  }

  const selectedElement = selectedElements[0];
  const selectedElementIds = selectedElements.map(el => el.id);
  const isLocked = selectedElements.length === 1 && selectedElements[0].isLocked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['x', 'y', 'width', 'height', 'rotation', 'fontSize', 'fontWeight', 'strokeWidth', 'opacity', 'points', 'innerRadius'].includes(name);
    
    let parsedValue: string | number = value;
    if (isNumeric) {
        parsedValue = parseFloat(value) || 0;
    }
    const updates: Partial<DesignElement> = { [name]: parsedValue };
    if (selectedElement.type === ElementType.Line && name === 'strokeWidth') { updates.height = parsedValue as number; }
    onUpdateElements(selectedElementIds, updates);
  };

  const handleEffectChange = (effectName: 'shadow' | 'backdropFilter', updates: Partial<Shadow> | Partial<BackdropFilter>) => {
    const currentEffect = selectedElement[effectName];
  
    let newEffect;
    if (updates.enabled && (!currentEffect || !currentEffect.enabled)) {
      if (effectName === 'shadow') {
        newEffect = { enabled: true, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4, ...updates };
      } else {
        newEffect = { enabled: true, blur: 10, brightness: 1, contrast: 1, ...updates };
      }
    } else {
      newEffect = { ...currentEffect, ...updates };
    }
    onUpdateElements(selectedElementIds, { [effectName]: newEffect });
  };
  
  const handleBorderRadiusChange = (value: BorderRadius) => {
      onUpdateElements(selectedElementIds, { borderRadius: value });
  };

  const handleMaskChange = (updates: Partial<{ enabled: boolean; dataUrl: string; }>) => {
    const currentMask = selectedElement.mask;
    const newMask = { ...currentMask, ...updates };
    onUpdateElements(selectedElementIds, { mask: newMask as any });
  }

  const handleAddMask = () => {
    onUpdateElements(selectedElementIds, { mask: { enabled: true, dataUrl: '' } });
  }

  const handleRemoveMask = () => {
    const { mask, ...rest } = selectedElement;
    onUpdateElements(selectedElementIds, { mask: undefined });
  }
  
  const renderElementProperties = () => {
    if (selectedElements.length > 1) {
        return <div className="p-4 text-center text-slate-500">Múltiples elementos seleccionados. Use el menú contextual (clic derecho) para alinear.</div>;
    }

    const el = selectedElement;
    
    const shapeEl = (el.type === ElementType.Rectangle || el.type === ElementType.Ellipse) ? el as RectangleElement | EllipseElement : null;
    const rectEl = el.type === ElementType.Rectangle ? el as RectangleElement : null;
    const textEl = el.type === ElementType.Text ? el as TextElement : null;
    const imgEl = el.type === ElementType.Image ? el as ImageElement : null;
    const lineEl = el.type === ElementType.Line ? el as LineElement : null;
    const qrEl = el.type === ElementType.QrCode ? el as QrCodeElement : null;
    const starEl = el.type === ElementType.Star ? el as StarElement : null;
    const hasFill = 'fill' in el;


    return (
        <>
            <CollapsibleSection title="Transformación">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <Property label="X"><StyledInput type="number" name="x" value={Math.round(el.x)} onChange={handleChange} /></Property>
                    <Property label="Y"><StyledInput type="number" name="y" value={Math.round(el.y)} onChange={handleChange} /></Property>
                    <Property label="Ancho"><StyledInput type="number" name="width" value={Math.round(el.width)} min="1" onChange={handleChange} /></Property>
                    <Property label="Alto"><StyledInput type="number" name="height" value={Math.round(el.height)} min="1" onChange={handleChange} disabled={el.type === ElementType.Line}/></Property>
                    <Property label="Rotación" className="col-span-2"><StyledInput type="number" name="rotation" value={Math.round(el.rotation)} onChange={handleChange} /></Property>
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Apariencia">
                <div className="space-y-4">
                    <Property label="Transparencia">
                        <StyledInput type="range" name="opacity" min="0" max="1" step="0.01" value={el.opacity ?? 1} onChange={handleChange} />
                    </Property>
                    {hasFill && <Property label="Relleno"><FillControl fill={(el as any).fill} onChange={(fill) => onUpdateElements(selectedElementIds, { fill })} /></Property>}
                    
                    {textEl && <>
                        <div className="space-y-2 pt-2"><label className="block text-xs text-slate-500">Trazo</label><div className="flex items-center gap-2"><input type="color" name="strokeColor" value={textEl.strokeColor ?? '#000000'} onChange={handleChange} className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border-slate-300 p-0"/><StyledInput type="text" name="strokeColor" value={textEl.strokeColor ?? '#000000'} onChange={handleChange} /></div><Property label="Grosor"><StyledInput type="number" name="strokeWidth" value={textEl.strokeWidth ?? 0} min="0" onChange={handleChange} /></Property></div>
                    </>}

                    {shapeEl && <>
                        <div className="space-y-2 pt-2"><label className="block text-xs text-slate-500">Borde</label><div className="flex items-center gap-2"><input type="color" name="strokeColor" value={shapeEl.strokeColor ?? '#000000'} onChange={handleChange} className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border-slate-300 p-0"/><StyledInput type="text" name="strokeColor" value={shapeEl.strokeColor ?? '#000000'} onChange={handleChange} /></div><div className="grid grid-cols-2 gap-x-4"><Property label="Grosor"><StyledInput type="number" name="strokeWidth" value={shapeEl.strokeWidth ?? 0} min="0" onChange={handleChange} /></Property><Property label="Estilo"><StyledSelect name="strokeStyle" value={shapeEl.strokeStyle ?? 'solid'} onChange={handleChange}><option value="solid">Sólido</option><option value="dashed">Discontinuo</option><option value="dotted">Punteado</option></StyledSelect></Property></div></div>
                    </>}
                    {(rectEl || imgEl) && (
                       <BorderRadiusControl value={rectEl?.borderRadius ?? imgEl?.borderRadius} onChange={handleBorderRadiusChange} />
                    )}
                    {lineEl && <><Property label="Grosor"><StyledInput type="number" name="strokeWidth" value={lineEl.strokeWidth} min="1" onChange={handleChange} /></Property><Property label="Color"><div className="flex items-center gap-2"><input type="color" name="strokeColor" value={lineEl.strokeColor} onChange={handleChange} className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border-slate-300 p-0"/><StyledInput type="text" name="strokeColor" value={lineEl.strokeColor} onChange={handleChange} /></div></Property></>}
                </div>
            </CollapsibleSection>
            
            {starEl && <CollapsibleSection title="Forma de Estrella">
                <div className="space-y-4">
                    <Property label="Puntas"><StyledInput type="number" name="points" value={starEl.points} min="3" step="1" onChange={handleChange} /></Property>
                    <Property label="Radio Interior"><StyledInput type="range" name="innerRadius" value={starEl.innerRadius} min="0.1" max="0.9" step="0.01" onChange={handleChange} /></Property>
                </div>
            </CollapsibleSection>}

            <CollapsibleSection title="Efectos">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs text-slate-500">Sombra</label>
                            {el.shadow?.enabled && <button onClick={() => handleEffectChange('shadow', { enabled: false })} className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>}
                        </div>
                        {!el.shadow?.enabled ? (
                            <button onClick={() => handleEffectChange('shadow', { enabled: true })} className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 p-2 text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition"> <PlusIcon className="h-4 w-4" /> Añadir Sombra </button>
                        ) : (
                            <div className="space-y-3 rounded-md bg-slate-50 p-3">
                                <Property label="Color"><StyledInput type="text" value={el.shadow.color} onChange={(e) => handleEffectChange('shadow', { color: e.target.value })} /></Property>
                                <div className="grid grid-cols-3 gap-2">
                                    <Property label="X"><StyledInput type="number" value={el.shadow.offsetX} onChange={(e) => handleEffectChange('shadow', { offsetX: parseFloat(e.target.value) || 0 })} /></Property>
                                    <Property label="Y"><StyledInput type="number" value={el.shadow.offsetY} onChange={(e) => handleEffectChange('shadow', { offsetY: parseFloat(e.target.value) || 0 })} /></Property>
                                    <Property label="Blur"><StyledInput type="number" value={el.shadow.blur} min="0" onChange={(e) => handleEffectChange('shadow', { blur: parseFloat(e.target.value) || 0 })} /></Property>
                                </div>
                            </div>
                        )}
                    </div>

                    {shapeEl && (
                        <div>
                           <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs text-slate-500">Filtro de Fondo</label>
                                {shapeEl.backdropFilter?.enabled && <button onClick={() => handleEffectChange('backdropFilter', { enabled: false })} className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>}
                            </div>
                           {!shapeEl.backdropFilter?.enabled ? (
                                <button onClick={() => handleEffectChange('backdropFilter', { enabled: true })} className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 p-2 text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition"> <PlusIcon className="h-4 w-4" /> Añadir Filtro </button>
                           ) : (
                               <div className="space-y-3 rounded-md bg-slate-50 p-3">
                                   <Property label={`Desenfoque (${shapeEl.backdropFilter.blur}px)`}><StyledInput type="range" min="0" max="40" step="1" value={shapeEl.backdropFilter.blur} onChange={(e) => handleEffectChange('backdropFilter', { blur: parseFloat(e.target.value) })} /></Property>
                                   <Property label={`Brillo (${Math.round(shapeEl.backdropFilter.brightness * 100)}%)`}><StyledInput type="range" min="0" max="2" step="0.05" value={shapeEl.backdropFilter.brightness} onChange={(e) => handleEffectChange('backdropFilter', { brightness: parseFloat(e.target.value) })} /></Property>
                                   <Property label={`Contraste (${Math.round(shapeEl.backdropFilter.contrast * 100)}%)`}><StyledInput type="range" min="0" max="2" step="0.05" value={shapeEl.backdropFilter.contrast} onChange={(e) => handleEffectChange('backdropFilter', { contrast: parseFloat(e.target.value) })} /></Property>
                               </div>
                           )}
                        </div>
                    )}
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Máscara">
              <div className="space-y-3">
                {!el.mask ? (
                  <button onClick={handleAddMask} className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 p-2 text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition">
                    <PlusIcon className="h-4 w-4" /> Añadir Máscara
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="mask-enabled"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={el.mask.enabled}
                          onChange={(e) => handleMaskChange({ enabled: e.target.checked })}
                        />
                        <label htmlFor="mask-enabled" className="text-sm text-slate-700">Activada</label>
                      </div>
                      <button onClick={handleRemoveMask} className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={onEditMask} className="w-full flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white p-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                      <WandSparklesIcon className="h-4 w-4" /> Editar Máscara
                    </button>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {textEl && <>
              <CollapsibleSection title="Estilos Predefinidos">
                <div className="grid grid-cols-2 gap-2">
                    {TEXT_STYLE_PRESETS.map(preset => (
                        <button key={preset.name} onClick={() => onUpdateElements(selectedElementIds, preset.style)} className="p-2 border rounded-md text-left text-sm text-slate-700 hover:bg-slate-100 hover:border-indigo-400 transition">
                            <span style={{ fontSize: '1rem', fontWeight: preset.style.fontWeight, fontFamily: preset.style.fontFamily }}>{preset.name}</span>
                        </button>
                    ))}
                </div>
              </CollapsibleSection>
              <CollapsibleSection title="Tipografía">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <Property label="Fuente" className="col-span-2"><StyledSelect name="fontFamily" value={textEl.fontFamily} onChange={handleChange}><option>Arial</option><option>Helvetica</option><option>Times New Roman</option><option>Georgia</option><option>Verdana</option><option>Courier New</option></StyledSelect></Property>
                    <Property label="Peso"><StyledSelect name="fontWeight" value={textEl.fontWeight} onChange={handleChange}><option value="400">Normal</option><option value="500">Medio</option><option value="600">Semi-Negrita</option><option value="700">Negrita</option></StyledSelect></Property>
                    <Property label="Tamaño"><StyledInput type="number" name="fontSize" value={textEl.fontSize} min="1" onChange={handleChange} /></Property>
                    <div className="col-span-2">
                        <Property label="Justificación">
                            <div className="flex items-center justify-between gap-1 bg-slate-50 p-1 rounded-lg border">
                                <button onClick={() => onUpdateElements(selectedElementIds, { textAlign: 'left' })} className={`p-2 rounded-md ${textEl.textAlign === 'left' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}><TextAlignLeftIcon className="h-5 w-5" /></button>
                                <button onClick={() => onUpdateElements(selectedElementIds, { textAlign: 'center' })} className={`p-2 rounded-md ${textEl.textAlign === 'center' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}><TextAlignCenterIcon className="h-5 w-5" /></button>
                                <button onClick={() => onUpdateElements(selectedElementIds, { textAlign: 'right' })} className={`p-2 rounded-md ${textEl.textAlign === 'right' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}><TextAlignRightIcon className="h-5 w-5" /></button>
                                <button onClick={() => onUpdateElements(selectedElementIds, { textAlign: 'justify' })} className={`p-2 rounded-md ${textEl.textAlign === 'justify' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}><TextAlignJustifyIcon className="h-5 w-5" /></button>
                            </div>
                        </Property>
                    </div>
                    <div className="col-span-2 pt-2"><Property label="Contenido"><StyledTextarea name="content" value={textEl.content} onChange={handleChange} rows={3} /></Property></div>
                </div>
              </CollapsibleSection>
            </>}

            {imgEl && <CollapsibleSection title="Contenido"><Property label="URL de la Imagen"><StyledTextarea name="src" value={imgEl.src} onChange={handleChange} rows={3} /></Property></CollapsibleSection>}
            {('svgContent' in el) && <CollapsibleSection title="Contenido SVG"><Property label="Código SVG"><StyledTextarea name="svgContent" value={(el as SvgElement).svgContent} onChange={handleChange} rows={5} /></Property></CollapsibleSection>}
            {qrEl && <CollapsibleSection title="Contenido QR"><Property label="Dato para QR (URL o texto)"><StyledTextarea name="data" value={qrEl.data} onChange={handleChange} rows={4} /></Property></CollapsibleSection>}
        </>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
        {isLocked && (
            <div className="flex items-center gap-3 border-b border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <LockIcon className="h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold">Elemento bloqueado</p>
                    <p>Desbloquéalo en el panel de capas para editar.</p>
                </div>
            </div>
        )}
        <fieldset disabled={isLocked}>
            {selectedElements.length === 1 && renderElementProperties()}
            {selectedElements.length > 1 && (
                <div className="p-4 text-center text-slate-500">Múltiples elementos seleccionados. Use el menú contextual (clic derecho) para alinear.</div>
            )}
        </fieldset>
    </div>
  );
};