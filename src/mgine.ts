import { ConicGradient, LinearGradient, RadialGradient } from "./gradient";
import { Graphics } from "./graphics";
import { Path } from "./path";
import { Point, Scale, Dimensions, LineStyle, DefaultLineStyle, ColorStop, Color, Repetition, TextStyle, DrawingType, Rectangle } from "./properties";

export interface MgineOptions {
    pixelArt?: boolean;
    fillAvailableSpace?: boolean;
    width?: number;
    height?: number;
    transparentBackground?: boolean;
}

export class Mgine {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    #options: MgineOptions;
    #graphics: Graphics;

    static DefaultFontFamily: string = 'sans-serif';
    static DefaultFontSize: string|number = 10;

    get canvas(): HTMLCanvasElement { return this.#canvas; }
    get ctx(): CanvasRenderingContext2D { return this.#ctx; }
    get options(): MgineOptions { return this.#options; }
    get graphics(): Graphics { return this.#graphics; }

    constructor(id: string, options?: MgineOptions) {
        const { canvas, ctx } = this.#init(id, options);
        this.#canvas = canvas;
        this.#ctx = ctx;
        this.#options = options ?? {};
        this.#graphics = new Graphics(this.#ctx);
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

        const opts: CanvasRenderingContext2DSettings = {};
        if (options?.transparentBackground !== undefined) {
            opts.alpha = options.transparentBackground;
        }

        const ctx = canvas.getContext('2d', opts);

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

    static CreatePath(startingPoint: Point): Path {
        return new Path(startingPoint);
    }

    getMouseCoordinates(event: MouseEvent): Point {
        return {
            x: event.offsetX * this.#canvas.width  / this.#canvas.clientWidth,
            y: event.offsetY * this.#canvas.height / this.#canvas.clientHeight,
        };
    }

    setLineStyle(lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.setLineStyle(lineStyle);
    }

    setTextStyle(textStyle: TextStyle) {
        return this.#graphics.setTextStyle(textStyle);
    }

    clear(keepTransform: boolean = false) {
        if (keepTransform) this.save();
        this.#ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        if (keepTransform) this.restore();
    }

    reset() {
        this.#ctx.reset();
        if (this.#options?.pixelArt) {
            this.#ctx.imageSmoothingEnabled = false;
        }
    }

    clearRect(rect: Rectangle) {
        this.#graphics.clearRect(rect);
    }

    save() {
        this.#ctx.save();
    }

    restore() {
        this.#ctx.restore();
    }

    // Gradients

    linearGradient(from: Point, to: Point, colorStops: ColorStop[]): LinearGradient {
        return new LinearGradient(this.#ctx, from, to, colorStops);
    }

    radialGradient(from: Point, fromRadius: number, to: Point, toRadius: number, colorStops: ColorStop[]): RadialGradient {
        return new RadialGradient(this.#ctx, from, fromRadius, to, toRadius, colorStops);
    }

    conicGradient(startAngle: number, center: Point, colorStops: ColorStop[]): ConicGradient {
        return new ConicGradient(this.#ctx, startAngle, center, colorStops);
    }

    // Patterns

    pattern(image: HTMLImageElement, repetition: Repetition = 'repeat'): CanvasPattern|null {
        return this.#ctx.createPattern(image, repetition);
    }

    // Shapes

    fillRect(rect: Rectangle, fillStyle: Color) {
        this.#graphics.fillRect(rect, fillStyle);
    }

    strokeRect(rect: Rectangle, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.strokeRect(rect, strokeStyle, lineStyle);
    }

    rect(rect: Rectangle, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.rect(rect, color, type, lineStyle);
    }

    polygon(points: Point[], color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.polygon(points, color, type, lineStyle);
    }

    fillCircle(center: Point, radius: number, fillStyle: Color) {
        this.#graphics.fillCircle(center, radius, fillStyle);
    }

    strokeCircle(center: Point, radius: number, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.strokeCircle(center, radius, strokeStyle, lineStyle);
    }

    circle(center: Point, radius: number, color: Color, drawingType: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.circle(center, radius, color, drawingType, lineStyle);
    }

    partialEllipse(center: Point, radius: Point, rotation: number = 0, startAngle: number = 0, endAngle: number = Math.PI * 2, counterClockwise: boolean = false, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.partialEllipse(center, radius, rotation, startAngle, endAngle, counterClockwise, color, type, lineStyle);
    }

    ellipse(xy1: Point, xy2: Point, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.ellipse(xy1, xy2, color, type, lineStyle);
    }

    ellipseFromCenter(center: Point, radius: Point, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#graphics.ellipseFromCenter(center, radius, color, type, lineStyle);
    }

    // Paths

    pointsToPath(points: Point[], closed: boolean = false): Path {
        return this.#graphics.pointsToPath(points, closed);
    }

    line(from: Point, to: Point, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.line(from, to, strokeStyle, lineStyle);
    }

    bezierCurve(from: Point, control1: Point, control2: Point, to: Point, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.bezierCurve(from, control1, control2, to, strokeStyle, lineStyle);
    }

    quadraticCurve(from: Point, control: Point, to: Point, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.quadraticCurve(from, control, to, strokeStyle, lineStyle);
    }

    curve(strokeStyle: Color, from: Point, to: Point, control1: Point, control2?: Point, lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.curve(strokeStyle, from, to, control1, control2, lineStyle);
    }

    linearPath(points: Point[], strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.linearPath(points, strokeStyle, lineStyle);
    }

    fillPath(path: Path, fillStyle: Color) {
        return this.#graphics.fillPath(path, fillStyle);
    }

    strokePath(path: Path, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.strokePath(path, strokeStyle, lineStyle);
    }

    path(path: Path, color: Color, type: DrawingType = 'stroke', lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.path(path, color, type, lineStyle);
    }

    arc(center: Point, radius: number, startAngle: number, endAngle: number, counterClockwise: boolean = false, style: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        return this.#graphics.arc(center, radius, startAngle, endAngle, counterClockwise, style, type, lineStyle);
    }

    // Progress Bars

    progressBar(rect: Rectangle, progress: number, showText: boolean = false, backgroundColor: Color = 'lightgray', progressColor: Color = 'green', textColor: Color = 'white', borderColor?: Color, borderWidth: number = 1): void {
        return this.#graphics.progressBar(rect, progress, showText, backgroundColor, progressColor, textColor, borderColor, borderWidth);
    }

    circularProgressBar(center: Point, radius: number, progress: number, showText: boolean = false, thickness: number = 10, backgroundColor: Color = 'lightgray', progressColor: Color = 'green', textColor: Color = 'black', maxFontSize: number = 36, lineCap: CanvasLineCap = 'round', startAngle: number = -Math.PI / 2) {
        return this.#graphics.circularProgressBar(center, radius, progress, showText, thickness, backgroundColor, progressColor, textColor, maxFontSize, lineCap, startAngle);
    }

    // Images

    drawImage(img: HTMLImageElement, coordinates: Point): void;
    drawImage(img: HTMLImageElement, coordinates: Point, scale?: Scale): void;
    drawImage(img: HTMLImageElement, coordinates: Point, size?: Dimensions): void;
    drawImage(img: HTMLImageElement, coordinates: Point, sizeOrScale?: Dimensions|Scale): void;
    drawImage(img: HTMLImageElement, coordinates: Point, sizeOrScale?: Dimensions|Scale): void {
        return this.#graphics.drawImage(img, coordinates, sizeOrScale);
    }

    // Text

    fillText(text: string, coordinates: Point, style: TextStyle, maxWidth?: number) {
        return this.#graphics.fillText(text, coordinates, style, maxWidth);
    }

    strokeText(text: string, coordinates: Point, style: TextStyle, lineStyle: LineStyle = DefaultLineStyle, maxWidth?: number) {
        return this.#graphics.strokeText(text, coordinates, style, lineStyle, maxWidth);
    }

    measureText(text: string, style: TextStyle): TextMetrics {
        return this.#graphics.measureText(text, style);
    }
}
