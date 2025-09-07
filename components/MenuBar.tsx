import React, { useState, useEffect, useRef } from 'react';
import { UndoIcon, RedoIcon, CopyIcon, ClipboardPasteIcon, ScissorsIcon, FileDownIcon, FileUpIcon, FileImageIcon, FileJsonIcon, PlusIcon, ChevronsUpIcon, ChevronsDownIcon, ArrowUpIcon, ArrowDownIcon, LockIcon, UnlockIcon, SaveIcon, GroupIcon, UngroupIcon, PrinterIcon, HistoryIcon, RulerIcon, CheckIcon } from './icons';
import { DesignElement, ElementType, RecentFile } from '../types';

interface MenuBarProps {
    onNew: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    onBringForward: () => void;
    onSendBackward: () => void;
    onBringToFront: () => void;
    onSendToBack: () => void;
    onToggleLock: () => void;
    onGroup: () => void;
    onUngroup: () => void;
    selectedElements: DesignElement[];
    recentFiles: RecentFile[];
    onLoadFromRecent: (file: RecentFile) => void;
    onToggleRulers: () => void;
    isRulersVisible: boolean;
}

const Menu: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleButtonClick = () => { setIsOpen(prev => !prev); };

    return (
        <div ref={menuRef} className="relative">
            <button onClick={handleButtonClick} className="px-3 py-1.5 text-sm rounded-md text-slate-700 hover:text-slate-900 focus:bg-slate-100 focus:outline-none">
                {label}
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1.5 z-[60]">
                    {React.Children.map(children, child =>
                        React.isValidElement(child) ? React.cloneElement(child, { closeMenu: () => setIsOpen(false) } as any) : child
                    )}
                </div>
            )}
        </div>
    );
};

const MenuItem: React.FC<{ closeMenu?: () => void; onClick?: () => void; children: React.ReactNode; shortcut?: string; disabled?: boolean; isFileInput?: boolean; fileAccept?: string; onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; onMouseEnter?: () => void; onMouseLeave?: () => void; isChecked?: boolean; }> = ({ closeMenu, onClick, children, shortcut, disabled = false, isFileInput = false, fileAccept, onFileChange, onMouseEnter, onMouseLeave, isChecked }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (disabled) return;
        if (isFileInput) { fileInputRef.current?.click(); } else if (onClick) { onClick(); }
        if (!isFileInput) closeMenu?.(); // Don't close for file input to allow selection
    };

    const content = (
         <span className={`flex justify-between items-center w-full px-2 py-1.5 text-sm rounded-md ${disabled ? 'text-slate-400' : 'text-slate-800 hover:bg-indigo-500 hover:text-white'}`}>
            <span className="flex items-center gap-3">
                <span className="w-4 h-4">{isChecked && <CheckIcon />}</span>
                {children}
            </span>
            {shortcut && <span className="text-xs text-slate-500">{shortcut.replace('⌘', 'Ctrl+')}</span>}
        </span>
    );
    
    return isFileInput ? (
        <label onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={handleClick}>
            <input type="file" ref={fileInputRef} onChange={(e) => {onFileChange?.(e); closeMenu?.();}} className="hidden" accept={fileAccept} />
            {content}
        </label>
    ) : (
        <button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={handleClick} disabled={disabled} className="w-full text-left">
           {content}
        </button>
    );
};

const SubMenu: React.FC<{ children: React.ReactNode, label: React.ReactNode, disabled?: boolean }> = ({ children, label, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => !disabled && setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            {label}
            {isOpen && (
                <div className="absolute left-full -top-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1.5 z-50">
                    {children}
                </div>
            )}
        </div>
    );
};

const MenuSeparator = () => <div className="h-px bg-slate-200 my-1.5" />;

