import { PathError } from "./errors";
import { Path } from "./path";
import { Point, Scale, Dimensions, LineStyle, DefaultLineStyle, Shadow, DefaultShadow, ColorStop, Color, Repetition, TextStyle, DrawingType, Rectangle } from "./properties";

export interface MgineOptions {
    pixelArt?: boolean;
    fillAvailableSpace?: boolean;
    width?: number;
    height?: number;
}

export class Mgine {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;

    static DefaultFontFamily: string = 'Arial';

    constructor(id: string, options?: MgineOptions) {
        const { canvas, ctx } = this.#init(id, options);
        this.#canvas = canvas;
        this.#ctx = ctx;
    }

    #init(id: string, options?: MgineOptions): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
        const canvas = document.getElementById(id);
        if (!canvas) {
            throw new Error(`Canvas with id "${id}" not found`);
        }

        if (canvas instanceof HTMLCanvasElement === false) {
            throw new Error(`Element with id "${id}" is not a canvas`);
        }

        if (options?.fillAvailableSpace) {
            canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight ?? window.innerHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        } else {
            if (options?.width) {
                canvas.width = options.width;
            }
            if (options?.height) {
                canvas.height = options.height;
            }
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        if (options?.pixelArt) {
            canvas.style.imageRendering = 'pixelated';
            ctx.imageSmoothingEnabled = false;
        }

        return { canvas, ctx };
    }

    static Init(id: string, options?: MgineOptions): Mgine {
        return new Mgine(id, options);
    }

