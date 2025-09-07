
import { GoogleGenAI, Type } from "@google/genai";
import { type DesignElement, ElementType, Fill } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const stopSchema = {
    type: Type.OBJECT,
    properties: {
        color: { type: Type.STRING, description: 'Hex or RGBA color code for this stop.' },
        position: { type: Type.NUMBER, description: 'Position of the color stop (0 to 1).' }
    },
    required: ["color", "position"]
};

const fillSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['solid', 'linear'], description: 'Type of fill.' },
        color: { type: Type.STRING, description: 'Hex or RGBA color code (for solid fill).', nullable: true },
        angle: { type: Type.NUMBER, description: 'Angle of the gradient in degrees (for linear fill).', nullable: true },
        stops: { type: Type.ARRAY, items: stopSchema, description: 'Color stops for the gradient (for linear fill).', nullable: true }
    },
    required: ["type"]
};

const getElementSchema = (canvasWidth: number, canvasHeight: number) => ({
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'Unique identifier for the element.'},
        type: { type: Type.STRING, enum: Object.values(ElementType), description: 'Type of the element.' },
        x: { type: Type.NUMBER, description: `X position (0-${canvasWidth}).` },
        y: { type: Type.NUMBER, description: `Y position (0-${canvasHeight}).` },
        width: { type: Type.NUMBER, description: 'Width of the element.' },
        height: { type: Type.NUMBER, description: 'Height of the element.' },
        rotation: { type: Type.NUMBER, description: 'Rotation in degrees (0-360).' },
        opacity: { type: Type.NUMBER, description: 'Opacity of the element (0 to 1).', nullable: true },
        isVisible: { type: Type.BOOLEAN, description: 'Whether the element is visible.', nullable: true },
        
        fill: { ...fillSchema, nullable: true, description: "Fill for the element (text, shapes, svgs). Can be solid color or linear gradient." },

        // Text properties
        content: { type: Type.STRING, description: 'Text content (for text elements).', nullable: true },
        fontSize: { type: Type.NUMBER, description: 'Font size in pixels (for text elements).', nullable: true },
        fontWeight: { type: Type.NUMBER, description: 'Font weight (e.g., 400 for normal, 700 for bold).', nullable: true },
        fontFamily: { type: Type.STRING, description: 'Font family (e.g., "Arial").', nullable: true },
        textAlign: { type: Type.STRING, enum: ['left', 'center', 'right', 'justify'], description: 'Text alignment.', nullable: true },
        
        // Stroke properties (for shapes)
        strokeColor: { type: Type.STRING, description: 'Hex color code for the border stroke or line color.', nullable: true },
        strokeWidth: { type: Type.NUMBER, description: 'Width of the border stroke or line thickness in pixels.', nullable: true },
        strokeStyle: { type: Type.STRING, enum: ['solid', 'dashed', 'dotted'], description: 'Style of the border stroke.', nullable: true },
        
        // Border Radius (for rectangle, image)
        borderRadius: { type: Type.NUMBER, description: 'Uniform corner radius in pixels.', nullable: true },
        borderRadiusTl: { type: Type.NUMBER, description: 'Top-left corner radius.', nullable: true },
        borderRadiusTr: { type: Type.NUMBER, description: 'Top-right corner radius.', nullable: true },
        borderRadiusBr: { type: Type.NUMBER, description: 'Bottom-right corner radius.', nullable: true },
        borderRadiusBl: { type: Type.NUMBER, description: 'Bottom-left corner radius.', nullable: true },
        
        // Image properties
        src: { type: Type.STRING, description: 'Image URL. Use `https://picsum.photos/width/height`.', nullable: true },
        
        // SVG properties
        svgContent: { type: Type.STRING, description: 'The full SVG content string for an icon.', nullable: true},
        
        // QR Code properties
        data: { type: Type.STRING, description: 'The URL or text to encode in the QR code.', nullable: true},

        // Star properties
        points: { type: Type.NUMBER, description: 'Number of points for a star shape.', nullable: true },
        innerRadius: { type: Type.NUMBER, description: 'Inner radius factor for a star shape (0 to 1).', nullable: true },
        
        // Shadow properties
        shadowEnabled: { type: Type.BOOLEAN, nullable: true, description: 'Enable drop shadow.' },
        shadowColor: { type: Type.STRING, nullable: true, description: 'Shadow color (e.g., "rgba(0,0,0,0.5)").' },
        shadowOffsetX: { type: Type.NUMBER, nullable: true, description: 'Shadow X offset.' },
        shadowOffsetY: { type: Type.NUMBER, nullable: true, description: 'Shadow Y offset.' },
        shadowBlur: { type: Type.NUMBER, nullable: true, description: 'Shadow blur radius.' },
        
        // Backdrop filter properties
        backdropFilterEnabled: { type: Type.BOOLEAN, nullable: true, description: 'Enable backdrop filter (for shapes).' },
        backdropFilterBlur: { type: Type.NUMBER, nullable: true, description: 'Backdrop blur in pixels.' },
        backdropFilterBrightness: { type: Type.NUMBER, nullable: true, description: 'Backdrop brightness (e.g., 1 is normal).' },
        backdropFilterContrast: { type: Type.NUMBER, nullable: true, description: 'Backdrop contrast (e.g., 1 is normal).' },
    },
    required: ["id", "type", "x", "y", "width", "height", "rotation"]
});


