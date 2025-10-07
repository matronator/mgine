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

export interface MgineOptions {
    pixelArt?: boolean;
    fillAvailableSpace?: boolean;
    width?: number;
    height?: number;
}

export class Mgine {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;

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
        if (options?.pixelArt) {
            canvas.style.imageRendering = 'pixelated';
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        return { canvas, ctx };
    }

    static Init(id: string, options?: MgineOptions): Mgine {
        return new Mgine(id, options);
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

    clear() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawImage(src: string, coordinates: Point|'center', scale?: Scale): void;
    drawImage(src: string, coordinates: Point|'center', size?: Size): void;
    drawImage(src: string, coordinates: Point|'center', sizeOrScale?: Size|Scale): void {
        const img = new Image();
        img.src = src;

        img.addEventListener('load', () => {
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

            this.#ctx.drawImage(img, newCoords.x, newCoords.y);
        });
    }

    fillText(text: string, coordinates: Point, font: string, color: string, textAlign: CanvasTextAlign = 'start', textBaseline: CanvasTextBaseline = 'alphabetic', maxWidth?: number) {
        this.#ctx.font = font;
        this.#ctx.fillStyle = color;
        this.#ctx.textAlign = textAlign;
        this.#ctx.textBaseline = textBaseline;
        this.#ctx.fillText(text, coordinates.x, coordinates.y, maxWidth);
    }

    strokeText(text: string, coordinates: Point, font: string, color: string, lineWidth: number = 1, textAlign: CanvasTextAlign = 'start', textBaseline: CanvasTextBaseline = 'alphabetic', maxWidth?: number) {
        this.#ctx.font = font;
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.textAlign = textAlign;
        this.#ctx.textBaseline = textBaseline;
        this.#ctx.strokeText(text, coordinates.x, coordinates.y, maxWidth);
    }

    measureText(text: string, font: string): TextMetrics {
        this.#ctx.font = font;
        return this.#ctx.measureText(text);
    }

    progressBar(coordinates: Point, size: Size, progress: number, backgroundColor: string = 'lightgray', progressColor: string = 'green', borderColor?: string, borderWidth: number = 1) {
        // Draw background
        this.fillRect(coordinates, size, backgroundColor);

        // Draw progress
        const progressWidth = Math.max(0, Math.min(1, progress)) * size.width;
        this.fillRect(coordinates, { width: progressWidth, height: size.height }, progressColor);

        // Draw border if specified
        if (borderColor) {
            this.strokeRect(coordinates, size, borderColor, borderWidth);
        }
    }
}
