import { PathError } from "./errors";
import { copyPoint, Point } from "./properties";
import { deepClone } from "./utils";

export interface Line {
    type: 'line';
    from: Point;
    to: Point;
    drawn: boolean;
}

export interface QuadraticCurve {
    type: 'quadratic';
    from: Point;
    to: Point;
    cp1: Point;
}

export interface BezierCurve {
    type: 'bezier';
    from: Point;
    to: Point;
    cp1: Point;
    cp2: Point;
}

export type Curve = QuadraticCurve | BezierCurve;

export type SegmentType = 'line' | 'quadratic' | 'bezier';

export class Segment {
    type: SegmentType;
    from: Point;
    to: Point;
    cp1?: Point;
    cp2?: Point;
    drawn: boolean = true;

    constructor(type: SegmentType, from: Point, to: Point, cp1?: Point, cp2?: Point, drawn: boolean = true) {
        this.type = type;
        this.from = { ...from };
        this.to = { ...to };
        this.cp1 = cp1 ? { ...cp1 } : undefined;
        this.cp2 = cp2 ? { ...cp2 } : undefined;
        this.drawn = drawn;
    }

    static FromObject(segment: Line | QuadraticCurve | BezierCurve) {
        if (segment.type === 'line') {
            return new Segment('line', { ...segment.from }, { ...segment.to }, undefined, undefined, segment.drawn);
        } else if (segment.type === 'quadratic') {
            return new Segment('quadratic', { ...segment.from }, { ...segment.to }, { ...segment.cp1 }, undefined);
        } else if (segment.type === 'bezier') {
            return new Segment('bezier', { ...segment.from }, { ...segment.to }, { ...segment.cp1 }, { ...segment.cp2 });
        }

        throw new PathError('Invalid segment type.', segment);
    }

    toString(): string {
        switch (this.type) {
            case 'line':
                if (this.drawn) {
                    return `Line from (${this.from.x}, ${this.from.y}) to (${this.to.x}, ${this.to.y})`;
                }
                return `Starting new sub-path at (${this.to.x}, ${this.to.y})`;
            case 'quadratic':
                return `Quadratic curve from (${this.from.x}, ${this.from.y}) to (${this.to.x}, ${this.to.y}) with control point (${this.cp1!.x}, ${this.cp1!.y})`;
            case 'bezier':
                return `Bezier curve from (${this.from.x}, ${this.from.y}) to (${this.to.x}, ${this.to.y}) with control points (${this.cp1!.x}, ${this.cp1!.y}) and (${this.cp2!.x}, ${this.cp2!.y})`;
            default:
                return 'Unknown segment';
        }
    }
}

export class Path {
    start: Point;
    end: Point;
    #segments: Segment[] = [];
    closed: boolean = false;

    constructor(startPosition: Point) {
        this.start = { ...startPosition };
        this.end = { ...startPosition };
    }

    /**
     * Creates a new Path from a list of segments.
     */
    static FromSegments(closed: boolean = false, ...segments: Segment[]): Path {
        const path = new Path({ ...segments[0].from });
        path.#segments = deepClone(segments);
        path.start = { ...segments[0].from };
        path.end = { ...segments[segments.length - 1].to };
        path.closed = closed;

        return path;
    }

    /**
     * Moves the cursor to the given position.
     */
    moveTo(coordinates: Point): this {
        this.#segments.push(Segment.FromObject({ type: 'line', from: { ...this.end }, to: { ...coordinates }, drawn: false }));
        this.end = { ...coordinates };
        return this;
    }

    /**
     * Draws a line from the current position to the given position.
     */
    lineTo(coordinates: Point): this {
        this.#segments.push(Segment.FromObject({ type: 'line', from: { ...this.end }, to: { ...coordinates }, drawn: true }));
        this.end = { ...coordinates };
        return this;
    }

    /**
     * Draws a quadratic curve from the current position to the given position.
     */
    quadraticTo(coordinates: Point, cp: Point): this {
        this.#segments.push(Segment.FromObject({ type: 'quadratic', from: { ...this.end }, to: { ...coordinates }, cp1: { ...cp } }));
        this.end = { ...coordinates };
        return this;
    }

