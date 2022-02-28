export function dups<T>(as: T[]): T[] {
    const set: Set<T> = new Set();
    const ds: T[] = [];
    for (const a of as) {
        if (set.has(a)) {
            ds.push(a);
        } else {
            set.add(a);
        }
    }
    return ds;
}
