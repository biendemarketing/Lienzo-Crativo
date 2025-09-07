
import React, { useState, useEffect, useRef } from 'react';
import { CanvasSettings, RecentFile, DesignElement } from '../types';
import { inToPx, mmToPx, pxToIn, pxToMm } from '../utils/conversionUtils';
import { INITIAL_CANVAS_SETTINGS, PREDEFINED_SIZES } from '../constants';
import { TEMPLATES, Template } from '../templates';
import { OrientationLandscapeIcon, OrientationPortraitIcon } from './icons';
import { Canvas } from './Canvas';


const TemplatePreview: React.FC<{ template: Template }> = ({ template }) => {
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const { width, height, unit, dpi } = template.settings;
    const widthPx = unit === 'px' ? width : unit === 'in' ? inToPx(width, dpi) : mmToPx(width, dpi);
    const heightPx = unit === 'px' ? height : unit === 'in' ? inToPx(height, dpi) : mmToPx(height, dpi);
    
    useEffect(() => {
        if (previewContainerRef.current) {
            const { clientWidth, clientHeight } = previewContainerRef.current;
            const newScale = Math.min(clientWidth / widthPx, clientHeight / heightPx);
            setScale(newScale);
        }
    }, [widthPx, heightPx]);

    return (
        <div ref={previewContainerRef} className="relative bg-transparent overflow-hidden rounded-md flex items-center justify-center pointer-events-none w-full h-full">
            <div className="absolute transform-gpu" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
                 <Canvas
                    elements={template.elements}
                    activeElements={template.elements}
                    canvasSettings={{ ...template.settings, name: 'preview', width: widthPx, height: heightPx, artboards: 1, unit: 'px', colorMode: 'rgb' }}
                    guides={{horizontal: [], vertical: []}}
                    onUpdateGuide={() => {}}
                    onDeleteGuide={() => {}}
                    selectedElementIds={[]}
                    editingGroupId={null} onSetEditingGroupId={() => {}} onSelectElement={() => {}}
                    onUpdateElements={() => {}} onContextMenu={() => {}} activeTool="select" onMagicWandSelect={() => {}} onEditMask={() => {}}
                    viewState={{ zoom: 1, pan: { x: 0, y: 0 } }} isPanning={false}
                />
            </div>
        </div>
    );
};


