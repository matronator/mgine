import { Mgine } from "@/mgine";

export class MgineTesting {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    readonly mgine: Mgine;

    get canvas(): HTMLCanvasElement {
        return this.#canvas;
    }

    get ctx(): CanvasRenderingContext2D {
        return this.#ctx;
    }

    constructor(mgine: Mgine) {
        this.mgine = mgine;
        const canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
        canvas.width = mgine.canvas.width;
        canvas.height = mgine.canvas.height;
        canvas.style.width = mgine.canvas.style.width;
        canvas.style.height = mgine.canvas.style.height;
        document.body.appendChild(canvas);

        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d')!;

        if (mgine.options.pixelArt) {
            canvas.style.imageRendering = 'pixelated';
            this.#ctx.imageSmoothingEnabled = false;
        }
    }

    clear() {
        this.mgine.clear();
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }
}
