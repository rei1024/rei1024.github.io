const pakoURL = "https://cdn.jsdelivr.net/npm/pako@2.0.4/dist/pako.esm.mjs";

/**
 * @param {Uint8Array} array
 * @returns {string}
 */
function toHex(array) {
    return [...array].map((x) =>
        (x >> 4).toString(16) + (x & 0x0F).toString(16)
    ).join("");
}

/**
 * @param {string} hex
 * @returns {Uint8Array}
 */
function fromHex(hex) {
    /** @type {number[]} */
    const array = [];
    for (let i = 0; i < hex.length; i += 2) {
        array.push(parseInt(hex[i] + hex[i + 1], 16));
    }
    return new Uint8Array(array);
}

/**
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function deflate(str) {
    const pako = await import(pakoURL);
    const input = new TextEncoder().encode(str);
    const outputArray = pako.deflate(input);
    return toHex(outputArray);
}

/**
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function inflate(str) {
    const pako = await import(pakoURL);
    const outputArray = pako.inflate(fromHex(str));
    return new TextDecoder().decode(outputArray);
}
