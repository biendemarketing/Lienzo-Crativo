
import React from 'react';
import { TEMPLATES } from '../templates';
import { type DesignElement, TextElement, RectangleElement, EllipseElement } from '../types';

interface TemplateGalleryModalProps {
    onClose: () => void;
    onSelectTemplate: (elements: DesignElement[]) => void;
}

// A mini-renderer for template previews
const TemplatePreview: React.FC<{ elements: DesignElement[] }> = ({ elements }) => {
    const scale = 0.2; // Render at 20% scale
    return (
        <div className="relative w-full h-full bg-white border border-slate-200 overflow-hidden rounded-md" style={{ aspectRatio: '4 / 3' }}>
            {elements.map(el => {
                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${el.x * scale}px`,
                    top: `${el.y * scale}px`,
                    width: `${el.width * scale}px`,
                    height: `${el.height * scale}px`,
                    transform: `rotate(${el.rotation}deg)`,
                };
                if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'triangle' || el.type === 'star') {
                    const shapeEl = el as RectangleElement | EllipseElement;
                    if(shapeEl.fill.type === 'solid') {
                         style.backgroundColor = shapeEl.fill.color;
                    } else {
                         style.backgroundColor = '#cccccc'; // Default for gradients
                    }
                }
                if (el.type === 'text') {
                    const textEl = el as TextElement;
                    if(textEl.fill.type === 'solid') {
                        style.color = textEl.fill.color;
                    }
                    style.fontSize = `${Math.max(textEl.fontSize * scale, 4)}px`;
                    style.fontWeight = textEl.fontWeight;
                }
                 if (el.type === 'image') {
                    return <div key={el.id} style={{...style, backgroundColor: '#d1d5db'}}></div>
                }
                return <div key={el.id} style={style}></div>;
            })}
        </div>
    );
};


export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({ onClose, onSelectTemplate }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">Elige una Plantilla</h2>
                    <p className="text-sm text-gray-500 mt-1">Empieza tu diseño con una de nuestras plantillas prediseñadas.</p>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {TEMPLATES.map((template, index) => (
                            <div
                                key={index}
                                className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                onClick={() => onSelectTemplate(template.elements.map(el => ({...el, id: `${Date.now()}-${el.id}`})))}
                            >
                                <div className="bg-slate-100 p-4 border-b border-slate-200">
                                    <TemplatePreview elements={template.elements} />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">{template.name}</h3>
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