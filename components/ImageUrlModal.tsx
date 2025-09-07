
import React, { useState } from 'react';

interface ImageUrlModalProps {
  onClose: () => void;
  onAddImage: (url: string) => void;
}

export const ImageUrlModal: React.FC<ImageUrlModalProps> = ({ onClose, onAddImage }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onAddImage(url.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-800">Añadir Imagen desde URL</h2>
                    <p className="text-sm text-slate-600 my-2">Pega la URL de una imagen para añadirla al lienzo.</p>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        autoFocus
                    />
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300" disabled={!url.trim()}>Añadir</button>
                </div>
            </form>
        </div>
    );
};