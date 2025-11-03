import { describe, expect, test } from "vitest";
import { deepClone } from "../../src";

describe('deepClone', () => {
    test('simple object', () => {
        const obj = { a: 1, b: { c: 2 } };
        const cloned = deepClone(obj);
        expect(cloned).not.toBe(obj);
        expect(cloned).toEqual(obj);
        obj.a = 2;
        expect(cloned.a).toBe(1);
        cloned.b = { c: 3 };
        expect(obj.b.c).toBe(2);
        obj.b.c = 4;
        expect(cloned.b.c).toBe(3);
        expect(obj.b.c).toBe(4);
    });

    test('simple array', () => {
        const arr = [1, 2, 3];
        const cloned = deepClone(arr);
        expect(cloned).not.toBe(arr);
        expect(cloned).toEqual(arr);
        arr[0] = 2;
        expect(cloned[0]).toBe(1);
        cloned[1] = 3;
        expect(arr[1]).toBe(2);
        expect(cloned[1]).toBe(3);
    });

    test('object with functions', () => {
        const obj = { a: () => 1, b: { c: () => 2 } };
        const cloned = deepClone(obj);
        expect(cloned).not.toBe(obj);
        expect(cloned).toEqual(obj);
        expect(cloned.a()).toBe(1);
        expect(cloned.b.c()).toBe(2);
    });
});
