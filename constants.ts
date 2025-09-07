import { type DesignElement, ElementType, CanvasSettings, BrushPreset } from './types';

export const SNAP_THRESHOLD = 5;

export const BLANK_CANVAS_ELEMENTS: DesignElement[] = [];

export const INITIAL_CANVAS_SETTINGS: CanvasSettings = {
  name: 'Diseño sin título',
  width: 800,
  height: 600,
  unit: 'px',
  dpi: 72,
  orientation: 'landscape',
  colorMode: 'rgb',
  background: 'white',
  artboards: 1,
  artboardLayout: 'grid',
  artboardSpacing: 50,
};

export const PREDEFINED_SIZES: (Omit<CanvasSettings, 'name' | 'artboards' | 'colorMode' | 'artboardLayout' | 'artboardSpacing'> & {name: string})[] = [
    { name: 'Post de Instagram', width: 1080, height: 1080, unit: 'px', dpi: 72, orientation: 'portrait', background: 'white' },
    { name: 'Historia de Instagram', width: 1080, height: 1920, unit: 'px', dpi: 72, orientation: 'portrait', background: 'white' },
    { name: 'Post de Facebook', width: 940, height: 788, unit: 'px', dpi: 72, orientation: 'landscape', background: 'white' },
    { name: 'Post de Twitter/X', width: 1024, height: 512, unit: 'px', dpi: 72, orientation: 'landscape', background: 'white' },
    { name: 'A4 (Impresión)', width: 210, height: 297, unit: 'mm', dpi: 300, orientation: 'portrait', background: 'white' },
    { name: 'Carta (Impresión)', width: 8.5, height: 11, unit: 'in', dpi: 300, orientation: 'portrait', background: 'white' },
];

export const PREDEFINED_SVGS: { name: string, content: string }[] = [
    { name: 'Heart', content: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
    { name: 'Star', content: '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' },
    { name: 'Check Circle', content: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' },
    { name: 'Bell', content: '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>' },
    { name: 'Camera', content: '<svg viewBox="0 0 24 24"><path d="M9.4 10.5h5.2v5H9.4z"/><path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12z"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>' },
    { name: 'File', content: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' },
];

export const BRUSH_PRESETS: BrushPreset[] = [
    { id: 'soft-round', name: 'Circular Difuso', preview: `<svg viewBox="0 0 100 100"><defs><radialGradient id="g-soft"><stop offset="0%" stop-color="black" /><stop offset="100%" stop-color="black" stop-opacity="0" /></radialGradient></defs><circle cx="50" cy="50" r="45" fill="url(#g-soft)" /></svg>`, settings: { size: 40, hardness: 0, opacity: 1 }},
    { id: 'hard-round', name: 'Circular Definido', preview: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="black" /></svg>`, settings: { size: 20, hardness: 1, opacity: 1 }},
    { id: 'soft-med', name: 'Difuso Medio', preview: `<svg viewBox="0 0 100 100"><defs><radialGradient id="g-med"><stop offset="50%" stop-color="black" /><stop offset="100%" stop-color="black" stop-opacity="0" /></radialGradient></defs><circle cx="50" cy="50" r="45" fill="url(#g-med)" /></svg>`, settings: { size: 30, hardness: 0.5, opacity: 1 }},
    { id: 'hard-small', name: 'Definido Pequeño', preview: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="black" /></svg>`, settings: { size: 10, hardness: 1, opacity: 1 }},
];


export const INITIAL_ELEMENTS: DesignElement[] = [
  {
    id: '1',
    type: ElementType.Rectangle,
    x: 50,
    y: 50,
    width: 700,
    height: 500,
    rotation: 0,
    fill: { type: 'solid', color: '#f0f4f8' },
    opacity: 1,
    isVisible: true,
    strokeColor: '#000000',
    strokeWidth: 0,
    strokeStyle: 'solid',
    borderRadius: 0,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4 },
    backdropFilter: { enabled: false, blur: 10, brightness: 1, contrast: 1 },
  },
  {
    id: '2',
    type: ElementType.Text,
    x: 100,
    y: 100,
    width: 600,
    height: 100,
    rotation: 0,
    content: 'Bienvenido a Lienzo Creativo',
    fontSize: 48,
    fill: { type: 'solid', color: '#1e293b' },
    fontWeight: 700,
    fontFamily: 'Helvetica, sans-serif',
    textAlign: 'left',
    opacity: 1,
    isVisible: true,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4 },
  },
  {
    id: '3',
    type: ElementType.Text,
    x: 100,
    y: 180,
    width: 600,
    height: 50,
    rotation: 0,
    content: 'Tu herramienta de diseño intuitiva. Arrastra un elemento para moverlo.',
    fontSize: 20,
    fill: { type: 'solid', color: '#475569' },
    fontWeight: 400,
    fontFamily: 'Helvetica, sans-serif',
    textAlign: 'left',
    opacity: 1,
    isVisible: true,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4 },
  },
    {
    id: '4',
    type: ElementType.Image,
    x: 300,
    y: 280,
    width: 200,
    height: 200,
    rotation: 0,
    src: 'https://picsum.photos/seed/design/200/200',
    opacity: 1,
    isVisible: true,
    borderRadius: 0,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4 },
  }
];
