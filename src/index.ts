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

        let newCoords = coordinates !== 'center' ? coordinates : { x: (this.#canvas.width - img.width) / 2, y: (this.#canvas.height - img.height) / 2 };

        img.addEventListener('load', () => {
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
}
