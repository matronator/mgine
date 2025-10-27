import { assert, describe, it, vi } from 'vitest';
import Mgine from '../../src/index';

global.jest = vi;

describe("construct", () => {
    function initMgine(): Mgine {
        const canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
        document.body.appendChild(canvas);
        const mgine = new Mgine('test-canvas');
        return mgine;
    }

    it("should construct without errors", () => {
        const mgine = initMgine();
        assert.instanceOf(mgine, Mgine);
    });

    it("should throw error if canvas not found", () => {
        try {
            new Mgine('non-existent-canvas');
        } catch (err) {
            assert.instanceOf(err, Error);
            assert.strictEqual(err.message, 'Canvas with id "non-existent-canvas" not found');
        }
    });

    it("should throw error if context cannot be obtained", () => {
        const div = document.createElement('div');
        div.id = 'not-a-canvas';
        document.body.appendChild(div);
        try {
            new Mgine('not-a-canvas');
        } catch (err) {
            assert.instanceOf(err, Error);
            assert.strictEqual(err.message, 'Element with id "not-a-canvas" is not a canvas');
        }
    });

    it("should have canvas and ctx properties", () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'test-canvas-2';
        document.body.appendChild(canvas);
        const mgine = new Mgine('test-canvas-2');
        assert.instanceOf(mgine.canvas, HTMLCanvasElement);
        assert.instanceOf(mgine.ctx, CanvasRenderingContext2D);
    });
});