export const generateLayout = async (prompt: string, canvasWidth: number, canvasHeight: number): Promise<DesignElement[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Eres un asistente de diseño gráfico. Crea un diseño para un lienzo de ${canvasWidth}x${canvasHeight}px basado en la siguiente descripción: "${prompt}". Genera un array de elementos de diseño en formato JSON. Puedes usar los siguientes tipos: 'text', 'rectangle', 'image', 'ellipse', 'line', 'svg', 'qrcode', 'triangle', 'star'. Asegúrate de que las coordenadas y dimensiones estén dentro de los límites del lienzo. Para elementos con relleno (texto, rectángulo, elipse, svg, triángulo, estrella), usa el objeto 'fill'. El 'fill' puede ser de tipo 'solid' (con una propiedad 'color') o 'linear' (con propiedades 'angle' y 'stops', donde 'stops' es un array de objetos con 'color' y 'position'). Para las estrellas ('star'), puedes especificar 'points' y 'innerRadius'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: getElementSchema(canvasWidth, canvasHeight)
        },
      },
    });

    const jsonString = response.text;
    const generatedElements = JSON.parse(jsonString);

    if (!Array.isArray(generatedElements)) {
        throw new Error("La respuesta de la IA no es un array de elementos de diseño válido.");
    }
    
    return generatedElements.map((el, index) => {
      const baseEl: any = {
        ...el, 
        id: `${Date.now()}-${index}`,
        opacity: el.opacity ?? 1,
        isVisible: el.isVisible ?? true,
        shadow: {
          enabled: el.shadowEnabled ?? false,
          color: el.shadowColor ?? 'rgba(0,0,0,0.5)',
          offsetX: el.shadowOffsetX ?? 0,
          offsetY: el.shadowOffsetY ?? 2,
          blur: el.shadowBlur ?? 4,
        }
      };

      // Ensure fill exists for elements that need it
      if ([ElementType.Text, ElementType.Rectangle, ElementType.Ellipse, ElementType.Svg, ElementType.Triangle, ElementType.Star].includes(el.type as ElementType)) {
          if (!el.fill) {
              baseEl.fill = { type: 'solid', color: el.type === 'text' ? '#000000' : '#cccccc' } as Fill;
          }
      }

      if (el.type === ElementType.Text) {
          baseEl.textAlign = el.textAlign ?? 'left';
      }
      
      if (el.type === ElementType.Rectangle || el.type === ElementType.Ellipse) {
        baseEl.strokeColor = el.strokeColor ?? '#000000';
        baseEl.strokeWidth = el.strokeWidth ?? 0;
        baseEl.strokeStyle = el.strokeStyle ?? 'solid';
        baseEl.backdropFilter = {
            enabled: el.backdropFilterEnabled ?? false,
            blur: el.backdropFilterBlur ?? 10,
            brightness: el.backdropFilterBrightness ?? 1,
            contrast: el.backdropFilterContrast ?? 1,
        };
      }

      if (el.type === ElementType.Rectangle || el.type === ElementType.Image) {
        const hasIndividualRadii = el.borderRadiusTl != null || el.borderRadiusTr != null || el.borderRadiusBr != null || el.borderRadiusBl != null;
        if (hasIndividualRadii) {
            baseEl.borderRadius = {
                tl: el.borderRadiusTl ?? 0,
                tr: el.borderRadiusTr ?? 0,
                br: el.borderRadiusBr ?? 0,
                bl: el.borderRadiusBl ?? 0,
            };
        } else {
            baseEl.borderRadius = el.borderRadius ?? 0;
        }
      }

      if (el.type === ElementType.Star) {
          baseEl.points = el.points ?? 5;
          baseEl.innerRadius = el.innerRadius ?? 0.5;
      }
      
      return baseEl;
    }) as DesignElement[];

  } catch (error) {
    console.error("Error generating layout with Gemini:", error);
    throw new Error("No se pudo generar el diseño. Por favor, inténtalo de nuevo.");
  }
};
