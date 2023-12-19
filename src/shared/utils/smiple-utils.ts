export function isNumber<T>(item: T | number): item is number {
    return typeof item === 'number';
}
