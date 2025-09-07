
import React, { useEffect, useRef } from 'react';
import { type DesignElement, type Alignment, ElementType } from '../types';
import { DuplicateIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ChevronsUpIcon, ChevronsDownIcon, AlignLeftIcon, AlignCenterHorizontalIcon, AlignRightIcon, AlignTopIcon, AlignCenterVerticalIcon, AlignBottomIcon, DistributeHorizontalIcon, DistributeVerticalIcon, GroupIcon, UngroupIcon } from './icons';

interface ContextMenuProps {
    x: number;
    y: number;
    targetIds: string[];
    selectedElements: DesignElement[];
    onClose: () => void;
    onDuplicate: (ids: string[]) => void;
    onDelete: (ids: string[]) => void;
    onBringForward: (ids: string[]) => void;
    onSendBackward: (ids: string[]) => void;
    onBringToFront: (ids: string[]) => void;
    onSendToBack: (ids: string[]) => void;
    onAlign: (alignment: Alignment) => void;
    onGroup: () => void;
    onUngroup: () => void;
}

const MenuItem: React.FC<{ onClick?: () => void; children: React.ReactNode; isDestructive?: boolean; disabled?: boolean }> = ({ onClick, children, isDestructive = false, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm rounded-md transition-colors ${
            isDestructive 
                ? 'text-red-600 hover:bg-red-50 disabled:bg-transparent disabled:text-slate-400' 
                : 'text-slate-700 hover:bg-slate-100 disabled:bg-transparent disabled:text-slate-400'
        }`}
    >
        {children}
    </button>
);

const AlignmentButton: React.FC<{ onClick: () => void; tip: string; children: React.ReactNode }> = ({ onClick, tip, children }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
        aria-label={tip}
        title={tip}
    >
        {children}
    </button>
);

export const ContextMenu: React.FC<ContextMenuProps> = (props) => {
    const {
        x, y, targetIds, selectedElements, onClose, onDuplicate, onDelete, onBringForward, onSendBackward, onBringToFront, onSendToBack, onAlign, onGroup, onUngroup
    } = props;
    const menuRef = useRef<HTMLDivElement>(null);
    
    const canGroup = selectedElements.length > 1;
    const canUngroup = selectedElements.length > 0 && selectedElements.some(el => el.type === ElementType.Group);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    
    const handleAction = (action: (ids: string[]) => void) => {
        action(targetIds);
        onClose();
    };
    
    const handleSimpleAction = (action: () => void) => {
        action();
        onClose();
    }

    const handleAlignAction = (alignment: Alignment) => {
        onAlign(alignment);
        onClose();
    }

    const iconClass = "h-4 w-4";
    const alignIconSize = "h-5 w-5";

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-64 rounded-lg border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-sm"
            style={{ top: y, left: x }}
        >
            <div className="space-y-1">
                {targetIds.length > 1 && (
                    <>
                        <div className="px-2 pt-1 pb-2">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Alinear</h3>
                            <div className="flex items-center justify-between gap-1">
                                <AlignmentButton onClick={() => handleAlignAction('left')} tip="Alinear a la Izquierda"><AlignLeftIcon className={alignIconSize} /></AlignmentButton>
                                <AlignmentButton onClick={() => handleAlignAction('center-h')} tip="Alinear al Centro (Horizontal)"><AlignCenterHorizontalIcon className={alignIconSize} /></AlignmentButton>
                                <AlignmentButton onClick={() => handleAlignAction('right')} tip="Alinear a la Derecha"><AlignRightIcon className={alignIconSize} /></AlignmentButton>
                                <div className="h-6 w-px bg-slate-200" />
                                <AlignmentButton onClick={() => handleAlignAction('top')} tip="Alinear Arriba"><AlignTopIcon className={alignIconSize} /></AlignmentButton>
                                <AlignmentButton onClick={() => handleAlignAction('center-v')} tip="Alinear al Centro (Vertical)"><AlignCenterVerticalIcon className={alignIconSize} /></AlignmentButton>
                                <AlignmentButton onClick={() => handleAlignAction('bottom')} tip="Alinear Abajo"><AlignBottomIcon className={alignIconSize} /></AlignmentButton>
                            </div>
                        </div>

                        {targetIds.length > 2 && (
                            <div className="px-2 pt-1 pb-2">
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Distribuir</h3>
                                <div className="flex items-center justify-around gap-1">
                                    <AlignmentButton onClick={() => handleAlignAction('distribute-h')} tip="Distribuir Horizontalmente"><DistributeHorizontalIcon className={alignIconSize} /></AlignmentButton>
                                    <AlignmentButton onClick={() => handleAlignAction('distribute-v')} tip="Distribuir Verticalmente"><DistributeVerticalIcon className={alignIconSize} /></AlignmentButton>
                                </div>
                            </div>
                        )}
                        <div className="h-px bg-slate-200 my-1" />
                    </>
                )}

                <MenuItem onClick={() => handleSimpleAction(onGroup)} disabled={!canGroup}>
                    <GroupIcon className={iconClass} />
                    <span>Agrupar</span>
                </MenuItem>
                 <MenuItem onClick={() => handleSimpleAction(onUngroup)} disabled={!canUngroup}>
                    <UngroupIcon className={iconClass} />
                    <span>Desagrupar</span>
                </MenuItem>

                <div className="h-px bg-slate-200 my-1" />

                <MenuItem onClick={() => handleAction(onDuplicate)}>
                    <DuplicateIcon className={iconClass} />
                    <span>Duplicar</span>
                </MenuItem>

                <div className="h-px bg-slate-200 my-1" />

                <MenuItem onClick={() => handleAction(onBringForward)}>
                    <ArrowUpIcon className={iconClass} />
                    <span>Traer adelante</span>
                </MenuItem>
                <MenuItem onClick={() => handleAction(onSendBackward)}>
                    <ArrowDownIcon className={iconClass} />
                    <span>Enviar atrás</span>
                </MenuItem>
                <MenuItem onClick={() => handleAction(onBringToFront)}>
                    <ChevronsUpIcon className={iconClass} />
                    <span>Traer al frente</span>
                </MenuItem>
                <MenuItem onClick={() => handleAction(onSendToBack)}>
                    <ChevronsDownIcon className={iconClass} />
                    <span>Enviar al fondo</span>
                </MenuItem>
                
                <div className="h-px bg-slate-200 my-1" />
                
                <MenuItem onClick={() => handleAction(onDelete)} isDestructive>
                    <TrashIcon className={iconClass} />
                    <span>Eliminar</span>
                </MenuItem>
            </div>
        </div>
    );
};
