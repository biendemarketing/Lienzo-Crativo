
export const pxToIn = (px: number, dpi: number) => px / dpi;
export const inToPx = (inches: number, dpi: number) => inches * dpi;
export const pxToMm = (px: number, dpi: number) => (px / dpi) * 25.4;
export const mmToPx = (mm: number, dpi: number) => (mm / 25.4) * dpi;
