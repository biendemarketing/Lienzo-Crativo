export enum ElementType {
  Text = 'text',
  Rectangle = 'rectangle',
  Image = 'image',
  Ellipse = 'ellipse',
  Line = 'line',
  Svg = 'svg',
  QrCode = 'qrcode',
  Triangle = 'triangle',
  Star = 'star',
  Group = 'group',
}

export interface Shadow {
  enabled: boolean;
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface BackdropFilter {
  enabled: boolean;
  blur: number;
  brightness: number;
  contrast: number;
}

export type SolidFill = {
    type: 'solid';
    color: string;
};

export type GradientStop = {
    color: string;
    position: number; // 0 to 1
};

export type LinearGradientFill = {
    type: 'linear';
    angle: number;
    stops: GradientStop[];
};

export type Fill = SolidFill | LinearGradientFill;


interface BaseElement {
  id: string;
  name?: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity?: number;
  isVisible?: boolean;
  isLocked?: boolean;
  shadow?: Shadow;
  mask?: {
    enabled: boolean;
    dataUrl: string;
  };
}

export interface TextElement extends BaseElement {
  type: ElementType.Text;
  content: string;
  fontSize: number;
  fill: Fill;
  fontWeight: number;
  fontFamily: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  strokeColor?: string;
  strokeWidth?: number;
}

export type BorderRadiusObject = {
  tl: number;
  tr: number;
  br: number;
  bl: number;
};

export type BorderRadius = number | BorderRadiusObject;


export interface RectangleElement extends BaseElement {
  type: ElementType.Rectangle;
  fill: Fill;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: BorderRadius;
  backdropFilter?: BackdropFilter;
}

export interface ImageElement extends BaseElement {
  type: ElementType.Image;
  src: string;
  borderRadius?: BorderRadius;
}

export interface EllipseElement extends BaseElement {
    type: ElementType.Ellipse;
    fill: Fill;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    backdropFilter?: BackdropFilter;
}

export interface LineElement extends BaseElement {
    type: ElementType.Line;
    strokeColor: string;
    strokeWidth: number;
}

export interface SvgElement extends BaseElement {
    type: ElementType.Svg;
    svgContent: string;
    fill: Fill;
}

export interface QrCodeElement extends BaseElement {
    type: ElementType.QrCode;
    data: string; // URL or text to encode
}

export interface TriangleElement extends BaseElement {
    type: ElementType.Triangle;
    fill: Fill;
}

export interface StarElement extends BaseElement {
    type: ElementType.Star;
    fill: Fill;
    points: number;
    innerRadius: number; // as a factor of outer radius, e.g., 0.5
}

export interface GroupElement extends BaseElement {
    type: ElementType.Group;
    children: DesignElement[];
}


export type DesignElement = TextElement | RectangleElement | ImageElement | EllipseElement | LineElement | SvgElement | QrCodeElement | TriangleElement | StarElement | GroupElement;

export type Alignment = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom' | 'distribute-h' | 'distribute-v';

export interface CanvasSettings {
  name: string;
  width: number;
  height: number;
  unit: 'px' | 'in' | 'mm';
  dpi: 72 | 150 | 300;
  orientation: 'portrait' | 'landscape';
  colorMode: 'rgb' | 'cmyk';
  background: 'transparent' | 'white' | 'black';
  artboards: number;
  artboardLayout?: 'grid' | 'row' | 'column';
  artboardSpacing?: number;
}

export interface RecentFile {
    id: string;
    name: string;
    preview: string;
    settings: CanvasSettings;
    elements: DesignElement[];
    updatedAt: string;
}

export interface DesignProject {
    id: string;
    settings: CanvasSettings;
    elementsHistory: DesignElement[][];
    historyIndex: number;
    isDirty?: boolean;
    guides?: {
        horizontal: number[];
        vertical: number[];
    };
}

export interface ViewState {
    zoom: number;
    pan: { x: number; y: number };
    isRulersVisible?: boolean;
}

export interface BrushPreset {
    id: string;
    name: string;
    preview: string; // SVG string for preview
    settings: {
        size: number;
        hardness: number;
        opacity: number;
    };
}

export interface TextStylePreset {
    name: string;
    style: Partial<TextElement>;
}

export interface SocialIconComponent extends GroupElement {
    name: 'Icono Facebook' | 'Icono Instagram' | 'Icono Twitter' | 'Icono LinkedIn';
}