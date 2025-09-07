import React from 'react';
import { PREBUILT_COMPONENTS } from '../components';
import { type DesignElement, GroupElement, CanvasSettings, ViewState } from '../types';
import { Canvas } from './Canvas'; // Use a simplified Canvas for preview

interface ComponentsModalProps {
    onClose: () => void;
    onAddComponent: (element: GroupElement) => void;
}

const ComponentPreview: React.FC<{ elements: DesignElement[] }> = ({ elements }) => {
    // Find the bounding box to center the component in the preview
    const minX = Math.min(...elements.map(e => e.x));
    const minY = Math.min(...elements.map(e => e.y));
    const maxX = Math.max(...elements.map(e => e.x + e.width));
    const maxY = Math.max(...elements.map(e => e.y + e.height));
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Scale to fit preview box
    const scale = Math.min(1, 180 / width, 120 / height);
    
    const previewCanvasSettings: CanvasSettings = {
        name: 'preview',
        width: width,
        height: height,
        unit: 'px',
        dpi: 72,
        orientation: 'landscape',
        colorMode: 'rgb',
        background: 'transparent',
        artboards: 1,
    };
    
    const previewViewState: ViewState = {
        zoom: scale,
        pan: { x: 0, y: 0 }
    };

    const shiftedElements = elements.map(el => ({
        ...el,
        x: el.x - minX,
        y: el.y - minY,
    }));
    
    return (
        <div className="relative w-full h-full bg-transparent overflow-hidden rounded-md flex items-center justify-center pointer-events-none">
            <div className="relative" style={{ width: width * scale, height: height * scale }}>
                 <div className="absolute inset-0 transform" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                    <Canvas
                        elements={shiftedElements}
                        activeElements={shiftedElements}
                        canvasSettings={previewCanvasSettings}
                        guides={{horizontal: [], vertical: []}}
                        selectedElementIds={[]}
                        editingGroupId={null}
                        onSetEditingGroupId={() => {}}
                        onSelectElement={() => {}}
                        onUpdateElements={() => {}}
                        onContextMenu={() => {}}
                        activeTool="select"
                        onMagicWandSelect={() => {}}
                        onEditMask={() => {}}
                        viewState={{zoom: 1, pan: {x: 0, y: 0}}}
                        isPanning={false}
                        onUpdateGuide={() => {}}
                        onDeleteGuide={() => {}}
                    />
                </div>
            </div>
        </div>
    );
};


export const ComponentsModal: React.FC<ComponentsModalProps> = ({ onClose, onAddComponent }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">Añadir Componente</h2>
                    <p className="text-sm text-gray-500 mt-1">Añade elementos pre-construidos a tu diseño.</p>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {PREBUILT_COMPONENTS.map((component, index) => (
                            <div
                                key={index}
                                className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                onClick={() => {
                                    onAddComponent(JSON.parse(JSON.stringify(component))); // Deep copy
                                    onClose();
                                }}
                            >
                                <div className="bg-slate-100 p-4 border-b border-slate-200 h-40 flex items-center justify-center">
                                    <ComponentPreview elements={component.children} />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">{component.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};