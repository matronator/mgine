import { ConicGradient, LinearGradient, RadialGradient } from "./gradient";
import { Graphics } from "./graphics";
import { Path } from "./path";
import { Point, ColorStop } from "./properties";

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

    reset() {
        this.#ctx.reset();
        if (this.#options?.pixelArt) {
            this.#ctx.imageSmoothingEnabled = false;
        }
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
}
