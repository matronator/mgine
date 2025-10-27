import { assert, describe, it } from "vitest";
import { DrawingError, Path, PathError } from "../../src";

describe('Errors', () => {
    it('should throw DrawingError', () => {
        try {
            throw new DrawingError('test');
        } catch (err) {
            assert.instanceOf(err, DrawingError);
            assert.strictEqual(err.message, 'test');
        }
    });

    it('should throw PathError', () => {
        try {
            throw new PathError('test');
        } catch (err) {
            assert.instanceOf(err, PathError);
            assert.strictEqual(err.message, 'test');
        }
    });

    it('should throw PathError with segment', () => {
        const path = new Path({ x: 0, y: 0 });
        path.lineTo({ x: 10, y: 10 });
        path.bezierTo({ x: 20, y: 20 }, { x: 30, y: 30 }, { x: 40, y: 40 });
        try {
            throw new PathError(undefined, path.at(0));
        } catch (err) {
            assert.instanceOf(err, PathError);
            assert.deepEqual(err.segment, path.at(0), 'segment should be the same');
            assert.strictEqual(err.message, 'Invalid path segment: {"type":"line","from":{"x":0,"y":0},"to":{"x":10,"y":10},"drawn":true}');
        }

        try {
            throw new PathError('test', { type: 'line', from: {x: 0, y: 0}, to: {x: 0, y: 0}, drawn: false });
        } catch (err) {
            assert.instanceOf(err, PathError);
            assert.strictEqual(err.message, 'test: Invalid path segment: {"type":"line","from":{"x":0,"y":0},"to":{"x":0,"y":0},"drawn":false}');
        }
    });

    it('should throw PathError with segment and path', () => {
        const path = new Path({ x: 0, y: 0 });
        path.lineTo({ x: 10, y: 10 });
        path.quadraticTo({ x: 20, y: 20 }, { x: 30, y: 30 });
        try {
            throw new PathError(undefined, path.at(0), path);
        } catch (err) {
            assert.instanceOf(err, PathError);
            assert.deepEqual(err.path, path, 'path should be the same');
            assert.strictEqual(err.message, 'Invalid path segment at index 0: {"type":"line","from":{"x":0,"y":0},"to":{"x":10,"y":10},"drawn":true}');
        }

        try {
            throw new PathError('test', path.at(0), path);
        } catch (err) {
            assert.instanceOf(err, PathError);
            assert.strictEqual(err.message, 'test: Invalid path segment at index 0: {"type":"line","from":{"x":0,"y":0},"to":{"x":10,"y":10},"drawn":true}');
        }
    });
});
