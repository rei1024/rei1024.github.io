// @ts-check

/**
 * @template T
 */
export class LazyValue {
    /**
     *
     * @param {() => T} make
     */
    constructor(make) {
        /**
         * @private
         */
        this._make = make;

        /**
         * @private
         */
        this._obj = {};

        /**
         * @type {T}
         * @private
         */
        // @ts-ignore
        this._value = this._obj;
    }

    /**
     *
     * @returns {T}
     */
    get() {
        if (this._obj === this._value) {
            this._value = this._make();
            return this._value;
        } else {
            return this._value;
        }
    }
}