export const MenuBar: React.FC<MenuBarProps> = (props) => {
    const { selectedElements, recentFiles } = props;
    const hasSelection = selectedElements.length > 0;
    const isSelectionLocked = hasSelection && selectedElements.every(el => el.isLocked);
    const canGroup = selectedElements.length > 1;
    const canUngroup = hasSelection && selectedElements.some(el => el.type === ElementType.Group);
    const iconClass = "w-4 h-4";

    return (
        <nav className="flex items-center gap-1">
            <Menu label="Archivo">
                <MenuItem onClick={props.onNew}><PlusIcon className={iconClass} /> Nuevo...</MenuItem>
                <SubMenu label={<MenuItem disabled={recentFiles.length === 0}><HistoryIcon className={iconClass}/> Recientes</MenuItem>} disabled={recentFiles.length === 0}>
                    {recentFiles.map(file => (
                        <MenuItem key={file.id} onClick={() => props.onLoadFromRecent(file)}>
                            <img src={file.preview} className="w-8 h-6 object-cover rounded-sm flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                        </MenuItem>
                    ))}
                </SubMenu>
                <MenuItem isFileInput onFileChange={props.onLoad} fileAccept=".json"><FileUpIcon className={iconClass} /> Cargar JSON...</MenuItem>
                <MenuItem isFileInput onFileChange={props.onImport} fileAccept="image/*"><FileImageIcon className={iconClass} /> Importar Imagen...</MenuItem>
                <MenuSeparator />
                <MenuItem onClick={props.onSave}><SaveIcon className={iconClass} /> Guardar</MenuItem>
                <MenuItem onClick={props.onSaveAs}><FileJsonIcon className={iconClass} /> Guardar como...</MenuItem>
                <MenuSeparator />
                <MenuItem onClick={props.onPrint}><PrinterIcon className={iconClass} /> Imprimir</MenuItem>
                <MenuSeparator />
                <MenuItem onClick={props.onExportSvg}><FileDownIcon className={iconClass} /> Exportar a SVG</MenuItem>
                <MenuItem onClick={props.onExportPng}><FileImageIcon className={iconClass} /> Exportar a PNG</MenuItem>
                <MenuItem onClick={props.onExportPdf}>Exportar a PDF</MenuItem>
            </Menu>
            <Menu label="Editar">
                <MenuItem onClick={props.onUndo} disabled={!props.canUndo} shortcut="⌘Z"><UndoIcon className={iconClass} /> Deshacer</MenuItem>
                <MenuItem onClick={props.onRedo} disabled={!props.canRedo} shortcut="⇧⌘Z"><RedoIcon className={iconClass} /> Rehacer</MenuItem>
                <MenuSeparator />
                <MenuItem onClick={props.onCut} disabled={!hasSelection || isSelectionLocked} shortcut="⌘X"><ScissorsIcon className={iconClass} /> Cortar</MenuItem>
                <MenuItem onClick={props.onCopy} disabled={!hasSelection} shortcut="⌘C"><CopyIcon className={iconClass} /> Copiar</MenuItem>
                <MenuItem onClick={props.onPaste} disabled={!props.canPaste} shortcut="⌘V"><ClipboardPasteIcon className={iconClass} /> Pegar</MenuItem>
                <MenuSeparator />
                <MenuItem onClick={props.onSelectAll} shortcut="⌘A">Seleccionar todo</MenuItem>
            </Menu>
             <Menu label="Objeto">
                 <MenuItem onClick={props.onGroup} disabled={!canGroup || isSelectionLocked} shortcut="⌘G"><GroupIcon className={iconClass} /> Agrupar</MenuItem>
                 <MenuItem onClick={props.onUngroup} disabled={!canUngroup || isSelectionLocked}><UngroupIcon className={iconClass} /> Desagrupar</MenuItem>
                 <MenuSeparator />
                 <MenuItem onClick={props.onBringForward} disabled={!hasSelection || isSelectionLocked}><ArrowUpIcon className={iconClass} /> Traer adelante</MenuItem>
                 <MenuItem onClick={props.onSendBackward} disabled={!hasSelection || isSelectionLocked}><ArrowDownIcon className={iconClass} /> Enviar atrás</MenuItem>
                 <MenuItem onClick={props.onBringToFront} disabled={!hasSelection || isSelectionLocked}><ChevronsUpIcon className={iconClass} /> Traer al frente</MenuItem>
                 <MenuItem onClick={props.onSendToBack} disabled={!hasSelection || isSelectionLocked}><ChevronsDownIcon className={iconClass} /> Enviar al fondo</MenuItem>
                 <MenuSeparator />
                 <MenuItem onClick={props.onToggleLock} disabled={!hasSelection}>
                    {isSelectionLocked ? <UnlockIcon className={iconClass} /> : <LockIcon className={iconClass} />}
                    {isSelectionLocked ? 'Desbloquear' : 'Bloquear'}
                 </MenuItem>
            </Menu>
            <Menu label="Ver">
                <MenuItem onClick={props.onToggleRulers} isChecked={props.isRulersVisible}>
                   <RulerIcon className={iconClass} />
                   <span>Mostrar Reglas y Guías</span>
                </MenuItem>
            </Menu>
        </nav>
    );
};