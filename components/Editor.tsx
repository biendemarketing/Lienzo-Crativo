
import React, { useState, useEffect, useRef } from 'react';
import { type DesignElement, ElementType, Alignment, ImageElement, CanvasSettings, RecentFile, DesignProject, ViewState } from '../types';
import { Canvas } from './Canvas';
import { InspectorPanel } from './InspectorPanel';
import { LayersPanel } from './LayersPanel';
import { Toolbar, EditorTool } from './Toolbar';
import { GenerationModal } from './GenerationModal';
import { ContextMenu } from './ContextMenu';
import { LCLogoIcon, ZoomInIcon, ZoomOutIcon, FitToScreenIcon } from './icons';
import { DrawingCanvas } from './DrawingCanvas';
import { floodFill } from '../utils/floodFill';
import { MenuBar } from './MenuBar';
import { NewFileModal } from './NewFileModal';
import { FileTabs } from './FileTabs';
import { ComponentsModal } from './ComponentsModal';
import { Rulers } from './Rulers';


type DrawingState = {
  mode: 'mask';
  element: DesignElement;
} | null;

const RULER_WIDTH = 24;


interface EditorProps {
  elements: DesignElement[];
  activeElements: DesignElement[]; // The root-level elements array
  canvasSettings: CanvasSettings;
  guides: { horizontal: number[], vertical: number[] };
  onAddGuide: (axis: 'horizontal' | 'vertical', position: number) => void;
  onUpdateGuide: (axis: 'horizontal' | 'vertical', index: number, position: number) => void;
  onDeleteGuide: (axis: 'horizontal' | 'vertical', index: number) => void;
  selectedElementIds: string[];
  selectedElements: DesignElement[];
  editingGroupId: string | null;
  onSetEditingGroupId: (id: string | null) => void;
  onAcceptGroupChanges: () => void;
  onDiscardGroupChanges: () => void;
  onSelectElement: (id: string | null, shiftKey: boolean) => void;
  onUpdateElements: (ids: string[], updates: Partial<DesignElement>) => void;
  onUpdateElementName: (id: string, name: string) => void;
  onAddElement: (type: ElementType) => void;
  onAddCompleteElement: (element: DesignElement) => void;
  onDeleteElements: (ids: string[]) => void;
  onDuplicateElements: (ids: string[]) => void;
  onBringForward: (ids: string[]) => void;
  onSendBackward: (ids: string[]) => void;
  onBringToFront: (ids: string[]) => void;
  onSendToBack: (ids: string[]) => void;
  onMoveElement: (draggedId: string, dropTargetId: string) => void;
  onAlignElements: (alignment: Alignment) => void;
  onGenerateLayout: (prompt: string) => Promise<void>;
  onSetElements: (elements: DesignElement[], settings?: CanvasSettings) => void;
  onToggleElementLock: (id: string) => void;
  onToggleSelectedLock: () => void;
  onGroupElements: () => void;
  onUngroupElements: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  setError: (message: string) => void;
  viewState: ViewState;
  onSetViewState: (vs: ViewState) => void;
  // Menu Actions
  onNew: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenImageUrlModal: () => void;
  onOpenUnsplashModal: () => void;
  onOpenSvgLibraryModal: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canPaste: boolean;
  onSelectAll: () => void;
  onToggleRulers: () => void;
  // New File Modal
  isNewFileModalOpen: boolean;
  onCloseNewFileModal: () => void;
  onCreateNewDesign: (settings: CanvasSettings, elements?: DesignElement[]) => void;
  // FIX: Added missing props for recent files functionality
  recentFiles: RecentFile[];
  onLoadFromRecent: (file: RecentFile) => void;
  // Tabs
  openDesigns: DesignProject[];
  activeDesignId: string | null;
  onSwitchDesign: (id: string) => void;
  onCloseDesign: (id: string) => void;
}

