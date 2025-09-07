import jsPDF from 'jspdf';
import { DesignElement, ElementType, Fill, RectangleElement, TextElement, ImageElement, EllipseElement, LineElement, SvgElement, QrCodeElement, TriangleElement, StarElement, BorderRadius, GroupElement } from '../types';

const escapeHtml = (unsafe: string): string => {
    if(!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

const getBorderRadiusString = (borderRadius: BorderRadius | undefined): string => {
    if (typeof borderRadius === 'number' && borderRadius > 0) {
        return `rx="${borderRadius}" ry="${borderRadius}"`;
    }
    // SVG rect doesn't support individual corner radii. We'd need to use a path, which is complex.
    // We'll return a uniform radius for simplicity if it's an object.
    if (typeof borderRadius === 'object' && borderRadius !== null) {
        const avg = (borderRadius.tl + borderRadius.tr + borderRadius.br + borderRadius.bl) / 4;
        if(avg > 0) return `rx="${avg}" ry="${avg}"`;
    }
    return '';
};

const getFillProps = (fill: Fill, id: string): { fillProp: string; defs: string } => {
    if (fill.type === 'solid') {
        return { fillProp: `fill="${fill.color}"`, defs: '' };
    }
    if (fill.type === 'linear') {
        const gradientId = `grad-${id}`;
        // Convert CSS angle (0deg is top) to SVG gradient angle
        const angleRad = (fill.angle - 90) * Math.PI / 180;
        const x1 = Math.round(50 + 50 * Math.cos(angleRad));
        const y1 = Math.round(50 + 50 * Math.sin(angleRad));
        const stops = fill.stops.map(s => `<stop offset="${s.position * 100}%" stop-color="${s.color}" />`).join('');
        const defs = `<linearGradient id="${gradientId}" x1="${100-x1}%" y1="${100-y1}%" x2="${x1}%" y2="${y1}%">${stops}</linearGradient>`;
        return { fillProp: `fill="url(#${gradientId})"`, defs };
    }
    return { fillProp: 'fill="transparent"', defs: '' };
};

const elementToSvg = (element: DesignElement): { content: string, defs: string } => {
    let allDefs: string[] = [];
    let elementSvg = '';
    
    const transform = `transform="translate(${element.x}, ${element.y}) rotate(${element.rotation}, ${element.width / 2}, ${element.height / 2})"`;
    const baseProps = `opacity="${element.opacity ?? 1}"`;

    switch (element.type) {
        case ElementType.Group: {
            const el = element as GroupElement;
            const childrenSvg = el.children.map(child => elementToSvg(child));
            const childrenContent = childrenSvg.map(c => c.content).join('\n');
            const childrenDefs = childrenSvg.map(c => c.defs);
            allDefs.push(...childrenDefs);
            elementSvg = childrenContent;
            break;
        }
        case ElementType.Rectangle: {
            const el = element as RectangleElement;
            const { fillProp, defs: fillDefs } = getFillProps(el.fill, el.id);
            allDefs.push(fillDefs);
            const stroke = el.strokeWidth ? `stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"` : '';
            const borderRadius = getBorderRadiusString(el.borderRadius);
            elementSvg = `<rect width="${el.width}" height="${el.height}" ${fillProp} ${stroke} ${borderRadius} />`;
            break;
        }
        case ElementType.Text: {
            const el = element as TextElement;
            const { fillProp, defs: fillDefs } = getFillProps(el.fill, el.id);
            allDefs.push(fillDefs);
            const textAnchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
            const xPos = el.textAlign === 'center' ? el.width / 2 : el.textAlign === 'right' ? el.width : 0;
            const lines = el.content.split('\n');
            const lineHeight = (el.fontSize || 16) * 1.2;
            const totalTextHeight = lines.length * lineHeight;
            const startY = (el.height - totalTextHeight) / 2 + lineHeight * 0.8;
            const tspans = lines.map((line, index) => `<tspan x="${xPos}" dy="${index === 0 ? startY : lineHeight}">${escapeHtml(line)}</tspan>`).join('');
            const strokeAttr = el.strokeWidth && el.strokeWidth > 0 ? `stroke="${el.strokeColor || '#000'}" stroke-width="${el.strokeWidth}"` : '';

            elementSvg = `<text font-family="${el.fontFamily}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" text-anchor="${textAnchor}" ${fillProp} ${strokeAttr}>${tspans}</text>`;
            break;
        }
        case ElementType.Image: {
             const el = element as ImageElement;
             elementSvg = `<image href="${el.src}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" />`;
             break;
        }
        case ElementType.Ellipse: {
            const el = element as EllipseElement;
            const { fillProp, defs: fillDefs } = getFillProps(el.fill, el.id);
            allDefs.push(fillDefs);
            const stroke = el.strokeWidth ? `stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"` : '';
            elementSvg = `<ellipse cx="${el.width/2}" cy="${el.height/2}" rx="${el.width/2}" ry="${el.height/2}" ${fillProp} ${stroke}/>`;
            break;
        }
        case ElementType.Star: {
            const el = element as StarElement;
            const { fillProp, defs: fillDefs } = getFillProps(el.fill, el.id);
            allDefs.push(fillDefs);
            const cx = el.width / 2;
            const cy = el.height / 2;
            const outerRadius = Math.min(el.width, el.height) / 2;
            const innerRadiusValue = outerRadius * el.innerRadius;
            
            const pathPoints = Array.from({ length: el.points * 2 }, (_, i) => {
                const radius = i % 2 === 0 ? outerRadius : innerRadiusValue;
                const angle = (i * Math.PI) / el.points - Math.PI / 2;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(' ');
            elementSvg = `<polygon points="${pathPoints}" ${fillProp} />`;
            break;
        }
        case ElementType.Triangle: {
            const el = element as TriangleElement;
            const { fillProp, defs: fillDefs } = getFillProps(el.fill, el.id);
            allDefs.push(fillDefs);
            const pathPoints = `M${el.width / 2},0 L0,${el.height} L${el.width},${el.height} Z`;
            elementSvg = `<path d="${pathPoints}" ${fillProp} />`;
            break;
        }
        case ElementType.Line: {
            const el = element as LineElement;
            elementSvg = `<line x1="0" y1="${el.height / 2}" x2="${el.width}" y2="${el.height / 2}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" />`;
            break;
        }
         case ElementType.Svg: {
            const el = element as SvgElement;
            const { fillProp, defs: fillDefs } = getFillProps(el.fill, el.id);
            allDefs.push(fillDefs);
            let svgContent = el.svgContent.replace(/<svg(.*?)>/, `<svg$1 width="${el.width}" height="${el.height}" ${fillProp}>`);
            elementSvg = svgContent;
            break;
        }
        default:
            break;
    }
    return { content: `<g ${transform} ${baseProps}>${elementSvg}</g>`, defs: allDefs.join('') };
};


export const exportToSvg = (elements: DesignElement[], width: number, height: number): string => {
    const rendered = elements.map(elementToSvg);
    const content = rendered.map(r => r.content).join('\n');
    const defs = '<defs>' + [...new Set(rendered.map(r => r.defs))].join('') + '</defs>';

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${defs}${content}</svg>`;
};

export const exportToPng = (elements: DesignElement[], width: number, height: number, filename: string) => {
    const svgString = exportToSvg(elements, width, height);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const resolution = 2; // Export at 2x resolution for better quality
        canvas.width = width * resolution;
        canvas.height = height * resolution;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
    };
    img.onerror = () => {
        console.error("Error al cargar la imagen SVG para la exportación a PNG.");
        URL.revokeObjectURL(url);
    }
    img.src = url;
};


export const generateCanvasPreview = (elements: DesignElement[], width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const svgString = exportToSvg(elements, width, height);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const previewWidth = 200;
            const previewHeight = (height / width) * previewWidth;
            const canvas = document.createElement('canvas');
            canvas.width = previewWidth;
            canvas.height = previewHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, previewWidth, previewHeight);
                const pngUrl = canvas.toDataURL('image/png');
                resolve(pngUrl);
            } else {
                reject(new Error("No se pudo crear el contexto del canvas para la vista previa."));
            }
            URL.revokeObjectURL(url);
        };
        img.onerror = (e) => {
            console.error("Error al cargar SVG para la vista previa:", e);
            reject(new Error("Error al cargar SVG para la vista previa."));
            URL.revokeObjectURL(url);
        }
        img.src = url;
    });
};

const getImageData = async (url: string): Promise<string> => {
    // Use a proxy if available to bypass CORS issues, otherwise fetch directly
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const exportToPdf = async (elements: DesignElement[], width: number, height: number, filename: string) => {
    const doc = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
    });

    for (const el of elements) {
        if (!el.isVisible) continue;
        
        doc.saveGraphicsState();
        // FIX: Replaced non-existent `doc.setOpacity` with correct `doc.setGState`
        doc.setGState(new (doc as any).GState({opacity: el.opacity ?? 1}));

        // Note: jsPDF rotation is complex. For simplicity, we rasterize rotated elements.
        // A more advanced implementation would handle matrix transforms.
        if (el.rotation !== 0) {
            const svg = exportToSvg([el], width, height);
            const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const dataUrl = await getImageData(url);
            URL.revokeObjectURL(url);
            doc.addImage(dataUrl, 'PNG', 0, 0, width, height);
            doc.restoreGraphicsState();
            continue; // Skip further processing for this element
        }

        switch (el.type) {
            case ElementType.Rectangle: {
                const rect = el as RectangleElement;
                if (rect.fill.type === 'solid') doc.setFillColor(rect.fill.color);
                const style = rect.fill.type === 'solid' ? 'F' : 'S'; // Fill or Stroke
                if(rect.strokeWidth) doc.setLineWidth(rect.strokeWidth).setDrawColor(rect.strokeColor || '#000000');
                
                if (typeof rect.borderRadius === 'number' && rect.borderRadius > 0) {
                    doc.roundedRect(rect.x, rect.y, rect.width, rect.height, rect.borderRadius, rect.borderRadius, style);
                } else {
                    doc.rect(rect.x, rect.y, rect.width, rect.height, style);
                }
                break;
            }
             case ElementType.Ellipse: {
                const ell = el as EllipseElement;
                if (ell.fill.type === 'solid') doc.setFillColor(ell.fill.color);
                const style = ell.fill.type === 'solid' ? 'F' : 'S';
                if(ell.strokeWidth) doc.setLineWidth(ell.strokeWidth).setDrawColor(ell.strokeColor || '#000000');
                doc.ellipse(ell.x + ell.width / 2, ell.y + ell.height / 2, ell.width / 2, ell.height / 2, style);
                break;
            }
             case ElementType.Line: {
                const line = el as LineElement;
                doc.setLineWidth(line.strokeWidth).setDrawColor(line.strokeColor);
                doc.line(line.x, line.y + line.strokeWidth/2, line.x + line.width, line.y + line.strokeWidth/2);
                break;
            }
            case ElementType.Text: {
                const text = el as TextElement;
                if (text.fill.type === 'solid') doc.setTextColor(text.fill.color);
                let fontStyle = '';
                if(text.fontWeight >= 700) fontStyle += 'bold';
                doc.setFont(text.fontFamily, fontStyle);
                doc.setFontSize(text.fontSize);
                const lines = text.content.split('\n');
                doc.text(lines, text.x, text.y + text.fontSize * 0.8, { align: text.textAlign, maxWidth: text.width });
                break;
            }
            case ElementType.Image: {
                const img = el as ImageElement;
                try {
                    const dataUrl = await getImageData(img.src);
                    doc.addImage(dataUrl, 'PNG', img.x, img.y, img.width, img.height);
                } catch (e) {
                    console.error("Could not add image to PDF:", e);
                }
                break;
            }
            default:
                 // For complex types (SVG, gradients, etc.), rasterize them
                 const complexSvg = exportToSvg([el], el.width, el.height);
                 const complexBlob = new Blob([complexSvg], { type: 'image/svg+xml;charset=utf-8' });
                 const complexUrl = URL.createObjectURL(complexBlob);
                 try {
                     const dataUrl = await getImageData(complexUrl);
                     doc.addImage(dataUrl, 'PNG', el.x, el.y, el.width, el.height);
                 } catch(e) { console.error("Could not add complex element to PDF:", e); }
                 URL.revokeObjectURL(complexUrl);
                break;
        }
        doc.restoreGraphicsState();
    }
    doc.save(filename);
};