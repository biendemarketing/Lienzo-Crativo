
import React from 'react';
import { type Alignment } from '../types';
import { AlignLeftIcon, AlignCenterHorizontalIcon, AlignRightIcon, AlignTopIcon, AlignCenterVerticalIcon, AlignBottomIcon, DistributeHorizontalIcon, DistributeVerticalIcon } from './icons';

interface AlignmentPanelProps {
    onAlign: (alignment: Alignment) => void;
}

const AlignmentButton: React.FC<{ onClick: () => void; tip: string; children: React.ReactNode }> = ({ onClick, tip, children }) => (
    <div className="group relative flex justify-center">
        <button
            onClick={onClick}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            aria-label={tip}
        >
            {children}
        </button>
        <span className="pointer-events-none absolute bottom-full mb-2 scale-95 opacity-0 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 origin-bottom">
            {tip}
        </span>
    </div>
);

export const AlignmentPanel: React.FC<AlignmentPanelProps> = ({ onAlign }) => {
    const iconSize = "h-5 w-5";

    return (
        <div className="border-b border-gray-200 p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Alinear y Distribuir</h3>
            <div className="grid grid-cols-1 gap-y-2">
                <div className="flex items-center justify-between gap-1 bg-gray-50 p-1 rounded-lg border">
                    <AlignmentButton onClick={() => onAlign('left')} tip="Alinear a la Izquierda">
                        <AlignLeftIcon className={iconSize} />
                    </AlignmentButton>
                    <AlignmentButton onClick={() => onAlign('center-h')} tip="Alinear al Centro (Horizontal)">
                        <AlignCenterHorizontalIcon className={iconSize} />
                    </AlignmentButton>
                    <AlignmentButton onClick={() => onAlign('right')} tip="Alinear a la Derecha">
                        <AlignRightIcon className={iconSize} />
                    </AlignmentButton>
                    <div className="h-6 w-px bg-gray-200" />
                    <AlignmentButton onClick={() => onAlign('top')} tip="Alinear Arriba">
                        <AlignTopIcon className={iconSize} />
                    </AlignmentButton>
                    <AlignmentButton onClick={() => onAlign('center-v')} tip="Alinear al Centro (Vertical)">
                        <AlignCenterVerticalIcon className={iconSize} />
                    </AlignmentButton>
                    <AlignmentButton onClick={() => onAlign('bottom')} tip="Alinear Abajo">
                        <AlignBottomIcon className={iconSize} />
                    </AlignmentButton>
                </div>
                 <div className="flex items-center justify-around gap-1 bg-gray-50 p-1 rounded-lg border">
                     <AlignmentButton onClick={() => onAlign('distribute-h')} tip="Distribuir Horizontalmente">
                        <DistributeHorizontalIcon className={iconSize} />
                    </AlignmentButton>
                    <AlignmentButton onClick={() => onAlign('distribute-v')} tip="Distribuir Verticalmente">
                        <DistributeVerticalIcon className={iconSize} />
                    </AlignmentButton>
                </div>
            </div>
        </div>
    );
};
