// @ts-check

import { B2D } from "../../src/components/B2D.js";

/**
 * B2Dをcanvasに描画する
 * render B2D to canvas
 * @param {CanvasRenderingContext2D} context
 * @param {B2D} b2d
 * @param {boolean} hidePointer ポインタを非表示にする
 * @param {boolean} flipUpsideDown 上下逆にする
 */
export function renderB2D(context, b2d, hidePointer, flipUpsideDown) {
    const width = context.canvas.width;
    const prevHeight = context.canvas.height;

    if (width !== prevHeight) {
        // make square
        context.canvas.height = width;
    }

    // reset canvas
    context.clearRect(0, 0, width, width);
    context.resetTransform();
    context.beginPath();

    const maxX = b2d.getMaxX();
    const maxY = b2d.getMaxY();

    const n = Math.max(maxX, maxY) + 1;
    const cellSize = width / n;

    if (flipUpsideDown) {
        context.scale(1, -1);
        context.translate(0, -width);
    }

    const array = b2d.getArray();
    // context.rotate(Math.PI / 4);
    context.fillStyle = "#212529";
    for (let j = 0; j <= maxY; j++) {
        const row = array[j];
        if (row === undefined) {
            throw Error("renderB2D: internal error");
        }
        const jMultCell = j * cellSize;
        for (let i = 0; i <= maxX; i++) {
            if (row[i] === 1) {
                context.rect(i * cellSize, jMultCell, cellSize, cellSize);
            }
        }
    }

    context.fill();

    // draw pointer
    if (!hidePointer) {
        context.strokeStyle = "#03A9F4";
        context.lineWidth = 4;
        context.strokeRect(
            b2d.x * cellSize,
            b2d.y * cellSize,
            cellSize,
            cellSize,
        );
    }
}
