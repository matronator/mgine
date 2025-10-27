import { Path, Segment } from "./path";

export class PathError extends Error {
    segment?: Segment;
    path?: Path;

    constructor(message?: string, segment?: Segment, path?: Path) {
        if (segment) {
            if (!message) {
                message = '';
            } else {
                message += ': ';
            }
            if (path) {
                const segmentIndex = path.indexOf(segment);
                message += `Invalid path segment at index ${segmentIndex}: ${JSON.stringify(segment)}`;
            } else {
                message += `Invalid path segment: ${JSON.stringify(segment)}`;
            }
        }

        super(message);
        this.name = 'PathError';
        this.segment = segment;
        this.path = path;
    }
}

export class DrawingError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'DrawingError';
    }
}