interface NewFileModalProps {
  onClose: () => void;
  onCreate: (settings: CanvasSettings, elements?: DesignElement[]) => void;
  recentFiles: RecentFile[];
  onLoadFromRecent: (file: RecentFile) => void;
}

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
);
const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
);
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`px-4 py-3 text-sm font-medium ${active ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {children}
    </button>
);


export const NewFileModal: React.FC<NewFileModalProps> = ({ onClose, onCreate, recentFiles, onLoadFromRecent }) => {
  const [settings, setSettings] = useState<CanvasSettings>(INITIAL_CANVAS_SETTINGS);
  const [displayValues, setDisplayValues] = useState({ width: '800', height: '600' });
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    const convertFromPx = (px: number, unit: CanvasSettings['unit'], dpi: number) => {
        if (unit === 'in') return pxToIn(px, dpi);
        if (unit === 'mm') return pxToMm(px, dpi);
        return px;
    };
    const w = convertFromPx(settings.width, settings.unit, settings.dpi);
    const h = convertFromPx(settings.height, settings.unit, settings.dpi);
    setDisplayValues({ width: parseFloat(w.toFixed(2)).toString(), height: parseFloat(h.toFixed(2)).toString() });
  }, [settings.unit, settings.dpi, settings.width, settings.height]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDisplayValues(prev => ({ ...prev, [name]: value }));

    const numValue = parseFloat(value) || 0;
    const convertToPx = (val: number, unit: CanvasSettings['unit'], dpi: number) => {
      if (unit === 'in') return inToPx(val, dpi);
      if (unit === 'mm') return mmToPx(val, dpi);
      return val;
    };
    setSettings(prev => ({ ...prev, [name]: convertToPx(numValue, prev.unit, prev.dpi) }));
  };
  
  const handleSettingsChange = (field: keyof CanvasSettings, value: any) => {
      setSettings(prev => ({ ...prev, [field]: value }));
  }

  const handleDpiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDpi = parseInt(e.target.value, 10) as CanvasSettings['dpi'];
    const oldDpi = settings.dpi;
    if (newDpi === oldDpi) return;

    if (settings.unit !== 'px') {
      const physicalWidth = pxToIn(settings.width, oldDpi);
      const physicalHeight = pxToIn(settings.height, oldDpi);
      setSettings(prev => ({
        ...prev,
        dpi: newDpi,
        width: inToPx(physicalWidth, newDpi),
        height: inToPx(physicalHeight, newDpi),
      }));
    } else {
      setSettings(prev => ({ ...prev, dpi: newDpi }));
    }
  };

  const handleOrientationChange = (orientation: CanvasSettings['orientation']) => {
    if (settings.orientation === orientation) return;
    setSettings(prev => ({
        ...prev,
        orientation,
        width: prev.height,
        height: prev.width
    }));
  };
  
  const handlePresetSelect = (preset: typeof PREDEFINED_SIZES[0]) => {
      const widthPx = preset.unit === 'px' ? preset.width : preset.unit === 'in' ? inToPx(preset.width, preset.dpi) : mmToPx(preset.width, preset.dpi);
      const heightPx = preset.unit === 'px' ? preset.height : preset.unit === 'in' ? inToPx(preset.height, preset.dpi) : mmToPx(preset.height, preset.dpi);

      setSettings(prev => ({
          ...prev,
          name: preset.name,
          width: widthPx,
          height: heightPx,
          unit: preset.unit,
          dpi: preset.dpi,
          orientation: preset.orientation,
          background: preset.background,
      }));
      setActiveTab('new');
  };
  
  const handleTemplateSelect = (template: Template) => {
    const { width, height, unit, dpi } = template.settings;
    const widthPx = unit === 'px' ? width : unit === 'in' ? inToPx(width, dpi) : mmToPx(width, dpi);
    const heightPx = unit === 'px' ? height : unit === 'in' ? inToPx(height, dpi) : mmToPx(height, dpi);

    const finalSettings: CanvasSettings = {
        ...INITIAL_CANVAS_SETTINGS,
        ...template.settings,
        name: template.name,
        width: widthPx,
        height: heightPx,
        artboards: 1, // Templates are single artboard for now
        colorMode: INITIAL_CANVAS_SETTINGS.colorMode, // Ensure colorMode is always present
    };
    const elements = template.elements.map(el => ({...el, id: `${Date.now()}-${el.id}`}));
    onCreate(finalSettings, elements);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
        ...settings,
        width: Math.round(settings.width),
        height: Math.round(settings.height),
    });
  };

  const baseBgBtnClass = "flex-1 p-2 rounded-md border text-sm transition-all";
  const activeBgBtnClass = "ring-2 ring-offset-1 ring-indigo-500";
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex border-b border-slate-200">
            <TabButton active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>Recientes</TabButton>
            <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>Plantillas</TabButton>
            <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')}>Nuevo</TabButton>
        </div>
        
        {activeTab === 'new' && (
             <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nombre del Archivo</label>
                  <StyledInput type="text" value={settings.name} onChange={e => handleSettingsChange('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Ancho</label>
                    <StyledInput type="number" name="width" value={displayValues.width} onChange={handleDisplayChange} step="0.01" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Alto</label>
                    <StyledInput type="number" name="height" value={displayValues.height} onChange={handleDisplayChange} step="0.01" />
                  </div>
                  <div className="col-span-1">
                    <StyledSelect value={settings.unit} onChange={e => handleSettingsChange('unit', e.target.value)}>
                      <option value="px">Píxeles</option> <option value="in">Pulgadas</option> <option value="mm">Milímetros</option>
                    </StyledSelect>
                  </div>
                   <div className="col-span-1">
                     <label className="block text-sm font-medium text-slate-600 mb-1">Resolución</label>
                     <StyledSelect value={settings.dpi} onChange={handleDpiChange}>
                        <option value="72">72 PPP (Pantalla)</option>
                        <option value="150">150 PPP (Impresión)</option>
                        <option value="300">300 PPP (Alta Calidad)</option>
                     </StyledSelect>
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Orientación</label>
                        <div className="flex gap-2">
                           <button type="button" onClick={() => handleOrientationChange('landscape')} className={`flex-1 p-2 rounded-md border text-sm flex items-center justify-center gap-2 transition-colors ${settings.orientation === 'landscape' ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-semibold' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                              <OrientationLandscapeIcon className="h-5 w-5" /> Horizontal
                           </button>
                           <button type="button" onClick={() => handleOrientationChange('portrait')} className={`flex-1 p-2 rounded-md border text-sm flex items-center justify-center gap-2 transition-colors ${settings.orientation === 'portrait' ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-semibold' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                              <OrientationPortraitIcon className="h-5 w-5" /> Vertical
                           </button>
                        </div>
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Modo de Color</label>
                         <StyledSelect value={settings.colorMode} onChange={e => handleSettingsChange('colorMode', e.target.value as any)}>
                            <option value="rgb">RGB</option> <option value="cmyk">CMYK</option>
                        </StyledSelect>
                      </div>
                 </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Fondo</label>
                  <div className="flex gap-2">
                      <button type="button" onClick={() => handleSettingsChange('background', 'transparent')} className={`${baseBgBtnClass} text-slate-700 ${settings.background === 'transparent' ? activeBgBtnClass : 'border-slate-300'}`} style={{backgroundImage: 'conic-gradient(#d1d5db 25%, #f9fafb 0 50%, #d1d5db 0 75%, #f9fafb 0)', backgroundSize: '16px 16px'}}>Transparente</button>
                      <button type="button" onClick={() => handleSettingsChange('background', 'white')} className={`${baseBgBtnClass} bg-white text-slate-700 ${settings.background === 'white' ? activeBgBtnClass : 'border-slate-300'}`}>Blanco</button>
                      <button type="button" onClick={() => handleSettingsChange('background', 'black')} className={`${baseBgBtnClass} bg-slate-800 text-white ${settings.background === 'black' ? activeBgBtnClass : 'border-slate-700'}`}>Negro</button>
                  </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Mesas de trabajo</label>
                    <StyledInput type="number" value={settings.artboards} min="1" onChange={e => handleSettingsChange('artboards', parseInt(e.target.value) || 1)} />
                </div>
                {settings.artboards > 1 && (
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Disposición</label>
                            <StyledSelect value={settings.artboardLayout} onChange={e => handleSettingsChange('artboardLayout', e.target.value)}>
                                <option value="grid">Cuadrícula</option>
                                <option value="row">Fila</option>
                                <option value="column">Columna</option>
                            </StyledSelect>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Espaciado</label>
                            <StyledInput type="number" value={settings.artboardSpacing} min="0" onChange={e => handleSettingsChange('artboardSpacing', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                )}
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancelar</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Crear</button>
              </div>
            </form>
        )}
        
        {activeTab === 'recent' && (
            <>
                <div className="p-6 h-[550px] overflow-y-auto">
                    {recentFiles.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            <h3 className="font-semibold text-lg">No hay archivos recientes</h3>
                            <p className="text-sm">Tus diseños guardados aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {recentFiles.map(file => (
                                <div key={file.id} onClick={() => onLoadFromRecent(file)} className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="bg-slate-100 border-b border-slate-200 aspect-[4/3]">
                                        <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm text-slate-800 transition-colors group-hover:text-indigo-600 truncate">{file.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(file.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cerrar</button>
                </div>
            </>
        )}
        
        {activeTab === 'templates' && (
             <div className="p-6 h-[550px] overflow-y-auto">
                 <div className="mb-6">
                    <h3 className="font-semibold text-slate-600 mb-2">Tamaños predefinidos</h3>
                    <div className="flex flex-wrap gap-2">
                        {PREDEFINED_SIZES.map(preset => (
                            <button key={preset.name} onClick={() => handlePresetSelect(preset)} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition">
                                {preset.name}
                            </button>
                        ))}
                    </div>
                 </div>
                 <div>
                    <h3 className="font-semibold text-slate-600 mb-2">Plantillas de Diseño</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {TEMPLATES.map(template => (
                           <div key={template.name} onClick={() => handleTemplateSelect(template)} className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <div className="bg-slate-100 border-b border-slate-200 h-32 p-2 flex items-center justify-center">
                                    <TemplatePreview template={template} />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm text-slate-800 transition-colors group-hover:text-indigo-600 truncate">{template.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};
