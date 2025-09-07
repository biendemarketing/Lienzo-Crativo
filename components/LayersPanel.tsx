import React, { useState, useRef, useEffect } from 'react';
import { type DesignElement, ElementType, GroupElement } from '../types';
import { TextIcon, RectangleIcon, ImageIcon, TrashIcon, ChevronsUpIcon, ChevronsDownIcon, CircleIcon, LineIcon, SvgIcon, QrCodeIcon, EyeIcon, EyeOffIcon, TriangleIcon, StarIcon, LockIcon, UnlockIcon, FolderIcon, FolderOpenIcon, ChevronDownIcon } from './icons';

interface LayersPanelProps {
  elements: DesignElement[];
  selectedElementIds: string[];
  editingGroupId: string | null;
  onSelectElement: (id: string, shiftKey: boolean) => void;
  onDeleteElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onToggleLock: (id: string) => void;
  onMoveElement: (draggedId: string, dropTargetId: string) => void;
  onUpdateName: (id: string, name: string) => void;
}

const getLayerName = (element: DesignElement): string => {
    if (element.name) return element.name;
    switch (element.type) { 
        case ElementType.Group: return 'Grupo';
        case ElementType.Text: return element.content.length > 15 ? element.content.substring(0, 15) + '...' : element.content || 'Texto vacío'; 
        case ElementType.Rectangle: return 'Rectángulo'; 
        case ElementType.Image: return 'Imagen'; 
        case ElementType.Ellipse: return 'Elipse'; 
        case ElementType.Line: return 'Línea'; 
        case ElementType.Svg: return 'Icono SVG'; 
        case ElementType.QrCode: return 'Código QR'; 
        case ElementType.Triangle: return 'Triángulo';
        case ElementType.Star: return 'Estrella';
        default: return 'Elemento'; 
    }
}

const getLayerIcon = (element: DesignElement, isExpanded: boolean) => {
    const iconClass = "h-4 w-4 mr-2 flex-shrink-0";
    switch(element.type) { 
        case ElementType.Group: return isExpanded ? <FolderOpenIcon className={iconClass} /> : <FolderIcon className={iconClass} />;
        case ElementType.Text: return <TextIcon className={iconClass} />; 
        case ElementType.Rectangle: return <RectangleIcon className={iconClass} />; 
        case ElementType.Image: return <ImageIcon className={iconClass} />; 
        case ElementType.Ellipse: return <CircleIcon className={iconClass} />; 
        case ElementType.Line: return <LineIcon className={iconClass} />; 
        case ElementType.Svg: return <SvgIcon className={iconClass} />; 
        case ElementType.QrCode: return <QrCodeIcon className={iconClass} />; 
        case ElementType.Triangle: return <TriangleIcon className={iconClass} />; 
        case ElementType.Star: return <StarIcon className={iconClass} />; 
        default: return null; 
    }
}

const LayerItem: React.FC<{
    el: DesignElement;
    level: number;
    isDraggable: boolean;
    selectedElementIds: string[];
    onSelectElement: (id: string, shiftKey: boolean) => void;
    onDeleteElement: (id: string) => void;
    onToggleVisibility: (id: string, isVisible: boolean) => void;
    onToggleLock: (id: string) => void;
    onMoveElement: (draggedId: string, dropTargetId: string) => void;
    onUpdateName: (id: string, name: string) => void;
}> = ({ el, level, isDraggable, ...props }) => {
    const { onSelectElement, onUpdateName } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(getLayerName(el));
    const inputRef = useRef<HTMLInputElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [dragOver, setDragOver] = useState(false);


    useEffect(() => {
        setName(getLayerName(el));
    }, [el]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleNameBlur = () => {
        onUpdateName(el.id, name);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameBlur();
        } else if (e.key === 'Escape') {
            setName(getLayerName(el));
            setIsEditing(false);
        }
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, elementId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', elementId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTargetId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== dropTargetId) {
            props.onMoveElement(draggedId, dropTargetId);
        }
        setDragOver(false);
    };

    const handleDragLeave = () => setDragOver(false);
  
    const isSelected = props.selectedElementIds.includes(el.id);
    const isVisible = el.isVisible ?? true;
    const isLocked = el.isLocked ?? false;
    const isGroup = el.type === ElementType.Group;

    return (
        <React.Fragment key={el.id}>
            <div
              draggable={isDraggable && !isLocked}
              onDragStart={(e) => isDraggable && !isLocked && handleDragStart(e, el.id)}
              onDragOver={(e) => isDraggable && !isLocked && handleDragOver(e)}
              onDrop={(e) => isDraggable && !isLocked && handleDrop(e, el.id)}
              onDragLeave={handleDragLeave}
              onDragEnd={() => setDragOver(false)}
              onClick={(e) => onSelectElement(el.id, e.shiftKey)}
              onDoubleClick={() => setIsEditing(true)}
              className={`relative flex items-center justify-between py-2.5 text-sm cursor-pointer transition-colors duration-150 ${
                isSelected ? 'bg-indigo-100 text-indigo-800 font-medium' : `text-slate-700 hover:bg-slate-50 ${!isVisible || isLocked ? 'opacity-50' : ''}`
              }`}
              style={{ paddingLeft: `${1 + level * 1.5}rem` }}
            >
              {dragOver && isDraggable && <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500" />}
              <div className="flex items-center truncate gap-0">
                  {isGroup && (
                      <button onClick={(e) => { e.stopPropagation(); setIsExpanded(prev => !prev); }} className="p-1.5 -ml-2 rounded text-slate-500 hover:bg-slate-200">
                          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      </button>
                  )}
                  <div className="flex items-center pl-1 truncate">
                    {getLayerIcon(el, isExpanded)}
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent outline-none ring-1 ring-indigo-500 rounded px-1 -ml-1 w-full"
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <span className="truncate">{name}</span>
                    )}
                  </div>
              </div>
              <div className="flex items-center gap-1 text-slate-600 pr-4">
                   <button onClick={(e) => { e.stopPropagation(); props.onToggleLock(el.id); }} className="p-1 rounded-md hover:bg-slate-200/50 hover:text-indigo-600">{isLocked ? <LockIcon className="h-4 w-4" /> : <UnlockIcon className="h-4 w-4" />}</button>
                   <button onClick={(e) => { e.stopPropagation(); props.onToggleVisibility(el.id, !isVisible);}} className="p-1 rounded-md hover:bg-slate-200/50 hover:text-indigo-600">{isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}</button>
              </div>
            </div>
            {isGroup && isExpanded && (el as GroupElement).children && (
                <div className="bg-slate-50/50">
                    {[...(el as GroupElement).children].reverse().map((child: DesignElement) => <LayerItem key={child.id} el={child} level={level + 1} isDraggable={false} {...props} />)}
                </div>
            )}
        </React.Fragment>
    )
};

export const LayersPanel: React.FC<LayersPanelProps> = (props) => {
    const { elements, editingGroupId } = props;
    const elementsToRender = editingGroupId ? (elements.find(el => el.id === editingGroupId) as GroupElement)?.children || [] : elements;

    return (
        <div className="flex h-1/2 flex-col border-t border-slate-200 bg-white">
          <h3 className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{props.editingGroupId ? 'Capas del Grupo' : 'Capas'}</h3>
          <div className="flex-1 overflow-y-auto">
            <div>
                {[...elementsToRender].reverse().map(el => <LayerItem key={el.id} el={el} level={0} isDraggable={!props.editingGroupId} {...props} />)}
            </div>
          </div>
        </div>
      );
};