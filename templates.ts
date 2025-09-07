
import { type DesignElement, ElementType, EllipseElement, ImageElement, LineElement, QrCodeElement, RectangleElement, SvgElement, TextElement, TriangleElement, StarElement, CanvasSettings, GroupElement } from './types';

export interface Template {
    name: string;
    settings: Omit<CanvasSettings, 'name' | 'artboards' | 'colorMode'> & { background: 'white' | 'black' | 'transparent' };
    elements: DesignElement[];
}

// FIX: Changed TemplateElement to be a Partial of DesignElement to correctly type template objects with optional properties.
type TemplateElement = Partial<DesignElement>;


const addDefaults = (elements: TemplateElement[]): DesignElement[] => {
    return elements.map(el => {
        const fullEl = el as any;
        const result: any = {
            ...fullEl,
            opacity: fullEl.opacity ?? 1,
            isVisible: fullEl.isVisible ?? true,
            isLocked: fullEl.isLocked ?? false,
            shadow: fullEl.shadow ?? { enabled: false, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4 },
        };

        if ('fill' in fullEl) {
             result.fill = fullEl.fill;
        }
        
        if (el.type === ElementType.Group) {
            result.children = addDefaults(fullEl.children);
        }

        if (el.type === ElementType.Text) {
            result.textAlign = fullEl.textAlign ?? 'left';
            if (!result.fill) result.fill = { type: 'solid', color: '#000000' };
        }

        if (el.type === ElementType.Rectangle || el.type === ElementType.Ellipse || el.type === ElementType.Triangle || el.type === ElementType.Star) {
            if (!result.fill) result.fill = { type: 'solid', color: '#cccccc' };
        }

        if (el.type === ElementType.Rectangle || el.type === ElementType.Ellipse) {
            result.strokeColor = fullEl.strokeColor ?? '#000000';
            result.strokeWidth = fullEl.strokeWidth ?? 0;
            result.strokeStyle = fullEl.strokeStyle ?? 'solid';
            result.backdropFilter = fullEl.backdropFilter ?? { enabled: false, blur: 10, brightness: 1, contrast: 1 };
        }
        
        if (el.type === ElementType.Rectangle || el.type === ElementType.Image) {
            result.borderRadius = fullEl.borderRadius ?? 0;
        }

        if (el.type === ElementType.Star) {
            result.points = fullEl.points ?? 5;
            result.innerRadius = fullEl.innerRadius ?? 0.5;
        }
        
        return result as DesignElement;
    });
};


