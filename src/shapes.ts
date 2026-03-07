import { Graphics } from "./graphics";
import { Color, Dimensions, DrawingType, Origin, Point, Rect } from "./properties";

export abstract class Shape {
    graphics: Graphics;
    position: Point;
    origin: Origin;
    drawType: DrawingType;
    color: Color;

    constructor(graphics: Graphics, position: Point, origin: Origin, drawType: DrawingType, color: Color) {
        this.graphics = graphics;
        this.position = position;
        this.origin = origin;
        this.drawType = drawType;
        this.color = color;
    }

    get x(): number { return this.position.x; }
    set x(x: number) { this.position.x = x; }
    get y(): number { return this.position.y; }
    set y(y: number) { this.position.y = y; }

    abstract draw(): void;
}

export class Rectangle extends Shape {
    size: Dimensions;

    constructor(graphics: Graphics, rectangle: Rect, color: Color, drawType: DrawingType = 'fill') {
        super(graphics, { x: rectangle.x, y: rectangle.y }, 'top-left', drawType, color);
        this.size = { width: rectangle.width, height: rectangle.height };
    }

    draw(): void {
        this.graphics.rect({ x: this.position.x, y: this.position.y, width: this.size.width, height: this.size.height }, this.color, this.drawType ? 'fill' : 'stroke');
    }
}

export class Circle extends Shape {
    radius: number;

    constructor(graphics: Graphics, center: Point, radius: number, color: Color, drawType: DrawingType = 'fill') {
        super(graphics, center, 'center', drawType, color);
        this.radius = radius;
    }

    draw(): void {
        this.graphics.circle(this.position, this.radius, this.color, this.drawType ? 'fill' : 'stroke');
    }
}

export class Ellipse extends Shape {
    radius: Point;

    constructor(graphics: Graphics, center: Point, radius: Point, origin: 'center'|'top-left', color: Color, drawType: DrawingType = 'fill') {
        super(graphics, center, origin, drawType, color);
        this.radius = radius;
    }

    draw(): void {
        if (this.origin === 'center') {
            this.graphics.ellipseFromCenter(this.position, this.radius, this.color, this.drawType ? 'fill' : 'stroke');
        } else if (this.origin === 'top-left') {
            this.graphics.ellipse({ x: this.position.x - this.radius.x, y: this.position.y - this.radius.y }, { x: this.position.x + this.radius.x, y: this.position.y + this.radius.y }, this.color, this.drawType ? 'fill' : 'stroke');
        }
    }
}

export class Polygon extends Shape {
    size: Dimensions;
    points: Point[];

    constructor(graphics: Graphics, points: Point[], color: Color, drawType: DrawingType = 'fill') {
        let x = 0;
        let y = 0;
        points.forEach(point => {
            if (point.x < x) x = point.x;
            if (point.y < y) y = point.y;
        });

        super(graphics, { x, y }, 'top-left', drawType, color);
        this.points = points;

        this.size = { width: 0, height: 0 };
        this.points.forEach(point => {
            if (point.x > this.position.x + this.size.width) this.size.width = point.x - this.position.x;
            if (point.y > this.position.y + this.size.height) this.size.height = point.y - this.position.y;
        });
    }

    set x(x: number) {
        this.position.x = x;
        this.points.forEach(point => {
            point.x -= this.position.x - x;
        });
    }
    set y(y: number) {
        this.position.y = y;
        this.points.forEach(point => {
            point.y -= this.position.y - y;
        });
    }

    draw(): void {
        this.graphics.polygon(this.points, this.color, this.drawType ? 'fill' : 'stroke');
    }
}
