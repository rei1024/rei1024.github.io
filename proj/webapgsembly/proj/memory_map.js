import * as Type from './type.js'

/**
 * @deprecated
 */
export class Memory {
    /**
     * 
     * @param {Map<string, 0 | 1>} memory 
     */
    constructor(memory = new Map(), sqx = 0, sqy = 0) {
        this.memory = memory;
        this.sqx = sqx;
        this.sqy = sqy;
    }

    getCoord() {
        return this.sqx + "," + this.sqy;
    }

    read() {
        const coord = this.getCoord();
        const value = this.memory.get(coord);
        if (value === undefined) {
            this.memory.set(coord, 0);
            return Type.Z;
        }
        if (value === 0) {
            return Type.Z;
        } else {
            this.memory.set(coord, 0);
            return Type.NZ;
        }
    }

    set() {
        const coord = this.getCoord();
        const value = this.memory.get(coord);
        if (value === undefined) {
            this.memory.set(coord, 1);
            return null;
        }
        if (value === 0) {
            this.memory.set(coord, 1);
        } else {
            throw Error("runtime error")
        }
        return null;
    }

    inc_sqx() {
        this.sqx += 1;
        return null;
    }

    inc_sqy() {
        this.sqy += 1;
        return null;
    }

    dec_sqx() {
        if (this.sqx === 0) {
            return Type.Z;
        } else {
            this.sqx -= 1;
            return Type.NZ;
        }
    }

    dec_sqy() {
        if (this.sqy === 0) {
            return Type.Z;
        } else {
            this.sqy -= 1;
            return Type.NZ;
        }
    }

    toArray() {
        let xs = [];
        let ys = [];
        for (const coord of this.memory.keys()) {
            let [ x, y ] = coord.split(",");
            xs.push(x);
            ys.push(y);
        }
        let maxX = Math.max(0, ...xs);
        let maxY = Math.max(0, ...ys);
        let array = [];
        for (let i = 0; i <= maxY; i++) {
            let temp = []
            for (let j = 0; j <= maxX; j++) {
                temp.push(this.memory.get(j + "," + i) ?? 0);
            }
            array.push(temp);
        }
        return {
            array,
            maxX,
            maxY,
        }
    }

    toString() {
        return this.toArray().array.map(a => a.join("")).join("\n");
    }

    print() {
        console.log(this.toString());
    }
}
