export interface Point {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface Scale {
    x: number;
    y?: number;
}

export interface TextStyle {
    font: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    color?: Color;
    direction?: CanvasDirection;
    letterSpacing?: string;
    fontKerning?: CanvasFontKerning;
    fontStretch?: CanvasFontStretch;
    fontVariantCaps?: CanvasFontVariantCaps;
    wordSpacing?: string;
}

export interface Dash {
    pattern?: number[];
    offset?: number;
}

export interface LineStyle {
    width: number;
    cap?: CanvasLineCap;
    dash?: Dash;
    join?: CanvasLineJoin;
}

export interface Shadow {
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
}

export type DrawingType = 'filled' | 'outline';

export interface ColorStop {
    color: string;
    offset: number;
}

export type Color = string|CanvasGradient|CanvasPattern;

export type Repetition = 'repeat'|'repeat-x'|'repeat-y'|'no-repeat';

export const DefaultLineStyle: LineStyle = { width: 1, cap: 'butt', join: 'miter', dash: { pattern: [] } } as const;

export const DefaultShadow: Shadow = { color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 } as const;

export function copyPoint(point: Point): Point {
    return { x: point.x, y: point.y };
}
