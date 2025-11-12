import { DrawingError } from "./errors";
import { Mgine } from "./mgine";
import { Path } from "./path";
import { Color, DefaultLineStyle, DefaultShadow, Dimensions, DrawingType, LineStyle, Point, Rectangle, Scale, Shadow, TextStyle } from "./properties";
import { isString } from "./utils";

export class Graphics {
    #ctx: CanvasRenderingContext2D;

    get ctx(): CanvasRenderingContext2D { return this.#ctx; }

    constructor(ctx: CanvasRenderingContext2D) {
        this.#ctx = ctx;
    }

    setLineStyle(lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.lineWidth = lineStyle.width;
        this.#ctx.lineCap = lineStyle.cap ?? 'butt';
        this.#ctx.lineJoin = lineStyle.join ?? 'miter';
        this.#ctx.setLineDash(lineStyle.dash?.pattern ?? []);
        this.#ctx.lineDashOffset = lineStyle.dash?.offset ?? 0;
    }

    setTextStyle(textStyle: TextStyle) {
        this.#ctx.font = textStyle.font ?? `${isString(Mgine.DefaultFontSize) ? Mgine.DefaultFontSize : Mgine.DefaultFontSize + 'px'} ${Mgine.DefaultFontFamily}`;
        this.#ctx.textAlign = textStyle.textAlign ?? 'start';
        this.#ctx.textBaseline = textStyle.textBaseline ?? 'alphabetic';
        this.#ctx.direction = textStyle.direction ?? 'inherit';
        this.#ctx.letterSpacing = textStyle.letterSpacing ?? '0px';
        this.#ctx.fontKerning = textStyle.fontKerning ?? 'auto';
        this.#ctx.fontStretch = textStyle.fontStretch ?? 'normal';
        this.#ctx.fontVariantCaps = textStyle.fontVariantCaps ?? 'normal';
        this.#ctx.wordSpacing = textStyle.wordSpacing ?? '0px';
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

    clearRect(rect: Rectangle) {
        this.#ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    }

    pointsToPath(points: Point[], closed: boolean = false): Path {
        if (points.length === 0) {
            throw new DrawingError('No points provided');
        }
        const path = Mgine.CreatePath(points[0]);
        points.shift();
        points.forEach(point => path.lineTo(point));
        if (closed) path.close();
        path.construct(this.#ctx);
        return path;
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

    rect(rect: Rectangle, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        if (type === 'fill') {
            this.fillRect(rect, color);
        } else if (type === 'stroke') {
            this.strokeRect(rect, color, lineStyle);
        }
    }

    polygon(points: Point[], color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.pointsToPath(points);
        if (type === 'fill') {
            this.#ctx.fillStyle = color;
            this.#ctx.fill();
        } else if (type === 'stroke') {
            this.#ctx.strokeStyle = color;
            this.setLineStyle(lineStyle);
            this.#ctx.stroke();
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

    circle(center: Point, radius: number, color: Color, drawingType: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        if (drawingType === 'fill') {
            this.fillCircle(center, radius, color);
        } else if (drawingType === 'stroke') {
            this.strokeCircle(center, radius, color, lineStyle);
        }
    }

    partialEllipse(center: Point, radius: Point, rotation: number = 0, startAngle: number = 0, endAngle: number = Math.PI * 2, counterClockwise: boolean = false, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.beginPath();
        this.#ctx.ellipse(center.x, center.y, radius.x, radius.y, rotation, startAngle, endAngle, counterClockwise);
        if (type === 'fill') {
            this.#ctx.fillStyle = color;
            this.#ctx.fill();
        } else if (type === 'stroke') {
            this.#ctx.strokeStyle = color;
            this.setLineStyle(lineStyle);
            this.#ctx.stroke();
        }
    }

    ellipse(xy1: Point, xy2: Point, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        const center: Point = { x: (xy1.x + xy2.x) / 2, y: (xy1.y + xy2.y) / 2 };
        const radius: Point = { x: Math.abs(xy2.x - xy1.x) / 2, y: Math.abs(xy2.y - xy1.y) / 2 };
        this.partialEllipse(center, radius, 0, 0, Math.PI * 2, false, color, type, lineStyle);
    }

    ellipseFromCenter(center: Point, radius: Point, color: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.partialEllipse(center, radius, 0, 0, Math.PI * 2, false, color, type, lineStyle);
    }

    // Paths

    line(from: Point, to: Point, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(from.x, from.y);
        this.#ctx.lineTo(to.x, to.y);
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.#ctx.stroke();
    }

    bezierCurve(from: Point, control1: Point, control2: Point, to: Point, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(from.x, from.y);
        this.#ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, to.x, to.y);
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.#ctx.stroke();
    }

    quadraticCurve(from: Point, control: Point, to: Point, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(from.x, from.y);
        this.#ctx.quadraticCurveTo(control.x, control.y, to.x, to.y);
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.#ctx.stroke();
    }

    curve(strokeStyle: Color, from: Point, to: Point, control1: Point, control2?: Point, lineStyle: LineStyle = DefaultLineStyle) {
        if (control2) {
            this.bezierCurve(from, control1, control2, to, strokeStyle, lineStyle);
        } else {
            this.quadraticCurve(from, control1, to, strokeStyle, lineStyle);
        }
    }

    linearPath(points: Point[], strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        this.pointsToPath(points);
        this.#ctx.stroke();
    }

    fillPath(path: Path, fillStyle: Color) {
        this.#ctx.fillStyle = fillStyle;
        path.construct(this.#ctx);
        this.#ctx.fill();
    }

    strokePath(path: Path, strokeStyle: Color, lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.strokeStyle = strokeStyle;
        this.setLineStyle(lineStyle);
        path.construct(this.#ctx);
        this.#ctx.stroke();
    }

    path(path: Path, color: Color, type: DrawingType = 'stroke', lineStyle: LineStyle = DefaultLineStyle) {
        if (type === 'fill') {
            this.fillPath(path, color);
        } else if (type === 'stroke') {
            this.strokePath(path, color, lineStyle);
        }
    }

    arc(center: Point, radius: number, startAngle: number, endAngle: number, counterClockwise: boolean = false, style: Color, type: DrawingType = 'fill', lineStyle: LineStyle = DefaultLineStyle) {
        this.#ctx.beginPath();
        this.#ctx.arc(center.x, center.y, radius, startAngle, endAngle, counterClockwise);
        if (type === 'fill') {
            this.#ctx.fillStyle = style;
            this.#ctx.fill();
        } else if (type === 'stroke') {
            this.#ctx.strokeStyle = style;
            this.setLineStyle(lineStyle);
            this.#ctx.stroke();
        }
    }

    // Progress Bars

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

    // Images

    drawImage(img: HTMLImageElement, coordinates: Point): void;
    drawImage(img: HTMLImageElement, coordinates: Point, scale?: Scale): void;
    drawImage(img: HTMLImageElement, coordinates: Point, size?: Dimensions): void;
    drawImage(img: HTMLImageElement, coordinates: Point, sizeOrScale?: Dimensions|Scale): void;
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

    // Text

    fillText(text: string, coordinates: Point, textStyle: TextStyle, maxWidth?: number) {
        this.setTextStyle(textStyle);
        this.#ctx.fillStyle = textStyle.color ?? 'black';
        this.#ctx.fillText(text, coordinates.x, coordinates.y, maxWidth);
    }

    strokeText(text: string, coordinates: Point, textStyle: TextStyle, lineStyle: LineStyle = DefaultLineStyle, maxWidth?: number) {
        this.setLineStyle(lineStyle);
        this.setTextStyle(textStyle);
        this.#ctx.strokeStyle = textStyle.color ?? 'black';
        this.#ctx.strokeText(text, coordinates.x, coordinates.y, maxWidth);
    }

    measureText(text: string, textStyle: TextStyle): TextMetrics {
        this.setTextStyle(textStyle);
        return this.#ctx.measureText(text);
    }
}
