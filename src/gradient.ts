import { GradientError } from "./errors";
import { ColorStop, GradientType, Point } from "./properties";

export interface GradientProps {
    colorStops?: ColorStop[];
    from?: Point;
    to?: Point;
    fromRadius?: number;
    toRadius?: number;
    startAngle?: number;
    center?: Point;
}

export abstract class AbstractGradient {
    #ctx: CanvasRenderingContext2D;
    #gradient: CanvasGradient;
    #colorStops: ColorStop[] = [];

    get ctx(): CanvasRenderingContext2D { return this.#ctx; }

    get style(): CanvasGradient { return this.#gradient; }
    protected set style(gradient: CanvasGradient) {
        this.#gradient = gradient;
    }

    get colorStops() { return this.#colorStops; }

    getStyle(): CanvasGradient { return this.#gradient; }

    constructor(ctx: CanvasRenderingContext2D, props: GradientProps = {}) {
        this.#ctx = ctx;
        this.#colorStops = props.colorStops ?? [];
        this.#gradient = new CanvasGradient();
    }

    addColorStop(offset: number, color: string) {
        this.#gradient.addColorStop(offset, color);
        this.#colorStops.push({ offset, color });
    }

    removeColorStop(offset: number) {
        this.#colorStops = this.#colorStops.filter(stop => stop.offset !== offset);
    }

    removeColorStopByIndex(index: number) {
        const toRemove = this.#colorStops.splice(index, 1);
        this.removeColorStop(toRemove[0].offset);
    }
}

export class Gradient extends AbstractGradient {
    constructor(ctx: CanvasRenderingContext2D, type: GradientType = 'linear', props: GradientProps = {}) {
        super(ctx, props);
        switch (type) {
            case 'linear':
                if (!props.from || !props.to) {
                    throw new GradientError('Linear gradient requires "from" and "to" properties.', props);
                }
                this.style = this.linearGradient(props.from, props.to, props.colorStops ?? []);
                break;
            case 'radial':
                if (!props.from || !props.to || !props.fromRadius || !props.toRadius) {
                    throw new GradientError('Radial gradient requires "from", "to", "fromRadius" and "toRadius" properties.', props);
                }
                this.style = this.radialGradient(props.from, props.fromRadius, props.to, props.toRadius, props.colorStops ?? []);
                break;
            case 'conic':
                if (!props.startAngle || !props.center) {
                    throw new GradientError('Conic gradient requires "startAngle" and "center" properties.', props);
                }
                this.style = this.conicGradient(props.startAngle, props.center, props.colorStops ?? []);
                break;
            default:
                throw new GradientError(`Unknown gradient type "${type}".`);
        }
    }

    static Linear(ctx: CanvasRenderingContext2D, from: Point, to: Point, colorStops: ColorStop[] = []): LinearGradient {
        return new LinearGradient(ctx, from, to, colorStops);
    }

    static Radial(ctx: CanvasRenderingContext2D, from: Point, fromRadius: number, to: Point, toRadius: number, colorStops: ColorStop[] = []): RadialGradient {
        return new RadialGradient(ctx, from, fromRadius, to, toRadius, colorStops);
    }

    static Conic(ctx: CanvasRenderingContext2D, startAngle: number, center: Point, colorStops: ColorStop[] = []): ConicGradient {
        return new ConicGradient(ctx, startAngle, center, colorStops);
    }

    linearGradient(from: Point, to: Point, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    radialGradient(from: Point, fromRadius: number, to: Point, toRadius: number, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.ctx.createRadialGradient(from.x, from.y, fromRadius, to.x, to.y, toRadius);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    conicGradient(startAngle: number, center: Point, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.ctx.createConicGradient(startAngle, center.x, center.y);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }
}

export class LinearGradient extends AbstractGradient {
    #from: Point;
    #to: Point;

    constructor(ctx: CanvasRenderingContext2D, from: Point, to: Point, colorStops: ColorStop[] = []) {
        super(ctx, { from, to, colorStops });
        this.#from = from;
        this.#to = to;
        this.style = this.create(from, to, colorStops);
    }

    create(from: Point, to: Point, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    get from(): Point { return this.#from; }
    set from(from: Point) {
        this.#from = from;
        this.style = this.create(from, this.#to, this.colorStops);
    }

    get to(): Point { return this.#to; }
    set to(to: Point) {
        this.#to = to;
        this.style = this.create(this.#from, to, this.colorStops);
    }

    override addColorStop(offset: number, color: string): void {
        super.addColorStop(offset, color);
        this.style = this.create(this.#from, this.#to, this.colorStops);
    }

    removeColorStop(offset: number) {
        super.removeColorStop(offset);
        this.style = this.create(this.#from, this.#to, this.colorStops);
    }
}

export class RadialGradient extends AbstractGradient {
    #from: Point;
    #fromRadius: number;
    #to: Point;
    #toRadius: number;

    constructor(ctx: CanvasRenderingContext2D, from: Point, fromRadius: number, to: Point, toRadius: number, colorStops: ColorStop[] = []) {
        super(ctx, { from, fromRadius, to, toRadius, colorStops });
        this.#from = from;
        this.#fromRadius = fromRadius;
        this.#to = to;
        this.#toRadius = toRadius;
        this.style = this.create(from, fromRadius, to, toRadius, colorStops);
    }

    create(from: Point, fromRadius: number, to: Point, toRadius: number, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.ctx.createRadialGradient(from.x, from.y, fromRadius, to.x, to.y, toRadius);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    get from(): Point { return this.#from; }
    set from(from: Point) {
        this.#from = from;
        this.style = this.create(from, this.#fromRadius, this.#to, this.#toRadius, this.colorStops);
    }

    get fromRadius(): number { return this.#fromRadius; }
    set fromRadius(fromRadius: number) {
        this.#fromRadius = fromRadius;
        this.style = this.create(this.#from, fromRadius, this.#to, this.#toRadius, this.colorStops);
    }

    get to(): Point { return this.#to; }
    set to(to: Point) {
        this.#to = to;
        this.style = this.create(this.#from, this.#fromRadius, to, this.#toRadius, this.colorStops);
    }

    get toRadius(): number { return this.#toRadius; }
    set toRadius(toRadius: number) {
        this.#toRadius = toRadius;
        this.style = this.create(this.#from, this.#fromRadius, this.#to, toRadius, this.colorStops);
    }

    addColorStop(offset: number, color: string): void {
        super.addColorStop(offset, color);
        this.style = this.create(this.#from, this.#fromRadius, this.#to, this.#toRadius, this.colorStops);
    }

    removeColorStop(offset: number) {
        super.removeColorStop(offset);
        this.style = this.create(this.#from, this.#fromRadius, this.#to, this.#toRadius, this.colorStops);
    }
}

export class ConicGradient extends AbstractGradient {
    #startAngle: number;
    #center: Point;

    constructor(ctx: CanvasRenderingContext2D, startAngle: number, center: Point, colorStops: ColorStop[] = []) {
        super(ctx, { startAngle, center, colorStops });
        this.#startAngle = startAngle;
        this.#center = center;
        this.style = this.create(startAngle, center, colorStops);
    }

    create(startAngle: number, center: Point, colorStops: ColorStop[]): CanvasGradient {
        const gradient = this.ctx.createConicGradient(startAngle, center.x, center.y);
        colorStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        return gradient;
    }

    get startAngle(): number { return this.#startAngle; }
    set startAngle(startAngle: number) {
        this.#startAngle = startAngle;
        this.style = this.create(startAngle, this.#center, this.colorStops);
    }

    get center(): Point { return this.#center; }
    set center(center: Point) {
        this.#center = center;
        this.style = this.create(this.#startAngle, center, this.colorStops);
    }

    addColorStop(offset: number, color: string): void {
        super.addColorStop(offset, color);
        this.style = this.create(this.#startAngle, this.#center, this.colorStops);
    }

    removeColorStop(offset: number) {
        super.removeColorStop(offset);
        this.style = this.create(this.#startAngle, this.#center, this.colorStops);
    }
}
