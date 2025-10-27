import { assert, assertType, describe, it, onTestFailed, vi } from "vitest";
import Mgine, { Path, Segment } from "../../src";

global.jest = vi;

describe('Paths', () => {
    function initMgine(): Mgine {
        const canvas = document.createElement('canvas');
        canvas.id = 'test-canvas';
        document.body.appendChild(canvas);
        const mgine = new Mgine('test-canvas');
        return mgine;
    }

    it('should create new Path', () => {
        const mgine = initMgine();
        const path = mgine.createPath({ x: 0, y: 0 });
        assert.instanceOf(path, Path);
    });

    it('should create new Path with segments', () => {
        const mgine = initMgine();
        const path = mgine.createPath({ x: 0, y: 0 });
        path.lineTo({ x: 10, y: 10 });
        path.quadraticTo({ x: 20, y: 20 }, { x: 30, y: 30 });
        path.bezierTo({ x: 40, y: 40 }, { x: 50, y: 50 }, { x: 60, y: 60 });
        assert.strictEqual(path.length, 3);
    });

    it('should do something for each segment', () => {
        const mgine = initMgine();
        const path = mgine.createPath({ x: 0, y: 0 })
            .lineTo({ x: 10, y: 10 })
            .quadraticTo({ x: 20, y: 20 }, { x: 30, y: 30 })
            .bezierTo({ x: 40, y: 40 }, { x: 50, y: 50 }, { x: 60, y: 60 })
            .forEach(segment => {
                assert.instanceOf(segment, Segment);
            });
        assert.strictEqual(path.length, 3);
    });

    it('should not modify original point objects', () => {
        const originalPoint = { x: 0, y: 0 };
        const path = new Path(originalPoint);
        path.lineTo({ x: 10, y: 10 });
        const copiedPoint = { ...originalPoint };
        path.lineTo(copiedPoint);
        assert.notStrictEqual(originalPoint, copiedPoint, 'Original point should not be modified');
        copiedPoint.x = 20;
        assert.strictEqual(originalPoint.x, 0, 'Original point should not be modified');
    });

    it('should modify original point objects', () => {
        const originalPoint = { x: 0, y: 0 };
        const path = new Path(originalPoint);
        path.lineTo({ x: 10, y: 10 });
        const copiedPoint = originalPoint;
        path.lineTo(copiedPoint);
        assert.strictEqual(originalPoint, copiedPoint, 'Original point should not be modified');
        copiedPoint.x = 20;
        assert.notStrictEqual(originalPoint.x, 0, 'Original point should be modified');
    });

    it('should push to segments without modifying them', () => {
        const mgine = initMgine();
        const path = mgine.createPath({ x: 0, y: 0 });
        for (let i = 0; i < 5; i++) {
            const segment = new Segment('line', { x: i * 10, y: i * 10 }, { x: (i+1)*10, y: (i+1)*10 });
            path.push(segment);
        }
        path.end.x = 100;
        assert.strictEqual(path.end.x, 100);
        assert.notStrictEqual(path.at(path.length - 1)?.to.x, path.end.x);
    });

    it('should reverse path segments', () => {
        const mgine = initMgine();
        const path = mgine.createPath({ x: 0, y: 0 })
            .lineTo({ x: 10, y: 10 })
            .quadraticTo({ x: 20, y: 20 }, { x: 30, y: 30 })
            .bezierTo({ x: 40, y: 40 }, { x: 50, y: 50 }, { x: 60, y: 60 });
        assert.strictEqual(path.at(0)?.from.x, 0);
        assert.strictEqual(path.at(1)?.from.x, 10);
        assert.strictEqual(path.at(2)?.from.x, 20);

        path.reverse();

        assert.strictEqual(path.length, 3);
        assert.strictEqual(path.at(0)?.from.x, 40);
        assert.strictEqual(path.at(1)?.from.x, 20);
        assert.strictEqual(path.at(2)?.from.x, 10);
    });

    it('should create a reversed copy of the path', () => {
        const mgine = initMgine();
        const path = mgine.createPath({ x: 0, y: 0 })
            .lineTo({ x: 10, y: 10 })
            .quadraticTo({ x: 20, y: 20 }, { x: 30, y: 30 })
            .bezierTo({ x: 40, y: 40 }, { x: 50, y: 50 }, { x: 60, y: 60 });

        const path2 = path.toReversed();
        console.log(path.toString());
        console.log(path2.toString());
        path2.forEach(segment => {
            console.log(segment);
            assert.instanceOf(segment, Segment);
            assertType<Segment>(segment);
            console.log(segment.toString());
        });
        assert.strictEqual(path2.length, 3);

        assert.strictEqual(path2.at(0)?.from.x, 40);
        assert.strictEqual(path.at(0)?.from.x, 0);

        assert.strictEqual(path2.at(1)?.from.x, 20);
        assert.strictEqual(path.at(1)?.from.x, 10);

        assert.strictEqual(path2.at(2)?.from.x, 10);
        assert.strictEqual(path.at(2)?.from.x, 20);

        path.map((segment, index, array) => {
            assert.strictEqual(path2.at(index)?.from.x, segment.from.x);
            assert.strictEqual(path2.at(index)?.from.y, segment.from.y);
            assert.strictEqual(path2.at(index)?.to.x, segment.to.x);
            assert.strictEqual(path2.at(index)?.to.y, segment.to.y);
            assert.strictEqual(path2.at(index)?.type, segment.type);

            return segment;
        });
    });
});
