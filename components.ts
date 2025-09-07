
import { GroupElement, ElementType, SocialIconComponent, DesignElement } from './types';

const createSocialIcon = (name: SocialIconComponent['name'], svgContent: string): SocialIconComponent => ({
    id: '',
    name,
    type: ElementType.Group,
    x: 50, y: 50, width: 48, height: 48,
    rotation: 0,
    children: [
        {
            id: 'social-bg', type: ElementType.Ellipse,
            x: 0, y: 0, width: 48, height: 48, rotation: 0,
            fill: { type: 'solid' as const, color: '#e5e7eb' },
        },
        {
            id: 'social-icon', type: ElementType.Svg,
            x: 12, y: 12, width: 24, height: 24, rotation: 0,
            svgContent,
            fill: { type: 'solid' as const, color: '#1f2937' },
        }
    ]
});

export const PREBUILT_COMPONENTS: (GroupElement | SocialIconComponent)[] = [
    {
        id: 'hero-banner-1', name: 'Banner Héroe E-Scooter', type: ElementType.Group,
        x: 0, y: 0, width: 1200, height: 400, rotation: 0,
        children: [
            { id: 'hb1-img', type: ElementType.Image, src: 'https://images.pexels.com/photos/17693995/pexels-photo-17693995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', x: 0, y: 0, width: 1200, height: 400, rotation: 0, opacity: 0.8 },
            { id: 'hb1-overlay', type: ElementType.Rectangle, x: 0, y: 0, width: 1200, height: 400, rotation: 0, fill: { type: 'solid' as const, color: 'rgba(0, 20, 0, 0.6)' } },
            { id: 'hb1-title', type: ElementType.Text, content: 'Glow Your Ride With Energetic E-Scooters', x: 100, y: 120, width: 1000, height: 80, rotation: 0, fontSize: 64, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' }, textAlign: 'center' },
            { id: 'hb1-subtitle', type: ElementType.Text, content: 'Empower your ride with strong Electric Bikes from us', x: 100, y: 210, width: 1000, height: 30, rotation: 0, fontSize: 18, fontWeight: 400, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#E5E7EB' }, textAlign: 'center' },
            { id: 'hb1-btn-bg', type: ElementType.Rectangle, x: 525, y: 270, width: 150, height: 50, rotation: 0, fill: { type: 'solid' as const, color: '#34D399' }, borderRadius: 25 },
            { id: 'hb1-btn-txt', type: ElementType.Text, content: 'Read more', x: 525, y: 270, width: 150, height: 50, rotation: 0, fontSize: 16, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#1F2937' }, textAlign: 'center' },
        ]
    },
    {
        id: 'features-block', name: 'Bloque de Características', type: ElementType.Group,
        x: 0, y: 0, width: 1100, height: 180, rotation: 0,
        children: [
            ...[
                { icon: '<svg viewBox="0 0 24 24"><path d="M14 16.5V13H8V7H4l-3 4h3v2.5H1v4h3V20l3-4H4v-2.5h10zm-3-13L8 0v3h6v4h4l3-4h-3V0l-3 3.5zM22 8l-3 4h3v4h-3l3 4v-4h-4V8h4z"/></svg>', title: 'Fastest Delivery', text: 'Delivery ordered within 24 hours' },
                { icon: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>', title: 'Secure Payments', text: 'Payment protected by billdesk pro' },
                { icon: '<svg viewBox="0 0 24 24"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>', title: '24x7 Support', text: 'Customer service active 24x7 all-over' },
                { icon: '<svg viewBox="0 0 24 24"><path d="M21.9 10.2c-.3-.8-1.1-1.2-1.9-1.2H16V3c0-.6-.4-1-1-1H9c-.6 0-1 .4-1 1v6H4c-.8 0-1.6.4-1.9 1.2-.4.8-.3 1.7.2 2.4l5 6c.3.4.8.6 1.2.6h9c.6 0 1.1-.3 1.4-.8.3-.5.3-1.1.1-1.6l-2-6.5zM5.3 11h3.7v8L5.6 12c-.1-.1-.2-.3-.2-.4 0-.1.1-.3.1-.4.1-.1.2-.2.3-.2z"/></svg>', title: 'Trustworthy Service', text: 'Trustworthy and reliable service provider' }
            ].flatMap((feature, i): DesignElement[] => ([
                { id: `fb${i}-bg`, type: ElementType.Rectangle, x: i * 280, y: 0, width: 250, height: 180, rotation: 0, fill: { type: 'solid' as const, color: '#1F2937' }, borderRadius: 12 },
                { id: `fb${i}-icon`, type: ElementType.Svg, svgContent: feature.icon, x: i * 280 + 20, y: 20, width: 32, height: 32, rotation: 0, fill: { type: 'solid' as const, color: '#34D399' } },
                { id: `fb${i}-title`, type: ElementType.Text, content: feature.title, x: i * 280 + 20, y: 70, width: 210, height: 24, rotation: 0, fontSize: 20, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' } },
                { id: `fb${i}-text`, type: ElementType.Text, content: feature.text, x: i * 280 + 20, y: 110, width: 210, height: 40, rotation: 0, fontSize: 14, fontWeight: 400, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#9CA3AF' } },
            ]))
        ]
    },
    {
        id: 'product-card', name: 'Tarjeta de Producto Segway', type: ElementType.Group,
        x: 0, y: 0, width: 400, height: 600, rotation: 0,
        children: [
            { id: 'pc-bg', type: ElementType.Rectangle, x: 0, y: 0, width: 400, height: 600, rotation: 0, fill: { type: 'solid' as const, color: '#1F2937' }, borderRadius: 16 },
            { id: 'pc-img', type: ElementType.Image, src: 'https://www.segway.com/images/prod/d3b64165-4f46-4c4c-8e69-373981882d96.png', x: 20, y: 20, width: 360, height: 360, rotation: 0 },
            { id: 'pc-tag', type: ElementType.Rectangle, x: 20, y: 20, width: 80, height: 30, rotation: 0, fill: { type: 'solid' as const, color: '#34D399' }, borderRadius: 15 },
            { id: 'pc-tag-txt', type: ElementType.Text, content: '28% OFF', x: 20, y: 20, width: 80, height: 30, rotation: 0, fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#111827' }, textAlign: 'center' },
            { id: 'pc-title', type: ElementType.Text, content: 'Segway - Ninebot Z40X12', x: 20, y: 400, width: 360, height: 30, rotation: 0, fontSize: 24, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' } },
            { id: 'pc-subtitle', type: ElementType.Text, content: 'Efficiency Meets Style', x: 20, y: 440, width: 360, height: 20, rotation: 0, fontSize: 16, fontWeight: 400, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#9CA3AF' } },
            ...[0, 1, 2].map((i): DesignElement => ({ id: `pc-color-${i}`, type: ElementType.Ellipse, x: 20 + i * 30, y: 470, width: 24, height: 24, rotation: 0, fill: { type: 'solid' as const, color: '#000000' }, strokeWidth: 2, strokeColor: i === 0 ? '#34D399' : '#4B5563' })),
            ...[
                { icon: '<svg viewBox="0 0 24 24"><path d="M13 2v8h4l-5 12-5-12h4V2z"/></svg>', title: 'Duration', text: '8.50 hrs' },
                { icon: '<svg viewBox="0 0 24 24"><path d="M13 2v8h4l-5 12-5-12h4V2z"/></svg>', title: 'Range', text: '126 km' },
                { icon: '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>', title: 'Battery', text: '77 kWh' }
            ].flatMap((stat, i): DesignElement[] => ([
                { id: `pc-stat${i}-icon`, type: ElementType.Svg, svgContent: stat.icon, x: 20 + i * 130, y: 520, width: 24, height: 24, rotation: 0, fill: { type: 'solid' as const, color: '#34D399' } },
                { id: `pc-stat${i}-title`, type: ElementType.Text, content: stat.title, x: 50 + i * 130, y: 520, width: 80, height: 16, rotation: 0, fontSize: 12, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#9CA3AF' } },
                { id: `pc-stat${i}-text`, type: ElementType.Text, content: stat.text, x: 50 + i * 130, y: 536, width: 80, height: 20, rotation: 0, fontSize: 14, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' } },
            ]))
        ]
    },
    {
        id: '', name: 'Botón Primario y Secundario', type: ElementType.Group,
        x: 0, y: 0, width: 300, height: 50, rotation: 0,
        children: [
            { id: 'btn1-bg', type: ElementType.Rectangle, x: 0, y: 0, width: 140, height: 50, rotation: 0, fill: { type: 'solid' as const, color: '#34D399' }, borderRadius: 25 },
            { id: 'btn1-txt', type: ElementType.Text, content: 'Buy now', x: 0, y: 0, width: 140, height: 50, rotation: 0, fontSize: 16, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#111827' }, textAlign: 'center' },
            { id: 'btn2-bg', type: ElementType.Rectangle, x: 160, y: 0, width: 140, height: 50, rotation: 0, fill: { type: 'solid' as const, color: '#FFFFFF' }, borderRadius: 25 },
            { id: 'btn2-txt', type: ElementType.Text, content: 'View shop', x: 160, y: 0, width: 140, height: 50, rotation: 0, fontSize: 16, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#111827' }, textAlign: 'center' },
        ]
    },
    {
        id: '', name: 'Banner Nuevos Arribos', type: ElementType.Group,
        x: 0, y: 0, width: 800, height: 400, rotation: 0,
        children: [
            { id: 'na-img', type: ElementType.Image, src: 'https://images.pexels.com/photos/17693988/pexels-photo-17693988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', x: 0, y: 0, width: 800, height: 400, rotation: 0 },
            { id: 'na-overlay', type: ElementType.Rectangle, x: 0, y: 0, width: 800, height: 400, rotation: 0, fill: { type: 'linear', angle: 90, stops: [{ color: 'rgba(0,0,0,0.8)', position: 0 }, { color: 'rgba(0,0,0,0)', position: 1 }] } },
            { id: 'na-title', type: ElementType.Text, content: 'New\nArrivals', x: 50, y: 100, width: 300, height: 160, rotation: 0, fontSize: 72, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' } },
            { id: 'na-subtitle', type: ElementType.Text, content: 'Check out our new arrivals here', x: 50, y: 270, width: 400, height: 20, rotation: 0, fontSize: 16, fontWeight: 400, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#E5E7EB' } },
            { id: 'na-btn-bg', type: ElementType.Rectangle, x: 50, y: 310, width: 160, height: 50, rotation: 0, fill: { type: 'solid' as const, color: '#34D399' }, borderRadius: 25 },
            { id: 'na-btn-txt', type: ElementType.Text, content: 'Book today', x: 50, y: 310, width: 160, height: 50, rotation: 0, fontSize: 16, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#111827' }, textAlign: 'center' },
        ]
    },
    {
        id: '', name: 'Tarjeta de Precios', type: ElementType.Group,
        x: 0, y: 0, width: 350, height: 450, rotation: 0,
        children: [
            { id: 'pr-bg', type: ElementType.Rectangle, x: 0, y: 0, width: 350, height: 450, rotation: 0, fill: { type: 'solid' as const, color: '#FFFFFF' }, borderRadius: 12, strokeWidth: 2, strokeColor: '#1F2937' },
            { id: 'pr-title', type: ElementType.Text, content: 'Descargas ilimitadas desde 16,50 US$/mes', x: 25, y: 40, width: 300, height: 70, rotation: 0, fontSize: 24, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#111827' } },
            ...[
                '23+ millones de recursos y plantillas premium',
                'Pila de IA completa: generación de vídeo, imagen y audio',
                'Licencia comercial de por vida',
                'Cancelación fácil'
            ].flatMap((item, i): DesignElement[] => ([
                { id: `pr-item${i}-icon`, type: ElementType.Svg, svgContent: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', x: 30, y: 140 + i * 50, width: 24, height: 24, rotation: 0, fill: { type: 'solid' as const, color: '#111827' } },
                { id: `pr-item${i}-text`, type: ElementType.Text, content: item, x: 65, y: 140 + i * 50, width: 260, height: 40, rotation: 0, fontSize: 16, fontWeight: 500, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#374151' } },
            ])),
            { id: 'pr-btn-bg', type: ElementType.Rectangle, x: 25, y: 360, width: 300, height: 50, rotation: 0, fill: { type: 'solid' as const, color: '#84CC16' }, borderRadius: 8 },
            { id: 'pr-btn-txt', type: ElementType.Text, content: 'Suscríbete para descargar', x: 25, y: 360, width: 300, height: 50, rotation: 0, fontSize: 16, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#111827' }, textAlign: 'center' },
        ]
    },
    {
        id: '', name: 'Tarjeta Styled Text', type: ElementType.Group,
        x: 0, y: 0, width: 380, height: 420, rotation: 0,
        children: [
            { id: 'st-bg', type: ElementType.Rectangle, x: 0, y: 0, width: 380, height: 420, rotation: 0, fill: { type: 'solid' as const, color: '#111827' }, borderRadius: 24 },
            { id: 'st-title-img', type: ElementType.Text, content: 'Aa', x: 40, y: 40, width: 120, height: 80, rotation: 0, fontSize: 80, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'linear', angle: 120, stops: [{ color: '#8B5CF6', position: 0 }, { color: '#EC4899', position: 1 }] } },
            { id: 'st-title', type: ElementType.Text, content: 'Styled Text Builder', x: 40, y: 150, width: 300, height: 30, rotation: 0, fontSize: 22, fontWeight: 700, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' } },
            { id: 'st-desc', type: ElementType.Text, content: 'Enables the creation of uniquely styled and animated text elements, offering extensive customization options for impactful and visually captivating web typography. Allows combining different styles in one text paragraph.', x: 40, y: 190, width: 300, height: 120, rotation: 0, fontSize: 16, fontWeight: 400, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#9CA3AF' } },
            { id: 'st-btn-bg', type: ElementType.Rectangle, x: 40, y: 330, width: 140, height: 50, rotation: 0, fill: { type: 'solid' as const, color: 'rgba(255, 255, 255, 0.1)' }, borderRadius: 12, strokeWidth: 1, strokeColor: 'rgba(255, 255, 255, 0.2)' },
            { id: 'st-btn-txt', type: ElementType.Text, content: 'View Demo', x: 40, y: 330, width: 140, height: 50, rotation: 0, fontSize: 16, fontWeight: 600, fontFamily: 'sans-serif', fill: { type: 'solid' as const, color: '#FFFFFF' }, textAlign: 'center' },
        ]
    },
];
