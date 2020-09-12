/**
 * SQ: 2d binary register
 */
export class Memory {
    /**
     * 
     * @param {number} [sqx]
     * @param {number} [sqy] 
     */
    constructor(sqx = 0, sqy = 0) {
        this.sqx = sqx;
        this.sqy = sqy;
        this.maxSQX = sqx;
        this.maxSQY = sqy;
        /** @type {Array<Array<0 | 1>>} */
        this.array = Array(this.maxSQY + 1).fill(0).map(v => {
            return Array(this.maxSQX + 1).fill(0);
        });
    }

    /**
     * 
     * @param {number} i x
     * @param {number} j y
     */
    getAt(i, j) {
        if (i < 0 || this.maxSQX < i) {
            return 0;
        }
        if (j < 0 || this.maxSQY < j) {
            return 0;
        }
        return this.array[j][i]
    }

    read() {
        const a = this.array[this.sqy];
        if (a[this.sqx] === 0) {
            return 0;
        } else {
            a[this.sqx] = 0;
            return 1;
        }
    }

    set() {
        const a = this.array[this.sqy];
        if (a[this.sqx] === 0) {
            a[this.sqx] = 1;
            return null;
        } else {
            throw Error("Runtime error: Memory.set")
        }
    }

    inc_sqx() {
        this.sqx += 1;
        if (this.maxSQX < this.sqx) {
            this.array.forEach(a => {
                a.push(0);
            });
            this.maxSQX = this.sqx;
        }
        return null;
    }

    inc_sqy() {
        this.sqy += 1;
        if (this.maxSQY < this.sqy) {
            this.array.push(Array(this.maxSQX + 1).fill(0));
            this.maxSQY = this.sqy;
        }
        return null;
    }

    dec_sqx() {
        if (this.sqx === 0) {
            return 0;
        } else {
            this.sqx -= 1;
            return 1;
        }
    }

    dec_sqy() {
        if (this.sqy === 0) {
            return 0;
        } else {
            this.sqy -= 1;
            return 1;
        }
    }

    toArray() {
        return this.array;
    }

    toString() {
        return this.array.map(a => a.join("")).join("\n");
    }

    print() {
        console.log(this.toString());
    }
}