export const Editor: React.FC<EditorProps> = (props) => {
  const {
    elements, activeElements, canvasSettings, guides, onAddGuide, onUpdateGuide, onDeleteGuide, selectedElementIds, selectedElements, editingGroupId, onSetEditingGroupId, onAcceptGroupChanges, onDiscardGroupChanges, onSelectElement, onUpdateElements, onUpdateElementName, onAddElement,
    onAddCompleteElement, onDeleteElements, onDuplicateElements, onBringForward, onSendBackward,
    onBringToFront, onSendToBack, onMoveElement, onAlignElements, onGenerateLayout, onSetElements,
    onToggleElementLock, onToggleSelectedLock, onGroupElements, onUngroupElements, isLoading, error, clearError, setError,
    viewState, onSetViewState,
    // Menu Props
    onNew, onSave, onSaveAs, onLoad, onImport, onOpenImageUrlModal, onOpenUnsplashModal, onOpenSvgLibraryModal, onExportSvg, onExportPng, onExportPdf, onPrint, onUndo, onRedo, canUndo, canRedo, onCut, onCopy, onPaste, canPaste, onSelectAll, onToggleRulers,
    // New File Modal
    isNewFileModalOpen, onCloseNewFileModal, onCreateNewDesign,
    // Tabs
    openDesigns, activeDesignId, onSwitchDesign, onCloseDesign
  } = props;
  
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean } | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [isPanning, setIsPanning] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainEl = workspaceRef.current;
    if (!mainEl) return;
    
    const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const { clientX, clientY, deltaY } = e;
            const rect = mainEl.getBoundingClientRect();
            const pointer = { x: clientX - rect.left, y: clientY - rect.top };
            const zoomPoint = {
                x: (pointer.x - viewState.pan.x) / viewState.zoom,
                y: (pointer.y - viewState.pan.y) / viewState.zoom
            };
            
            const newZoom = Math.max(0.1, Math.min(5, viewState.zoom - deltaY * 0.005));
            const newPan = {
                x: pointer.x - zoomPoint.x * newZoom,
                y: pointer.y - zoomPoint.y * newZoom
            };
            
            onSetViewState({ ...viewState, zoom: newZoom, pan: newPan });
        } else {
             mainEl.scrollTop += e.deltaY;
             mainEl.scrollLeft += e.deltaX;
        }
    };
    
    mainEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => mainEl.removeEventListener('wheel', handleWheel);
  }, [viewState, onSetViewState]);
  
  useEffect(() => {
    const handleSpaceDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning && !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPanning(false);
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
        if (zoomMenuRef.current && !zoomMenuRef.current.contains(event.target as Node)) {
            setIsZoomMenuOpen(false);
        }
    };

    window.addEventListener('keydown', handleSpaceDown);
    window.addEventListener('keyup', handleSpaceUp);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleSpaceDown);
      window.removeEventListener('keyup', handleSpaceUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanning]);
  
  const handlePanStart = (e: React.MouseEvent) => {
    if (isPanning) {
      panStartRef.current = {
        x: e.clientX - viewState.pan.x,
        y: e.clientY - viewState.pan.y,
      };
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning && e.buttons === 1) {
      e.preventDefault();
      onSetViewState({
        ...viewState,
        pan: {
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        }
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, elementId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectElement(elementId || null, e.shiftKey);
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  };
  
  const handleEditMask = () => {
    if (selectedElements.length === 1) {
        setDrawingState({ mode: 'mask', element: selectedElements[0] });
    }
  };

  const saveMask = (elementId: string, dataUrl: string) => {
    onUpdateElements([elementId], { mask: { enabled: true, dataUrl }});
    setDrawingState(null);
  };

  const handleMagicWandSelect = (elementId: string, localX: number, localY: number) => {
      const element = elements.find(el => el.id === elementId) as ImageElement;
      if (!element || !element.src) return;

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          
          const scaledX = Math.round(localX * (img.width / element.width));
          const scaledY = Math.round(localY * (img.height / element.height));

          const maskImageData = floodFill(imageData, scaledX, scaledY, 30); // Tolerance of 30
          
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          const maskCtx = maskCanvas.getContext('2d');
          if (!maskCtx) return;
          maskCtx.putImageData(maskImageData, 0, 0);
          
          const dataUrl = maskCanvas.toDataURL();
          onUpdateElements([elementId], { mask: { enabled: true, dataUrl } });
          setActiveTool('select');
      };
      img.src = element.src;
  };

  const handleFitToScreen = () => {
      if (!workspaceRef.current) return;
      const { clientWidth, clientHeight } = workspaceRef.current;
      const padding = 80;
      const availableWidth = clientWidth - padding;
      const availableHeight = clientHeight - padding;
      
      const newZoom = Math.min(availableWidth / canvasSettings.width, availableHeight / canvasSettings.height);
      
      const newPan = {
          x: (clientWidth - canvasSettings.width * newZoom) / 2,
          y: (clientHeight - canvasSettings.height * newZoom) / 2
      };
      
      onSetViewState({ zoom: newZoom, pan: newPan, isRulersVisible: viewState.isRulersVisible });
      setIsZoomMenuOpen(false);
  };
  
  const workspaceBgStyle: React.CSSProperties = canvasSettings.background === 'transparent' ? { backgroundImage: 'conic-gradient(#d1d5db 25%, #f9fafb 0 50%, #d1d5db 0 75%, #f9fafb 0)', backgroundSize: '20px 20px' } : {};

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-100 font-sans">
        {isNewFileModalOpen && <NewFileModal onClose={onCloseNewFileModal} onCreate={onCreateNewDesign} recentFiles={props.recentFiles} onLoadFromRecent={props.onLoadFromRecent} />}
        {isGenerationModalOpen && <GenerationModal onClose={() => setIsGenerationModalOpen(false)} onGenerate={onGenerateLayout} isLoading={isLoading} />}
        {isComponentsModalOpen && <ComponentsModal onClose={() => setIsComponentsModalOpen(false)} onAddComponent={onAddCompleteElement} />}
        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} targetIds={selectedElementIds} selectedElements={selectedElements} onClose={() => setContextMenu(null)} onDuplicate={onDuplicateElements} onDelete={onDeleteElements} onBringForward={() => onBringForward(selectedElementIds)} onSendBackward={() => onSendBackward(selectedElementIds)} onBringToFront={() => onBringToFront(selectedElementIds)} onSendToBack={() => onSendToBack(selectedElementIds)} onAlign={onAlignElements} onGroup={onGroupElements} onUngroup={onUngroupElements} />}
        {drawingState?.mode === 'mask' && <DrawingCanvas elementToEdit={drawingState.element} onSave={saveMask} onClose={() => setDrawingState(null)} />}
        
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm z-50">
            <div className="flex items-center gap-4">
                <LCLogoIcon className="h-8 w-8" />
                <MenuBar
                    onNew={onNew} onSave={onSave} onSaveAs={onSaveAs} onLoad={onLoad} onImport={onImport}
                    onExportSvg={onExportSvg} onExportPng={onExportPng} onExportPdf={onExportPdf} onPrint={onPrint}
                    onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo}
                    onCut={onCut} onCopy={onCopy} onPaste={onPaste} canPaste={canPaste} onSelectAll={onSelectAll}
                    selectedElements={selectedElements} onBringForward={() => onBringForward(selectedElementIds)}
                    onSendBackward={() => onSendBackward(selectedElementIds)} onBringToFront={() => onBringToFront(selectedElementIds)}
                    onSendToBack={() => onSendToBack(selectedElementIds)} onToggleLock={onToggleSelectedLock}
                    onGroup={onGroupElements} onUngroup={onUngroupElements}
                    recentFiles={props.recentFiles} onLoadFromRecent={props.onLoadFromRecent}
                    onToggleRulers={onToggleRulers} isRulersVisible={viewState.isRulersVisible ?? true}
                />
            </div>
            {error && <div className="absolute left-1/2 -translate-x-1/2 top-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700 shadow-md transition-opacity animate-pulse">{error}</div>}
        </header>

        <div className="flex min-h-0 flex-1">
            <Toolbar
                onAddElement={onAddElement}
                onAddCompleteElement={onAddCompleteElement}
                onGenerateWithAI={() => setIsGenerationModalOpen(true)}
                onOpenComponents={() => setIsComponentsModalOpen(true)}
                activeTool={activeTool}
                onSetTool={setActiveTool}
                onImport={onImport}
                onOpenImageUrlModal={onOpenImageUrlModal}
                onOpenUnsplashModal={onOpenUnsplashModal}
                onOpenSvgLibraryModal={onOpenSvgLibraryModal}
            />
            <div className="flex flex-1 flex-col min-w-0">
                <FileTabs openDesigns={openDesigns} activeDesignId={activeDesignId} onSwitchDesign={onSwitchDesign} onCloseDesign={onCloseDesign} />
                 {editingGroupId && (
                    <div className="flex-shrink-0 z-30 bg-yellow-100 border-b border-yellow-300 flex items-center justify-between p-2 text-sm">
                        <p className="text-yellow-800 font-medium">Editando grupo. <span className="font-normal">Solo los elementos del grupo son editables.</span></p>
                        <div>
                            <button onClick={onDiscardGroupChanges} className="px-3 py-1 rounded-md text-slate-700 hover:bg-yellow-200 font-medium">Descartar</button>
                            <button onClick={onAcceptGroupChanges} className="ml-2 px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium">Aceptar</button>
                        </div>
                    </div>
                )}
                <div className="flex-1 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] min-h-0 bg-slate-200 relative">
                     {viewState.isRulersVisible && (
                        <Rulers viewState={viewState} onAddGuide={onAddGuide} workspaceRef={workspaceRef} />
                     )}
                     <main ref={workspaceRef} className="overflow-auto bg-slate-200 col-start-2 row-start-2 relative" style={workspaceBgStyle} onMouseDown={handlePanStart} onMouseMove={handlePanMove}>
                         <div className={`relative w-max h-max mx-auto my-auto p-8 transition-all duration-100 ${isPanning ? 'cursor-grab' : ''}`} >
                             <div style={{ transform: `scale(${viewState.zoom})`, transformOrigin: 'top left' }}>
                                 <div style={{ transform: `translate(${viewState.pan.x / viewState.zoom}px, ${viewState.pan.y / viewState.zoom}px)` }}>
                                     <Canvas
                                         elements={elements}
                                         activeElements={activeElements}
                                         canvasSettings={canvasSettings}
                                         guides={guides}
                                         onUpdateGuide={onUpdateGuide}
                                         onDeleteGuide={onDeleteGuide}
                                         selectedElementIds={selectedElementIds}
                                         editingGroupId={editingGroupId}
                                         onSetEditingGroupId={onSetEditingGroupId}
                                         onSelectElement={onSelectElement}
                                         onUpdateElements={onUpdateElements}
                                         onContextMenu={(e, id) => handleContextMenu(e, id)}
                                         activeTool={activeTool}
                                         onMagicWandSelect={handleMagicWandSelect}
                                         onEditMask={handleEditMask}
                                         viewState={viewState}
                                         isPanning={isPanning}
                                     />
                                 </div>
                             </div>
                         </div>
                     </main>
                     <div ref={zoomMenuRef} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg border bg-white/80 p-1.5 shadow-lg backdrop-blur-sm">
                        <button onClick={() => onSetViewState({...viewState, zoom: viewState.zoom / 1.2})} className="p-2 rounded-md text-slate-500 hover:bg-slate-100"><ZoomOutIcon className="h-5 w-5"/></button>
                        <div className="relative">
                            <button onClick={() => setIsZoomMenuOpen(prev => !prev)} className="text-sm font-medium text-slate-600 w-16 text-center py-2 rounded-md hover:bg-slate-100">{(viewState.zoom * 100).toFixed(0)}%</button>
                            {isZoomMenuOpen && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-white rounded-md shadow-lg border p-1">
                                    {[25, 50, 75, 100, 150, 200].map(p => (
                                        <button key={p} onClick={() => { onSetViewState({...viewState, zoom: p / 100}); setIsZoomMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-slate-100">{p}%</button>
                                    ))}
                                    <div className="h-px bg-slate-200 my-1"/>
                                    <button onClick={handleFitToScreen} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-slate-100">Ajustar a pantalla</button>
                                </div>
                            )}
                        </div>
                        <button onClick={() => onSetViewState({...viewState, zoom: viewState.zoom * 1.2})} className="p-2 rounded-md text-slate-500 hover:bg-slate-100"><ZoomInIcon className="h-5 w-5"/></button>
                        <button onClick={handleFitToScreen} className="p-2 rounded-md text-slate-500 hover:bg-slate-100" title="Ajustar a pantalla"><FitToScreenIcon className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
            <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col z-30">
                {selectedElementIds.length > 1 && (
                    <div className="p-4 border-b border-slate-200 text-sm text-slate-600">
                        {selectedElementIds.length} elementos seleccionados
                    </div>
                )}
                <InspectorPanel selectedElements={selectedElements} onUpdateElements={onUpdateElements} onEditMask={handleEditMask} />
                <LayersPanel
                    elements={activeElements}
                    selectedElementIds={selectedElementIds}
                    editingGroupId={editingGroupId}
                    onSelectElement={onSelectElement}
                    onDeleteElement={(id) => onDeleteElements([id])}
                    onBringToFront={(id) => onBringToFront([id])}
                    onSendToBack={(id) => onSendToBack([id])}
                    onToggleVisibility={(id, isVisible) => onUpdateElements([id], { isVisible })}
                    onToggleLock={onToggleElementLock}
                    onMoveElement={onMoveElement}
                    onUpdateName={onUpdateElementName}
                />
            </aside>
        </div>
    </div>
  );
};
