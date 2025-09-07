import { LinearGradientFill, TextStylePreset, ElementType, TextElement } from './types';

export const GRADIENT_PRESETS: Omit<LinearGradientFill, 'type'>[] = [
    {
        angle: 90,
        stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fad0c4', position: 1 }]
    },
    {
        angle: 90,
        stops: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 1 }]
    },
    {
        angle: 90,
        stops: [{ color: '#84fab0', position: 0 }, { color: '#8fd3f4', position: 1 }]
    },
    {
        angle: 90,
        stops: [{ color: '#fccb90', position: 0 }, { color: '#d57eeb', position: 1 }]
    },
    {
        angle: 90,
        stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 1 }]
    },
     { // Atardecer
        angle: 120,
        stops: [{ color: '#ff7e5f', position: 0 }, { color: '#feb47b', position: 1 }]
    },
    { // Océano Profundo
        angle: 45,
        stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 1 }]
    },
    { // Neón Vibrante
        angle: 60,
        stops: [{ color: '#c0392b', position: 0 }, { color: '#8e44ad', position: 1 }]
    },
    { // Verde Menta
        angle: 135,
        stops: [{ color: '#96e6a1', position: 0 }, { color: '#d4fc79', position: 1 }]
    },
    { // Suave Gris
        angle: 90,
        stops: [{ color: '#bdc3c7', position: 0 }, { color: '#2c3e50', position: 1 }]
    },
    { // Fuego
        angle: 45,
        stops: [{ color: '#f09819', position: 0 }, { color: '#edde5d', position: 0.5 }, { color: '#ff512f', position: 1 }]
    },
    { // Galaxia
        angle: 120,
        stops: [{ color: '#2c3e50', position: 0 }, { color: '#3498db', position: 1 }]
    },
];

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
    {
        name: 'Título Principal',
        style: {
            type: ElementType.Text,
            content: 'Título Principal',
            fontSize: 72,
            fontWeight: 700,
            fontFamily: 'Helvetica, sans-serif',
            fill: { type: 'solid', color: '#111827' },
            width: 500,
            height: 80,
        }
    },
    {
        name: 'Subtítulo',
        style: {
            type: ElementType.Text,
            content: 'Un subtítulo interesante',
            fontSize: 36,
            fontWeight: 500,
            fontFamily: 'Helvetica, sans-serif',
            fill: { type: 'solid', color: '#4b5563' },
            width: 400,
            height: 45,
        }
    },
    {
        name: 'Párrafo de Cuerpo',
        style: {
            type: ElementType.Text,
            content: 'Este es un párrafo de texto de cuerpo. Es ideal para descripciones largas y contenido principal. Puedes editarlo fácilmente.',
            fontSize: 16,
            fontWeight: 400,
            fontFamily: 'Georgia, serif',
            fill: { type: 'solid', color: '#374151' },
            width: 350,
            height: 100,
        }
    },
     {
        name: 'Texto con Contorno',
        style: {
            type: ElementType.Text,
            content: 'Texto con Contorno',
            fontSize: 60,
            fontWeight: 700,
            fontFamily: 'Arial, sans-serif',
            fill: { type: 'solid', color: '#ffffff' },
            strokeColor: '#374151',
            strokeWidth: 2,
            width: 450,
            height: 70,
        }
    },
    {
        name: 'Texto Degradado',
        style: {
            type: ElementType.Text,
            content: 'Texto Degradado',
            fontSize: 60,
            fontWeight: 700,
            fontFamily: 'Helvetica, sans-serif',
            fill: { type: 'linear', angle: 60, stops: [{color: '#c0392b', position: 0}, {color: '#8e44ad', position: 1}]},
            width: 450,
            height: 70,
        }
    }
];