export const TEMPLATES: Template[] = [
    {
        name: 'Tarjeta de Presentación',
        settings: { width: 3.5, height: 2, unit: 'in', dpi: 300, orientation: 'landscape', background: 'white' },
        elements: addDefaults([
            { id: 'bg', type: ElementType.Rectangle, x: 0, y: 0, width: 1050, height: 600, rotation: 0, fill: { type: 'solid', color: '#ffffff'} },
            { id: 'accent', type: ElementType.Rectangle, x: 50, y: 250, width: 300, height: 100, rotation: 0, fill: { type: 'solid', color: '#1e3a8a'} },
            { id: 'name', type: ElementType.Text, content: 'Tu Nombre', x: 400, y: 180, width: 550, height: 50, rotation: 0, fontSize: 48, fontWeight: 700, fill: { type: 'solid', color: '#111827'}, fontFamily: 'Helvetica' },
            { id: 'title', type: ElementType.Text, content: 'Diseñador Gráfico', x: 400, y: 240, width: 550, height: 30, rotation: 0, fontSize: 24, fontWeight: 400, fill: { type: 'solid', color: '#4b5563'}, fontFamily: 'Helvetica' },
            { id: 'divider', type: ElementType.Rectangle, x: 400, y: 285, width: 550, height: 2, rotation: 0, fill: { type: 'solid', color: '#e5e7eb'} },
            { id: 'contact', type: ElementType.Text, content: '+123 456 7890 | hola@example.com | tuweb.com', x: 400, y: 310, width: 550, height: 20, rotation: 0, fontSize: 16, fontWeight: 400, fill: { type: 'solid', color: '#4b5563'}, fontFamily: 'Helvetica' },
        ])
    },
    {
        name: 'Post de Red Social',
        settings: { width: 1080, height: 1080, unit: 'px', dpi: 72, orientation: 'portrait', background: 'white' },
        elements: addDefaults([
            { id: 'bg', type: ElementType.Rectangle, x: 0, y: 0, width: 1080, height: 1080, rotation: 0, fill: { type: 'solid', color: '#f3f4f6'} },
            { id: 'image', type: ElementType.Image, src: 'https://picsum.photos/seed/social/1080/720', x: 0, y: 0, width: 1080, height: 720, rotation: 0 },
            { id: 'card', type: ElementType.Rectangle, x: 80, y: 620, width: 920, height: 360, rotation: 0, fill: { type: 'solid', color: '#ffffff'}, shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 4, blur: 12 }, borderRadius: 16 },
            { id: 'headline', type: ElementType.Text, content: 'GRAN VENTA DE VERANO', x: 120, y: 660, width: 840, height: 120, rotation: 0, fontSize: 96, fontWeight: 700, fill: { type: 'solid', color: '#dc2626'}, fontFamily: 'Arial', textAlign: 'center' },
            { id: 'subline', type: ElementType.Text, content: '50% de descuento en todos los productos. ¡No te lo pierdas!', x: 120, y: 820, width: 840, height: 80, rotation: 0, fontSize: 36, fontWeight: 400, fill: { type: 'solid', color: '#1f2937'}, fontFamily: 'Arial', textAlign: 'center' },
        ])
    },
    {
        name: 'Invitación a Evento',
        settings: { width: 5, height: 7, unit: 'in', dpi: 300, orientation: 'portrait', background: 'white' },
        elements: addDefaults([
            { id: 'bg-image', type: ElementType.Image, src: 'https://picsum.photos/seed/party/1500/2100', x: 0, y: 0, width: 1500, height: 2100, rotation: 0 },
            { id: 'overlay', type: ElementType.Rectangle, x: 150, y: 300, width: 1200, height: 1500, rotation: 0, fill: { type: 'solid', color: 'rgba(20, 20, 20, 0.2)' }, borderRadius: 16, strokeWidth: 3, strokeColor: 'rgba(255,255,255,0.3)', backdropFilter: { enabled: true, blur: 12, brightness: 1.1, contrast: 1 } },
            { id: 'main-title', type: ElementType.Text, content: '¡Estás invitado!', x: 200, y: 500, width: 1100, height: 150, rotation: 0, fontSize: 144, fontWeight: 700, fill: { type: 'solid', color: '#ffffff' }, fontFamily: 'Georgia', shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 4 }, textAlign: 'center' },
            { id: 'subtitle', type: ElementType.Text, content: 'A la celebración de nuestro aniversario', x: 200, y: 700, width: 1100, height: 80, rotation: 0, fontSize: 56, fontWeight: 400, fill: { type: 'solid', color: '#e5e7eb' }, fontFamily: 'Georgia', textAlign: 'center' },
            { id: 'details', type: ElementType.Text, content: 'Sábado, 25 de Diciembre | 8:00 PM', x: 200, y: 1200, width: 1100, height: 60, rotation: 0, fontSize: 48, fontWeight: 400, fill: { type: 'solid', color: '#e5e7eb' }, fontFamily: 'Georgia', textAlign: 'center' },
        ])
    },
    {
        name: 'Currículum Vitae',
        settings: { width: 210, height: 297, unit: 'mm', dpi: 300, orientation: 'portrait', background: 'white' },
        elements: addDefaults([
            { id: 'sidebar', type: ElementType.Rectangle, x: 0, y: 0, width: 800, height: 3508, rotation: 0, fill: { type: 'solid', color: '#2c3e50'} },
            { id: 'avatar', type: ElementType.Image, src: 'https://picsum.photos/seed/cv-avatar/400/400', x: 200, y: 150, width: 400, height: 400, rotation: 0, borderRadius: 9999 },
            { id: 'name-cv', type: ElementType.Text, content: 'JANE DOE', x: 50, y: 600, width: 700, height: 80, rotation: 0, fontSize: 80, fontWeight: 700, fill: { type: 'solid', color: '#ffffff'}, fontFamily: 'Helvetica', textAlign: 'center' },
            { id: 'title-cv', type: ElementType.Text, content: 'FRONT-END DEVELOPER', x: 50, y: 700, width: 700, height: 30, rotation: 0, fontSize: 30, fontWeight: 400, fill: { type: 'solid', color: '#ecf0f1'}, fontFamily: 'Helvetica', textAlign: 'center' },
            { id: 'contact-title', type: ElementType.Text, content: 'CONTACTO', x: 100, y: 1000, width: 600, height: 40, rotation: 0, fontSize: 40, fontWeight: 700, fill: { type: 'solid', color: '#ffffff'}, fontFamily: 'Helvetica' },
            { id: 'contact-info', type: ElementType.Text, content: '123 456 789\njane.doe@email.com\nlinkedin.com/in/janedoe\nportfolio.com', x: 100, y: 1080, width: 600, height: 200, rotation: 0, fontSize: 24, fontWeight: 400, fill: { type: 'solid', color: '#ecf0f1'}, fontFamily: 'Helvetica' },
            { id: 'main-content', type: ElementType.Rectangle, x: 800, y: 0, width: 1684, height: 3508, rotation: 0, fill: { type: 'solid', color: '#ecf0f1'} },
            { id: 'experience-title', type: ElementType.Text, content: 'EXPERIENCIA', x: 950, y: 200, width: 1200, height: 60, rotation: 0, fontSize: 60, fontWeight: 700, fill: { type: 'solid', color: '#2c3e50'}, fontFamily: 'Helvetica' },
            { id: 'job1', type: ElementType.Text, content: 'Senior Developer | Tech Company | 2020 - Present\n- Lideré el desarrollo de la nueva plataforma...\n- Mejoré el rendimiento en un 30%...', x: 950, y: 300, width: 1200, height: 300, rotation: 0, fontSize: 28, fontWeight: 400, fill: { type: 'solid', color: '#34495e'}, fontFamily: 'Helvetica' },
            { id: 'education-title', type: ElementType.Text, content: 'EDUCACIÓN', x: 950, y: 800, width: 1200, height: 60, rotation: 0, fontSize: 60, fontWeight: 700, fill: { type: 'solid', color: '#2c3e50'}, fontFamily: 'Helvetica' },
            { id: 'edu1', type: ElementType.Text, content: 'Grado en Ingeniería Informática | Universidad de Tecnología | 2014 - 2018', x: 950, y: 900, width: 1200, height: 200, rotation: 0, fontSize: 28, fontWeight: 400, fill: { type: 'solid', color: '#34495e'}, fontFamily: 'Helvetica' },
        ])
    },
    {
        name: 'Menú de Restaurante',
        settings: { width: 8.5, height: 11, unit: 'in', dpi: 300, orientation: 'portrait', background: 'white' },
        elements: addDefaults([
            { id: 'bg-menu', type: ElementType.Image, src: 'https://picsum.photos/seed/menu-bg/2550/3300', opacity: 0.1, x: 0, y: 0, width: 2550, height: 3300, rotation: 0 },
            { id: 'title-menu', type: ElementType.Text, content: 'LA BUENA MESA', x: 200, y: 200, width: 2150, height: 200, rotation: 0, fontSize: 180, fontWeight: 700, fill: { type: 'solid', color: '#333'}, fontFamily: 'Georgia', textAlign: 'center' },
            { id: 'subtitle-menu', type: ElementType.Text, content: 'COCINA DE AUTOR', x: 200, y: 400, width: 2150, height: 60, rotation: 0, fontSize: 60, fontWeight: 400, fill: { type: 'solid', color: '#555'}, fontFamily: 'Georgia', textAlign: 'center' },
            { id: 'starters-title', type: ElementType.Text, content: 'Entrantes', x: 300, y: 700, width: 800, height: 80, rotation: 0, fontSize: 80, fontWeight: 700, fill: { type: 'solid', color: '#a0522d'}, fontFamily: 'Georgia' },
            { id: 'item1', type: ElementType.Text, content: 'Ensalada César con Pollo Crujiente.................$12', x: 300, y: 820, width: 1950, height: 40, rotation: 0, fontSize: 36, fontWeight: 400, fill: { type: 'solid', color: '#333'}, fontFamily: 'Georgia' },
            { id: 'item2', type: ElementType.Text, content: 'Croquetas de Jamón Ibérico...........................$10', x: 300, y: 880, width: 1950, height: 40, rotation: 0, fontSize: 36, fontWeight: 400, fill: { type: 'solid', color: '#333'}, fontFamily: 'Georgia' },
            { id: 'mains-title', type: ElementType.Text, content: 'Platos Principales', x: 300, y: 1200, width: 800, height: 80, rotation: 0, fontSize: 80, fontWeight: 700, fill: { type: 'solid', color: '#a0522d'}, fontFamily: 'Georgia' },
            { id: 'item3', type: ElementType.Text, content: 'Solomillo de Ternera con Foie........................$25', x: 300, y: 1320, width: 1950, height: 40, rotation: 0, fontSize: 36, fontWeight: 400, fill: { type: 'solid', color: '#333'}, fontFamily: 'Georgia' },
            { id: 'item4', type: ElementType.Text, content: 'Lubina a la Sal con Verduras de Temporada....$22', x: 300, y: 1380, width: 1950, height: 40, rotation: 0, fontSize: 36, fontWeight: 400, fill: { type: 'solid', color: '#333'}, fontFamily: 'Georgia' },
        ])
    }
];
