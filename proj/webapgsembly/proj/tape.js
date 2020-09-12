/**
 * T: Binary string register
 */
export class Tape {
    /**
     * 
     * @param {number} [ptr] 
     * @param {Array<0 | 1 | -1>} [bits] 
     */
    constructor(ptr = 0, bits = [0]) {
        this.ptr = ptr;
        this.bits = bits;
    }

    /**
     * もしヘッドが一番右にあればヘッドを進めて0を追加しZを返す。
     * そうでなければヘッドを進めてNZを返す
     */
    inc() {
        if (this.ptr === this.bits.length - 1) {
            this.bits.push(0);
            this.ptr += 1;
            return 0;
        } else {
            this.ptr += 1;
            return 1;
        }
    }

    /**
     * もしヘッドが一番左にあればZを返す。
     * そうでなければヘッドを戻してNZを返す。
     */
    dec() {
        if (this.ptr === 0) {
            return 0;
        } else {
            this.ptr -= 1;
            return 1;
        }
    }

    /**
     * 現在のヘッドの位置の値が0のときその値を消去してZを返す。
     * 1のときの値を消去してNZを返す。
     * そうでなければエラー
     */
    read() {
        const bit = this.bits[this.ptr];
        if (bit === 0) {
            this.bits[this.ptr] = -1;
            return 0;
        } else if (bit === 1) {
            this.bits[this.ptr] = -1;
            return 1;
        } else if (bit === -1) {
            throw Error("Runtime error: Tape.read");
        } else {
            throw Error("Runtime error: Tape.read");
        }
    }

    // internal
    /**
     * 
     * @param {0 | 1} v
     * @returns {null}
     */
    setValue(v) {
        if (this.bits[this.ptr] !== -1) {
            throw Error("Runtime error: Tape.set");
        }
        this.bits[this.ptr] = v;
        return null;
    }

    /**
     * @returns {null}
     */
    set() {
        if (this.bits[this.ptr] === -1) {
            this.bits[this.ptr] = 1;
            return null;
        } else {
            throw Error("Runtime error: Tape.set");
        }
    }

    /**
     * @returns {null}
     */
    reset() {
        if (this.bits[this.ptr] === -1) {
            this.bits[this.ptr] = 0;
            return null;
        } else {
            throw Error("Runtime error: Tape.set");
        }
    }

    toString() {
        const { prefix, head, suffix } = this.toObject();
        let start = prefix.join(" ");
        return start + (start.length === 0 ? "" : " ") + "{" + head + "} " + suffix.join(" ");
    }

    toObject() {
        return {
            prefix: this.bits.slice(0, this.ptr),
            head: this.bits[this.ptr],
            suffix: this.bits.slice(this.ptr + 1),
        }
    }
}