    static PreloadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }

    static PreloadImages(sources: string[]): Promise<HTMLImageElement[]> {
        return Promise.all(sources.map(src => Mgine.PreloadImage(src)));
    }

    get canvas(): HTMLCanvasElement {
        return this.#canvas;
    }

    get ctx(): CanvasRenderingContext2D {
        return this.#ctx;
    }

    setLineStyle(lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.lineWidth = lineStyle.width;
        this.#ctx.lineCap = lineStyle.cap ?? 'butt';
        this.#ctx.lineJoin = lineStyle.join ?? 'miter';
        this.#ctx.setLineDash(lineStyle.dash?.pattern ?? []);
        this.#ctx.lineDashOffset = lineStyle.dash?.offset ?? 0;
    }

    setTextStyle(textStyle: TextStyle) {
        this.#ctx.font = textStyle.font;
        this.#ctx.textAlign = textStyle.textAlign ?? 'start';
        this.#ctx.textBaseline = textStyle.textBaseline ?? 'alphabetic';
        if (textStyle.direction) this.#ctx.direction = textStyle.direction;
        if (textStyle.letterSpacing) this.#ctx.letterSpacing = textStyle.letterSpacing;
        if (textStyle.fontKerning) this.#ctx.fontKerning = textStyle.fontKerning;
        if (textStyle.fontStretch) this.#ctx.fontStretch = textStyle.fontStretch;
        if (textStyle.fontVariantCaps) this.#ctx.fontVariantCaps = textStyle.fontVariantCaps;
        if (textStyle.wordSpacing) this.#ctx.wordSpacing = textStyle.wordSpacing;
    }

    clear() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    save() {
        this.#ctx.save();
    }

    restore() {
        this.#ctx.restore();
    }

    resetShadow() {
        this.#ctx.shadowColor = 'transparent';
        this.#ctx.shadowBlur = 0;
        this.#ctx.shadowOffsetX = 0;
        this.#ctx.shadowOffsetY = 0;
    }

    setShadow(shadow: Shadow = DefaultShadow) {
        this.#ctx.shadowColor = shadow.color ?? 'transparent';
        this.#ctx.shadowBlur = shadow.blur ?? 0;
        this.#ctx.shadowOffsetX = shadow.offsetX ?? 0;
        this.#ctx.shadowOffsetY = shadow.offsetY ?? 0;
    }

    // Gradients

    linearGradient(from: Point, to: Point, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.#ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    radialGradient(from: Point, fromRadius: number, to: Point, toRadius: number, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.#ctx.createRadialGradient(from.x, from.y, fromRadius, to.x, to.y, toRadius);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    conicGradient(startAngle: number, center: Point, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.#ctx.createConicGradient(startAngle, center.x, center.y);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    // Patterns

    pattern(image: HTMLImageElement, repetition: Repetition = 'repeat'): CanvasPattern|null {
        return this.#ctx.createPattern(image, repetition);
    }

    // Shapes

    fillRect(rect: Rectangle, fillStyle: Color) {
        this.#ctx.fillStyle = fillStyle;
        this.#ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    strokeRect(rect: Rectangle, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.#ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    rect(rect: Rectangle, style: Color, type: DrawingType = 'filled', lineStyle?: LineStyle) {
        if (type === 'filled') {
            this.fillRect(rect, style);
        } else if (type === 'outline') {
            this.strokeRect(rect, style, lineStyle ?? DefaultLineStyle);
        }
    }

    clearRect(coordinates: Point, size: Dimensions) {
        this.#ctx.clearRect(coordinates.x, coordinates.y, size.width, size.height);
    }

    #drawLinearPath(points: Point[], closePath: boolean = false) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.#ctx.lineTo(points[i].x, points[i].y);
        }

        if (closePath) {
            this.#ctx.closePath();
        }
    }

    strokeLinearPath(points: Point[], strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle, closePath: boolean = false) {
        if (points.length === 0) return;

        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);

        this.#drawLinearPath(points, closePath);
        this.#ctx.stroke();
    }

    fillLinearPath(points: Point[], fillStyle: Color, closePath: boolean = false) {
        if (points.length === 0) return;

        this.#ctx.fillStyle = fillStyle;

        this.#drawLinearPath(points, closePath);
        this.#ctx.fill();
    }

    linearPath(points: Point[], style: Color, closePath: boolean = false, type: DrawingType = 'filled', lineStyle?: LineStyle) {
        if (type === 'filled') {
            this.fillLinearPath(points, style, closePath);
        } else if (type === 'outline') {
            this.strokeLinearPath(points, style, lineStyle ?? DefaultLineStyle, closePath);
        }
    }

    polygon(points: Point[], style: Color, type: DrawingType = 'filled', lineStyle?: LineStyle) {
        this.linearPath(points, style, true, type, lineStyle);
    }

    createPath(startingPoint: Point): Path {
        return new Path(startingPoint);
    }

    #drawPath(path: Path) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(path.start.x, path.start.y);

        path.forEach(segment => {
            switch (segment.type) {
                case 'line':
                    if (segment.drawn) {
                        this.#ctx.lineTo(segment.to.x, segment.to.y);
                    } else {
                        this.#ctx.moveTo(segment.to.x, segment.to.y);
                    }
                    break;
                case 'bezier':
                    if (!segment.cp1 || !segment.cp2) {
                        throw new PathError('Missing control points in bezier segment.', segment, path);
                    }
                    this.#ctx.bezierCurveTo(segment.cp1.x, segment.cp1.y, segment.cp2.x, segment.cp2.y, segment.to.x, segment.to.y);
                    break;
                case 'quadratic':
                    if (!segment.cp1) {
                        throw new PathError('Missing control point in quadratic segment.', segment, path);
                    }
                    this.#ctx.quadraticCurveTo(segment.cp1.x, segment.cp1.y, segment.to.x, segment.to.y);
                    break;
                default:
                    throw new PathError('Unknown segment type.', segment, path);
            }
        });
    }

    fillPath(path: Path, fillStyle: Color) {
        this.#ctx.fillStyle = fillStyle;
        this.#drawPath(path);
        this.#ctx.fill();
    }

    strokePath(path: Path, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.#drawPath(path);
        this.#ctx.stroke();
    }

    path(path: Path, style: Color, type: DrawingType = 'outline', lineStyle?: LineStyle) {
        if (type === 'filled') {
            this.fillPath(path, style);
        } else if (type === 'outline') {
            this.strokePath(path, style, lineStyle ?? DefaultLineStyle);
        }
    }

    fillCircle(center: Point, radius: number, fillStyle: Color) {
        this.#ctx.fillStyle = fillStyle;
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.#ctx.fill();
    }

    strokeCircle(center: Point, radius: number, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.#ctx.stroke();
    }

    circle(center: Point, radius: number, style: Color, drawingType: DrawingType = 'filled', lineStyle?: LineStyle) {
        if (drawingType === 'filled') {
            this.fillCircle(center, radius, style);
        } else if (drawingType === 'outline') {
            this.strokeCircle(center, radius, style, lineStyle ?? DefaultLineStyle);
        }
    }

    progressBar(rect: Rectangle, progress: number, showText: boolean = false, backgroundColor: Color = 'lightgray', progressColor: Color = 'green', textColor: Color = 'white', borderColor?: Color, borderWidth: number = 1): void {
        // Draw background
        this.fillRect(rect, backgroundColor);

        // Draw progress
        const progressWidth = Math.max(0, Math.min(1, progress)) * rect.width;
        this.fillRect({ x: rect.x, y: rect.y, width: progressWidth, height: rect.height }, progressColor);

        // Draw border if specified
        if (borderColor) {
            this.strokeRect(rect, borderColor, { width: borderWidth });
        }

        // Draw progress number if specified
        if (showText) {
            const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);
            const text = `${percentage}%`;
            const fontSize = Math.min(rect.height * 0.8, 20); // Limit font size to 20px for readability
            const font = `${fontSize}px ${Mgine.DefaultFontFamily}`;
            const textMetrics = this.measureText(text, { font });
            const textX = rect.x + (rect.width - textMetrics.width) / 2;
            const textY = rect.y + (rect.height + fontSize * 0.7) / 2; // Approximate vertical centering

            this.fillText(text, { x: textX, y: textY }, { font, color: textColor } );
        }
    }

    circularProgressBar(center: Point, radius: number, progress: number, showText: boolean = false, thickness: number = 10, backgroundColor: Color = 'lightgray', progressColor: Color = 'green', textColor: Color = 'black', maxFontSize: number = 36, lineCap: CanvasLineCap = 'round', startAngle: number = -Math.PI / 2) {
        // Draw background circle
        this.strokeCircle(center, radius, backgroundColor, { width: thickness });

        // Draw progress arc
        const endAngle = startAngle + Math.max(0, Math.min(1, progress)) * Math.PI * 2;
        this.#ctx.strokeStyle = progressColor;
        this.#ctx.lineWidth = thickness;
        this.#ctx.lineCap = lineCap;
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, startAngle, endAngle);
        this.#ctx.stroke();

        // Draw progress number if specified
        if (showText) {
            const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);
            const text = `${percentage}%`;
            const fontSize = Math.min(radius * 0.8, maxFontSize); // Limit font size to 36px for readability
            const font = `${fontSize}px ${Mgine.DefaultFontFamily}`;
            const textMetrics = this.measureText(text, { font });
            const textX = center.x - textMetrics.width / 2;
            const textY = center.y + fontSize * 0.35; // Approximate vertical centering

            this.fillText(text, { x: textX, y: textY }, { font, color: textColor } );
        }
    }

    drawImage(img: HTMLImageElement, coordinates: Point, scale?: Scale): void;
    drawImage(img: HTMLImageElement, coordinates: Point, size?: Dimensions): void;
    drawImage(img: HTMLImageElement, coordinates: Point, sizeOrScale?: Dimensions|Scale): void {
        if (sizeOrScale) {
            if ('width' in sizeOrScale && 'height' in sizeOrScale) {
                this.#ctx.drawImage(img, coordinates.x, coordinates.y, sizeOrScale.width, sizeOrScale.height);
            } else if ('x' in sizeOrScale && 'y' in sizeOrScale) {
                const width = img.width * sizeOrScale.x;
                if (!sizeOrScale.y) sizeOrScale.y = sizeOrScale.x;
                const height = img.height * sizeOrScale.y;
                this.#ctx.drawImage(img, coordinates.x, coordinates.y, width, height);
            }
        } else {
            this.#ctx.drawImage(img, coordinates.x, coordinates.y);
        }
    }

    fillText(text: string, coordinates: Point, style: TextStyle, maxWidth?: number) {
        this.setTextStyle(style);
        this.#ctx.fillStyle = style.color ?? 'black';
        this.#ctx.fillText(text, coordinates.x, coordinates.y, maxWidth);
    }

    strokeText(text: string, coordinates: Point, style: TextStyle, lineStyle: LineStyle = DefaultLineStyle, maxWidth?: number) {
        this.setLineStyle(lineStyle);
        this.setTextStyle(style);
        this.#ctx.strokeStyle = style.color ?? 'black';
        this.#ctx.strokeText(text, coordinates.x, coordinates.y, maxWidth);
    }

    measureText(text: string, style: TextStyle): TextMetrics {
        this.#ctx.font = style.font;
        this.setTextStyle(style);

        return this.#ctx.measureText(text);
    }
}
