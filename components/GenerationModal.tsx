
import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface GenerationModalProps {
    onClose: () => void;
    onGenerate: (prompt: string) => Promise<void>;
    isLoading: boolean;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({ onClose, onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
                            <h2 className="text-lg font-bold text-gray-800">Generar Diseño con IA</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Describe el diseño que quieres crear. Por ejemplo: "Una invitación para una fiesta de cumpleaños infantil con temática de dinosaurios" o "Un flyer de negocio moderno para una cafetería".
                        </p>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ej: Un post de Instagram anunciando una oferta de verano..."
                            rows={4}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                            disabled={isLoading || !prompt.trim()}
                        >
                            {isLoading ? 'Generando...' : 'Generar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};