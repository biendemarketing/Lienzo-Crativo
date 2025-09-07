
import React from 'react';
import { type DesignProject } from '../types';
import { XIcon } from 'lucide-react';

interface FileTabsProps {
    openDesigns: DesignProject[];
    activeDesignId: string | null;
    onSwitchDesign: (id: string) => void;
    onCloseDesign: (id: string) => void;
}

export const FileTabs: React.FC<FileTabsProps> = ({ openDesigns, activeDesignId, onSwitchDesign, onCloseDesign }) => {
    
    const handleCloseClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onCloseDesign(id);
    };

    return (
        <div className="flex-shrink-0 bg-slate-200 border-b border-slate-300 flex items-end">
            {openDesigns.map(design => (
                <button
                    key={design.id}
                    onClick={() => onSwitchDesign(design.id)}
                    className={`flex items-center gap-2 pl-4 pr-2 py-2 text-sm border-r border-slate-300 max-w-48 transition-colors ${
                        design.id === activeDesignId
                            ? 'bg-white text-slate-800 font-medium'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <span className="truncate" title={design.settings.name}>{design.settings.name}</span>
                    <span 
                      onClick={(e) => handleCloseClick(e, design.id)} 
                      className="p-1 rounded-full hover:bg-slate-300"
                    >
                        <XIcon className="h-3.5 w-3.5" />
                    </span>
                </button>
            ))}
        </div>
    );
};