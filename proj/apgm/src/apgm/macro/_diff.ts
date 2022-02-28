export function diff<T>(as: T[], bs: T[]): T[] {
    const setBs = new Set(bs);
    const ds: T[] = [];
    for (const a of as) {
        if (!setBs.has(a)) {
            ds.push(a);
        }
    }
    return ds;
}
