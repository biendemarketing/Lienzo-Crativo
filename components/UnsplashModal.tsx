
import React from 'react';

interface UnsplashModalProps {
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

const exampleImages = Array.from({ length: 12 }, (_, i) => ({
    id: `unsplash_${i}`,
    url: `https://picsum.photos/seed/lib${i}/400/300`,
    alt: `Random image ${i}`
}));

export const UnsplashModal: React.FC<UnsplashModalProps> = ({ onClose, onSelectImage }) => {
    const handleSelect = (url: string) => {
        onSelectImage(url);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-slate-800">Biblioteca de Imágenes</h2>
                    <p className="text-sm text-slate-500 mt-1">Selecciona una imagen de alta calidad para tu diseño.</p>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {exampleImages.map(img => (
                            <div key={img.id} onClick={() => handleSelect(img.url)} className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover aspect-video" />
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