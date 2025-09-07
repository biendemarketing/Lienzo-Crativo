
import React from 'react';

interface ConfirmCloseModalProps {
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export const ConfirmCloseModal: React.FC<ConfirmCloseModalProps> = ({ onClose, onSave, onDiscard }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-800">Guardar cambios</h2>
          <p className="text-sm text-slate-600 mt-2">
            El diseño actual tiene cambios sin guardar. ¿Quieres guardarlos antes de cerrar?
          </p>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md shadow-sm hover:bg-red-200"
          >
            No Guardar
          </button>
          <button
            type="submit"
            onClick={onSave}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};