export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Scale {
    x: number;
    y: number;
}

export interface TextStyle {
    font: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    color?: string;
    direction?: CanvasDirection;
    letterSpacing?: string;
    fontKerning?: CanvasFontKerning;
    fontStretch?: CanvasFontStretch;
    fontVariantCaps?: CanvasFontVariantCaps;
    wordSpacing?: string;
}

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
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight ?? window.innerHeight;
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

    fillRect(coordinates: Point, size: Size, color: string) {
        this.#ctx.fillStyle = color;
        this.#ctx.fillRect(coordinates.x, coordinates.y, size.width, size.height);
    }

    strokeRect(coordinates: Point, size: Size, color: string, lineWidth: number = 1) {
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.strokeRect(coordinates.x, coordinates.y, size.width, size.height);
    }

    clearRect(coordinates: Point, size: Size) {
        this.#ctx.clearRect(coordinates.x, coordinates.y, size.width, size.height);
    }

    strokePath(points: Point[], color: string, lineWidth: number = 1, closePath: boolean = false) {
        if (points.length === 0) return;

        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.beginPath();
        this.#ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.#ctx.lineTo(points[i].x, points[i].y);
        }

        if (closePath) {
            this.#ctx.closePath();
        }

        this.#ctx.stroke();
    }

    fillPath(points: Point[], color: string, closePath: boolean = false) {
        if (points.length === 0) return;

        this.#ctx.fillStyle = color;
        this.#ctx.beginPath();
        this.#ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.#ctx.lineTo(points[i].x, points[i].y);
        }

        if (closePath) {
            this.#ctx.closePath();
        }

        this.#ctx.fill();
    }

    fillCircle(center: Point, radius: number, color: string) {
        this.#ctx.fillStyle = color;
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.#ctx.fill();
    }

    strokeCircle(center: Point, radius: number, color: string, lineWidth: number = 1) {
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.#ctx.stroke();
    }

    progressBar(coordinates: Point, size: Size, progress: number, showText: boolean = false, backgroundColor: string = 'lightgray', progressColor: string = 'green', textColor: string = 'white', borderColor?: string, borderWidth: number = 1): void {
        // Draw background
        this.fillRect(coordinates, size, backgroundColor);

        // Draw progress
        const progressWidth = Math.max(0, Math.min(1, progress)) * size.width;
        this.fillRect(coordinates, { width: progressWidth, height: size.height }, progressColor);

        // Draw border if specified
        if (borderColor) {
            this.strokeRect(coordinates, size, borderColor, borderWidth);
        }

        // Draw progress number if specified
        if (showText) {
            const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);
            const text = `${percentage}%`;
            const fontSize = Math.min(size.height * 0.8, 20); // Limit font size to 20px for readability
            const font = `${fontSize}px ${Mgine.DefaultFontFamily}`;
            const textMetrics = this.measureText(text, font);
            const textX = coordinates.x + (size.width - textMetrics.width) / 2;
            const textY = coordinates.y + (size.height + fontSize * 0.7) / 2; // Approximate vertical centering

            this.fillText(text, { x: textX, y: textY }, { font, color: textColor } );
        }
    }

    circularProgressBar(center: Point, radius: number, progress: number, showText: boolean = false, thickness: number = 10, backgroundColor: string = 'lightgray', progressColor: string = 'green', textColor: string = 'black', startAngle: number = -Math.PI / 2) {
        // Draw background circle
        this.strokeCircle(center, radius, backgroundColor, thickness);

        // Draw progress arc
        const endAngle = startAngle + Math.max(0, Math.min(1, progress)) * Math.PI * 2;
        this.#ctx.strokeStyle = progressColor;
        this.#ctx.lineWidth = thickness;
        this.#ctx.lineCap = 'round';
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, startAngle, endAngle);
        this.#ctx.stroke();

        // Draw progress number if specified
        if (showText) {
            const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);
            const text = `${percentage}%`;
            const fontSize = Math.min(radius * 0.8, 36); // Limit font size to 36px for readability
            const font = `${fontSize}px ${Mgine.DefaultFontFamily}`;
            const textMetrics = this.measureText(text, font);
            const textX = center.x - textMetrics.width / 2;
            const textY = center.y + fontSize * 0.35; // Approximate vertical centering

            this.fillText(text, { x: textX, y: textY }, { font, color: textColor } );
        }
    }

    clear() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawImage(img: HTMLImageElement, coordinates: Point|'center', scale?: Scale): void;
    drawImage(img: HTMLImageElement, coordinates: Point|'center', size?: Size): void;
    drawImage(img: HTMLImageElement, coordinates: Point|'center', sizeOrScale?: Size|Scale): void {
        let newCoords = coordinates !== 'center' ? coordinates : { x: (this.#canvas.width - img.width) / 2, y: (this.#canvas.height - img.height) / 2 };

        if (sizeOrScale) {
            if ('width' in sizeOrScale && 'height' in sizeOrScale) {
                newCoords = coordinates === 'center' ? { x: (this.#canvas.width - sizeOrScale.width) / 2, y: (this.#canvas.height - sizeOrScale.height) / 2 } : newCoords;
                this.#ctx.drawImage(img, newCoords.x, newCoords.y, sizeOrScale.width, sizeOrScale.height);
                return;
            }
            if ('x' in sizeOrScale && 'y' in sizeOrScale) {
                const width = img.width * sizeOrScale.x;
                const height = img.height * sizeOrScale.y;
                newCoords = coordinates === 'center' ? { x: (this.#canvas.width - width) / 2, y: (this.#canvas.height - height) / 2 } : newCoords;
                this.#ctx.drawImage(img, newCoords.x, newCoords.y, width, height);
                return;
            }
        }
    }

    fillText(text: string, coordinates: Point, style: TextStyle, maxWidth?: number) {
        this.#ctx.font = style.font;
        this.#ctx.fillStyle = style.color ?? 'black';
        this.#ctx.textAlign = style.textAlign ?? 'start';
        this.#ctx.textBaseline = style.textBaseline ?? 'alphabetic';
        if (style.direction) this.#ctx.direction = style.direction;
        if (style.letterSpacing) this.#ctx.letterSpacing = style.letterSpacing;
        if (style.fontKerning) this.#ctx.fontKerning = style.fontKerning;
        if (style.fontStretch) this.#ctx.fontStretch = style.fontStretch;
        if (style.fontVariantCaps) this.#ctx.fontVariantCaps = style.fontVariantCaps;
        if (style.wordSpacing) this.#ctx.wordSpacing = style.wordSpacing;

        this.#ctx.fillText(text, coordinates.x, coordinates.y, maxWidth);
    }

    strokeText(text: string, coordinates: Point, style: TextStyle, lineWidth: number = 1, maxWidth?: number) {
        this.#ctx.lineWidth = lineWidth;

        this.#ctx.font = style.font;
        this.#ctx.strokeStyle = style.color ?? 'black';
        this.#ctx.textAlign = style.textAlign ?? 'start';
        this.#ctx.textBaseline = style.textBaseline ?? 'alphabetic';
        if (style.direction) this.#ctx.direction = style.direction;
        if (style.letterSpacing) this.#ctx.letterSpacing = style.letterSpacing;
        if (style.fontKerning) this.#ctx.fontKerning = style.fontKerning;
        if (style.fontStretch) this.#ctx.fontStretch = style.fontStretch;
        if (style.fontVariantCaps) this.#ctx.fontVariantCaps = style.fontVariantCaps;
        if (style.wordSpacing) this.#ctx.wordSpacing = style.wordSpacing;

        this.#ctx.strokeText(text, coordinates.x, coordinates.y, maxWidth);
    }

    measureText(text: string, font: string): TextMetrics {
        this.#ctx.font = font;
        return this.#ctx.measureText(text);
    }
}