    /**
     * Draws a bezier curve from the current position to the given position.
     */
    bezierTo(coordinates: Point, cp1: Point, cp2: Point): this {
        this.#segments.push(Segment.FromObject({ type: 'bezier', from: { ...this.end }, to: { ...coordinates }, cp1: { ...cp1 }, cp2: { ...cp2 } }));
        this.end = { ...coordinates };
        return this;
    }

    close(): this {
        this.closed = true;
        return this;
    }

    open(): this {
        this.closed = false;
        return this;
    }

    // Array functions

    clear(): this {
        this.#segments = [];
        this.end = { ...this.start };
        return this;
    }

    /**
     * Creates a deep clone of the path.
     */
    clone(): Path {
        return Path.FromSegments(this.closed, ...this.#segments);
    }

    /**
     * Returns the number of segments in the path.
     */
    get length(): number {
        return this.#segments.length;
    }

    /**
     * Returns a string representation of the path.
     */
    toString(): string {
        return `Path with ${this.#segments.length} segment${this.#segments.length > 1 ? 's' : ''}:\n` + this.#segments.map((segment, index) => {
            return `${index+1}. ${segment}`;
        }).join('\n');
    }

    /**
     * Removes the last segment from the path and returns it. If the path is empty, undefined is returned and the path is not modified.
     */
    pop(): Segment | undefined {
        const popped = this.#segments.pop();
        if (popped) {
            this.end = { ...popped.from };
        }
        return popped;
    }

    /**
     * Appends new segments to the end of the path and returns the new length of the path.
     * @param items — New segments to add to the path.
     */
    push(...items: Segment[]): number {
        this.end = { ...items[items.length - 1].to };
        return this.#segments.push(...items);
    }

    /**
     * Returns a new path that is the result of concatenating the current path with the given segments or paths.
     * @param items — Segments or paths to concatenate to the current path.
     * @returns A new path that is the result of concatenating the current path with the given segments or paths.
     */
    concat(...items: Segment[]|Path[]): Path {
        const path = new Path(this.start);
        items.forEach(item => {
            if (item instanceof Path) {
                path.push(...item.#segments);
            } else {
                path.push(item);
            }
        });

        return path;
    }

    /**
     * Reverses the segments in the path in place. This method mutates the path and returns a reference to the same path.
     */
    reverse(): this {
        const end = { ...this.end };
        this.end = { ...this.start };
        this.start = { ...end };
        this.#segments = this.#segments.reverse();
        this.#segments.map(segment => {
            const temp = { ...segment.from };
            segment.from = { ...segment.to };
            segment.to = { ...temp };
            return segment;
        });
        return this;
    }

    /**
     * Removes the first segment from the path and returns it. If the path is empty, undefined is returned and the path is not modified.
     */
    shift(): Segment | undefined {
        return this.#segments.shift();
    }

    /**
     * Appends new segments to the beginning of the path and returns the new length of the path.
     * @param items — New segments to add to the beginning of the path.
     * @returns The new length of the path.
     */
    unshift(...items: Segment[]): number {
        return this.#segments.unshift(...items);
    }

    /**
     * Returns a shallow copy of a portion of the path into a new array object. For both start and end, a negative index can be used to indicate an offset from the end of the path. For example, -2 refers to the second to last segment of the path.
     * @param start — The beginning of the specified portion of the original path. If start is undefined, then the slice begins at index 0.
     * @param end — The end of the specified portion of the original path. If end is undefined, then the slice extends to the end of the path.
     * @returns A new array containing the segments in the specified portion of the original path.
     */
    slice(start?: number, end?: number): Segment[] {
        return this.#segments.slice(start, end);
    }

    /**
     * Sorts the path segments in place. This method mutates the path and returns a reference to the same path.
     * @param compareFn — Function used to determine the order of the segments. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
     */
    sort(compareFn?: ((a: Segment, b: Segment) => number) | undefined): this {
        this.#segments = this.#segments.sort(compareFn);
        return this;
    }

    /**
     * Removes segments from path and, if necessary, inserts new segments in their place, returning the deleted segments.
     * @param start The zero-based location in the path from which to start removing segments.
     * @param deleteCount The number of segments to remove.
     * @returns An array containing the segments that were deleted.
     */
    splice(start: number, deleteCount: number): Segment[];
    /**
     * Removes segments from path and, if necessary, inserts new segments in their place, returning the deleted segments.
     * @param start The zero-based location in the path from which to start removing segments.
     * @param deleteCount The number of segments to remove.
     * @param items Segments to insert into the path in place of the deleted segments.
     * @returns An array containing the segments that were deleted.
     */
    splice(start: number, deleteCount: number, ...items: Segment[]): Segment[];
    splice(start: number, deleteCount: number, ...items: Segment[]): Segment[] {
        return this.#segments.splice(start, deleteCount, ...items);
    }

    /**
     * Returns the index of the first occurrence of a segment in the path, or -1 if it is not present.
     * @param searchElement — The segment to locate in the path.
     * @param fromIndex — The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    indexOf(searchElement: Segment, fromIndex?: number): number {
        return this.#segments.indexOf(searchElement, fromIndex);
    }

    /**
     * Returns the index of the last occurrence of a segment in the path, or -1 if it is not present.
     * @param searchElement — The segment to locate in the path.
     * @param fromIndex — The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the path's segment array.
     */
    lastIndexOf(searchElement: Segment, fromIndex?: number): number {
        return this.#segments.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * Determines whether all the segments in the path pass the test implemented by the provided function.
     * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each segment in the path until the predicate returns a value which is coercible to the Boolean value false, or until the end of the path.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: Segment, index: number, array: Segment[]) => unknown, thisArg?: any): boolean {
        return this.#segments.every(predicate, thisArg);
    }

    /**
     * Determines whether the specified callback function returns true for any segment of the path.
     * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each segment in the path until the predicate returns a value which is coercible to the Boolean value true, or until the end of the path.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: Segment, index: number, array: Segment[]) => unknown, thisArg?: any): boolean {
        return this.#segments.some(predicate, thisArg);
    }

    /**
     * Performs the specified action for each segment in the path.
     * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each segment in the path.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: Segment, index: number, array: Segment[]) => void, thisArg?: any): this {
        this.#segments.forEach(callbackfn, thisArg);
        return this;
    }

    /**
     * Calls a defined callback function on each segment of the path, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each segment in the path.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: Segment, index: number, array: Segment[]) => U, thisArg?: any): U[] {
        return this.#segments.map(callbackfn, thisArg);
    }

    /**
     * Returns the segments of the path that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each segment in the path.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: Segment, index: number, array: Segment[]) => unknown, thisArg?: unknown): Segment[] {
        return this.#segments.filter(predicate, thisArg);
    }

    /**
     * Calls the specified callback function for all segments in the path. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each segment in the path.
     */
    reduce(callbackfn: (previousValue: Segment, currentValue: Segment, currentIndex: number, array: Segment[]) => Segment): Segment {
        return this.#segments.reduce(callbackfn);
    }

    /**
     * Determines whether the path includes a certain segment, returning true or false as appropriate.
     * @param searchElement The segment to search for.
     * @param fromIndex The position in this path at which to begin searching for searchElement.
     */
    includes(searchElement: Segment, fromIndex?: number): boolean {
        return this.#segments.includes(searchElement, fromIndex);
    }

    /**
     * Returns the segment located at the specified index.
     * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
     */
    at(index: number): Segment | undefined {
        return this.#segments.at(index);
    }

    /**
     * Returns the value of the first segment in the path where predicate is true, and undefined otherwise.
     * @param predicate find calls predicate once for each segment of the path, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: Segment, index: number, obj: Segment[]) => unknown, thisArg?: any): Segment | undefined {
        return this.#segments.find(predicate, thisArg);
    }

    /**
     * Returns the index of the first segment in the path where predicate is true, and -1 otherwise.
     * @param predicate find calls predicate once for each segment of the path, in ascending order, until it finds one where predicate returns true. If such a segment is found, findIndex immediately returns that segment index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: Segment, index: number, obj: Segment[]) => unknown, thisArg?: any): number {
        return this.#segments.findIndex(predicate, thisArg);
    }

    /**
     * Returns the value of the last segment in the path where predicate is true, and undefined otherwise.
     * @param predicate findLast calls predicate once for each segment of the path, in descending order, until it finds one where predicate returns true. If such a segment is found, findLast immediately returns that segment value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
     */
    findLast(predicate: (value: Segment, index: number, array: Segment[]) => unknown, thisArg?: any): Segment | undefined {
        return this.#segments.findLast(predicate, thisArg);
    }

    /**
     * Returns the index of the last segment in the path where predicate is true, and -1 otherwise.
     * @param predicate findLastIndex calls predicate once for each segment of the path, in descending order, until it finds one where predicate returns true. If such a segment is found, findLastIndex immediately returns that segment index. Otherwise, findLastIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
     */
    findLastIndex(predicate: (value: Segment, index: number, array: Segment[]) => unknown, thisArg?: any): number {
        return this.#segments.findLastIndex(predicate, thisArg);
    }

    /**
     * Returns an iterable of key, value pairs for every segment in the path
     */
    entries(): ArrayIterator<[number, Segment]> {
        return this.#segments.entries();
    }

    /**
     * Returns an iterable of keys in the path
     */
    keys(): ArrayIterator<number> {
        return this.#segments.keys();
    }

    /**
     * Returns an iterable of values in the path
     */
    values(): ArrayIterator<Segment> {
        return this.#segments.values();
    }

    /**
     * Returns a copy of the path with its elements reversed.
     */
    toReversed(): Path {
        const path = this.clone();
        const temp = { ...path.start };
        path.start = { ...path.end };
        path.end = { ...temp };
        // const reversed = path.#segments.toReversed();
        path.#segments = path.#segments.toReversed();
        path.map(segment => {
            const temp = { ...segment.from };
            segment.from = { ...segment.to };
            segment.to = { ...temp };
            return segment;
        });
        return path;
    }

    /**
     * Returns a sorted copy of the path.
     * @param compareFn Function used to determine the order of the segments. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the segments are sorted in ascending, UTF-16 code unit order.
     */
    toSorted(compareFn?: ((a: Segment, b: Segment) => number) | undefined): Path {
        const path = this.clone();
        path.#segments = this.#segments.toSorted(compareFn);
        return path;
    }

    /**
     * Copies a path and removes segments while returning the remaining segments.
     * @param start The zero-based location in the path from which to start removing segments.
     * @param deleteCount The number of segments to remove.
     * @returns A copy of the original path with the remaining segments.
     */
    toSpliced(start: number, deleteCount?: number): Path;
    /**
     * Copies a path and removes segments and, if necessary, inserts new segments in their place. Returns the copied path.
     * @param start The zero-based location in the path from which to start removing segments.
     * @param deleteCount The number of segments to remove.
     * @param items Elements to insert into the copied path in place of the deleted segments.
     * @returns The copied path.
     */
    toSpliced(start: number, deleteCount: number, ...items: Segment[]): Path;
    toSpliced(start: number, deleteCount: number, ...items: Segment[]): Path {
        const path = this.clone();
        path.#segments = this.#segments.toSpliced(start, deleteCount, ...items);
        return path;
    }

    /**
     * Copies the path, then overwrites the value at the provided index with the given value. If the index is negative, then it replaces from the end of the path.
     * @param index The index of the value to overwrite. If the index is negative, then it replaces from the end of the path.
     * @param value The value to write into the copied path.
     * @returns The copied path with the updated value.
     */
    with(index: number, value: Segment): Path {
        const path = this.clone();
        path.#segments = this.#segments.with(index, value);
        return path;
    }
}
