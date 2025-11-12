import { Graphics } from "./graphics";
import { Color, DefaultLineStyle, DrawingType, LineStyle, Point, Rectangle } from "./properties";

export class Entity implements Drawable {
    id: string;
    x: number;
    y: number;
    #ctx: CanvasRenderingContext2D;
    #width: number = 0;
    #height: number = 0;
    graphics: Graphics;
    boundingBox: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
    path: Path2D;

    get width() { return this.#width; }
    get height() { return this.#height; }

    constructor(id: string, ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.id = id;
        this.#ctx = ctx;
        this.x = x;
        this.y = y;
        this.path = new Path2D();
        this.graphics = new Graphics(ctx);
    }

    draw() {
        this.path = new Path2D();
        this.path.rect(this.x, this.y, this.#width, this.#height);
        this.#ctx.stroke(this.path);
    }
}

export interface Drawable {
    draw(): void
}
