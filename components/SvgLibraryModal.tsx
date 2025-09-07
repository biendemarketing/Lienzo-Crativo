import React, { useState } from 'react';
import { PREDEFINED_SVGS } from '../constants';

interface SvgLibraryModalProps {
  onClose: () => void;
  onAddSvg: (svgContent: string) => void;
}

export const SvgLibraryModal: React.FC<SvgLibraryModalProps> = ({ onClose, onAddSvg }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSvgs = PREDEFINED_SVGS.filter(svg =>
        svg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (svgContent: string) => {
        onAddSvg(svgContent);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-slate-800">Biblioteca de Iconos SVG</h2>
                    <p className="text-sm text-slate-500 mt-1">Elige un icono para añadir a tu diseño.</p>
                     <input
                        type="text"
                        placeholder="Buscar iconos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full mt-4 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {filteredSvgs.map(svg => (
                            <div key={svg.name} onClick={() => handleSelect(svg.content)} className="cursor-pointer group flex flex-col items-center gap-2 rounded-lg p-2 text-center border border-transparent hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-16 h-16 p-3 flex items-center justify-center bg-slate-100 rounded-md" dangerouslySetInnerHTML={{ __html: svg.content }} />
                                <p className="text-xs text-slate-600 group-hover:text-indigo-600 truncate">{svg.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white px-6 py-4 flex justify-end rounded-b-lg border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
