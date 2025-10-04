import { assert, describe, it } from 'vitest';
import { Mgine } from '../src/index';

describe("construct", () => {
    it("should construct without errors", () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
        document.body.appendChild(canvas);
        const mgine = new Mgine('test-canvas');
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

    // it("should fill rectangle correctly", () => {
    //     const canvas = document.createElement('canvas');
    //     canvas.height = 100;
    //     canvas.width = 100;
    //     canvas.id = 'test-canvas-3';
    //     document.body.appendChild(canvas);
    //     const mgine = new Mgine('test-canvas-3');
    //     mgine.fillRect({ x: 0, y: 0 }, { width: 50, height: 50 }, 'rgba(255, 0, 0, 1)');
    //     const imageData = mgine.ctx.getImageData(11, 11, 1, 1).data;
    //     console.log(imageData);
    //     assert.strictEqual(imageData[0], 255); // Red
    //     assert.strictEqual(imageData[1], 0);   // Green
    //     assert.strictEqual(imageData[2], 0);   // Blue
    //     assert.strictEqual(imageData[3], 255); // Alpha
    // });
});
