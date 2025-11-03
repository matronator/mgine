export function deepClone<T>(obj: T): T {
    if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
    if (typeof obj !== 'object' || obj === null) return obj;
    const copy = {} as { [K in keyof T]: T[K] };
    Object.keys(obj).forEach(key => copy[key as keyof T] = deepClone((obj as { [key: string]: any })[key]));
    Object.setPrototypeOf(copy, Object.getPrototypeOf(obj));

    return copy;
}
