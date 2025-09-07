import React, { useState, useEffect, useRef } from 'react';
import { ElementType, DesignElement } from '../types';
import { TextIcon, ImageIcon, SparklesIcon, BlocksIcon, SvgIcon, QrCodeIcon, ShapesIcon, RectangleIcon, CircleIcon, LineIcon, TriangleIcon, StarIcon, MagicWandIcon, SelectIcon, UploadCloudIcon, GlobeIcon, EraserIcon } from './icons';

export type EditorTool = 'select' | 'eraser' | 'magicWand';

interface ToolbarProps {
  onAddElement: (type: ElementType) => void;
  onAddCompleteElement: (element: DesignElement) => void;
  onGenerateWithAI: () => void;
  onOpenComponents: () => void;
  activeTool: EditorTool;
  onSetTool: (tool: EditorTool) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenImageUrlModal: () => void;
  onOpenUnsplashModal: () => void;
  onOpenSvgLibraryModal: () => void;
}

const TooltipButton: React.FC<{ children: React.ReactNode; onClick?: () => void; tip: string; isActive?: boolean }> = ({ children, onClick, tip, isActive = false }) => {
    return (
        <div className="group relative flex justify-center">
            <button
                onClick={onClick}
                className={`rounded-lg p-3 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isActive ? 'bg-indigo-100 text-indigo-600' : ''}`}
                aria-label={tip}
            >
                {children}
            </button>
            <span className="pointer-events-none absolute left-full ml-4 top-1/2 -translate-y-1/2 scale-95 opacity-0 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 origin-left">
                {tip}
            </span>
        </div>
    );
};


export const Toolbar: React.FC<ToolbarProps> = ({ onAddElement, onAddCompleteElement, onGenerateWithAI, onOpenComponents, activeTool, onSetTool, onImport, onOpenImageUrlModal, onOpenUnsplashModal, onOpenSvgLibraryModal }) => {
    const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
    const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
    const shapeMenuRef = useRef<HTMLDivElement>(null);
    const imageMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (shapeMenuRef.current && !shapeMenuRef.current.contains(target)) setIsShapeMenuOpen(false);
            if (imageMenuRef.current && !imageMenuRef.current.contains(target)) setIsImageMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddShape = (type: ElementType) => { onAddElement(type); setIsShapeMenuOpen(false); };
    const handleImportClick = () => { fileInputRef.current?.click(); setIsImageMenuOpen(false); };

    return (
    <nav className="flex w-20 flex-shrink-0 flex-col items-center gap-4 border-r border-slate-200 bg-slate-50/80 p-2 pt-6 backdrop-blur-sm z-20">
      <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept="image/*" />
      <TooltipButton onClick={() => onSetTool('select')} tip="Seleccionar" isActive={activeTool === 'select'}>
        <SelectIcon className="h-6 w-6" />
      </TooltipButton>
      <div className="my-2 h-px w-full bg-slate-200" />
      <TooltipButton onClick={() => onAddElement(ElementType.Text)} tip="Añadir Texto">
        <TextIcon className="h-6 w-6" />
      </TooltipButton>
      <div ref={shapeMenuRef} className="relative flex justify-center">
          <TooltipButton onClick={() => setIsShapeMenuOpen(prev => !prev)} tip="Añadir Forma" isActive={isShapeMenuOpen}>
            <ShapesIcon className="h-6 w-6" />
          </TooltipButton>
          <div className={`absolute left-full top-0 ml-4 w-auto origin-left transition-all duration-200 ${isShapeMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
              <div className="flex flex-col gap-2 rounded-lg border bg-white p-2 shadow-xl">
                  <TooltipButton onClick={() => handleAddShape(ElementType.Rectangle)} tip="Rectángulo"><RectangleIcon className="h-6 w-6" /></TooltipButton>
                  <TooltipButton onClick={() => handleAddShape(ElementType.Ellipse)} tip="Elipse"><CircleIcon className="h-6 w-6" /></TooltipButton>
                  <TooltipButton onClick={() => handleAddShape(ElementType.Triangle)} tip="Triángulo"><TriangleIcon className="h-6 w-6" /></TooltipButton>
                   <TooltipButton onClick={() => handleAddShape(ElementType.Star)} tip="Estrella"><StarIcon className="h-6 w-6" /></TooltipButton>
                  <TooltipButton onClick={() => handleAddShape(ElementType.Line)} tip="Línea"><LineIcon className="h-6 w-6" /></TooltipButton>
              </div>
          </div>
      </div>
      <div ref={imageMenuRef} className="relative flex justify-center">
        <TooltipButton onClick={() => setIsImageMenuOpen(prev => !prev)} tip="Añadir Imagen" isActive={isImageMenuOpen}>
          <ImageIcon className="h-6 w-6" />
        </TooltipButton>
        <div className={`absolute left-full -top-6 ml-4 w-auto origin-left transition-all duration-200 ${isImageMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
            <div className="flex w-48 flex-col gap-1 rounded-lg border bg-white p-2 shadow-xl">
                <button onClick={handleImportClick} className="flex items-center gap-2 rounded p-2 text-left text-sm text-slate-700 hover:bg-slate-100"><UploadCloudIcon className="h-4 w-4" /> Subir archivo</button>
                <button onClick={() => { onOpenImageUrlModal(); setIsImageMenuOpen(false); }} className="flex items-center gap-2 rounded p-2 text-left text-sm text-slate-700 hover:bg-slate-100"><GlobeIcon className="h-4 w-4" /> Desde URL</button>
                <button onClick={() => { onOpenUnsplashModal(); setIsImageMenuOpen(false); }} className="flex items-center gap-2 rounded p-2 text-left text-sm text-slate-700 hover:bg-slate-100"><ImageIcon className="h-4 w-4" /> Biblioteca</button>
            </div>
        </div>
      </div>
      <TooltipButton onClick={() => onSetTool('eraser')} tip="Borrador" isActive={activeTool === 'eraser'}><EraserIcon className="h-6 w-6" /></TooltipButton>
       <TooltipButton onClick={() => onSetTool('magicWand')} tip="Varita Mágica" isActive={activeTool === 'magicWand'}><MagicWandIcon className="h-6 w-6" /></TooltipButton>
      <TooltipButton onClick={onOpenSvgLibraryModal} tip="Añadir Icono SVG"><SvgIcon className="h-6 w-6" /></TooltipButton>
      <TooltipButton onClick={() => onAddElement(ElementType.QrCode)} tip="Añadir Código QR"><QrCodeIcon className="h-6 w-6" /></TooltipButton>
       <div className="my-2 h-px w-full bg-slate-200" />
      <TooltipButton onClick={onOpenComponents} tip="Componentes"><BlocksIcon className="h-6 w-6" /></TooltipButton>
      <TooltipButton onClick={onGenerateWithAI} tip="Generar con IA"><SparklesIcon className="h-6 w-6 text-purple-600" /></TooltipButton>
    </nav>
  );
};