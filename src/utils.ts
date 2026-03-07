export function deepClone<T>(obj: T): T {
    if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
    if (typeof obj !== 'object' || obj === null) return obj;
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(obj).forEach(key => copy[key as keyof T] = deepClone((obj as { [key: string]: any })[key]));
    Object.setPrototypeOf(copy, Object.getPrototypeOf(obj));

    return copy;
}

export function randomID(prefix?: string): string {
    return Math.random().toString(36).replace('0.',prefix ?? '') + Date.now().toString(36);
}

export function is(type: string, value: unknown): boolean {
    return value !== undefined && value !== null && Object.prototype.toString.call(value).slice(8, -1) === type;
}

export function typeOf(value: unknown): string {
    return Object.prototype.toString.call(value).slice(8, -1);
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}
