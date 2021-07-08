// @ts-check

import { B2D } from "../src/components/B2D.js";

/**
 * B2Dをcanvasに描画する
 * render B2D to canvas
 * @param {CanvasRenderingContext2D} context 
 * @param {B2D} b2d 
 */
export function renderB2D(context, b2d) {
    context.canvas.height = context.canvas.width;
    const maxX = b2d.getMaxX();
    const maxY = b2d.getMaxY();

    const n = Math.max(maxX, maxY) + 1;
    const cellSize = context.canvas.width / n;

    const array = b2d.getArray();
    // context.rotate(Math.PI / 4);
    context.fillStyle = "#212529";
    for (let j = 0; j <= maxY; j++) {
        const row = array[j];
        const jMultCell = j * cellSize;
        for (let i = 0; i <= maxX; i++) {
            if (row[i] === 1) {
                context.rect(i * cellSize, jMultCell, cellSize, cellSize);
            }
        }
    }
    context.fill();
    context.strokeStyle = "#03A9F4";
    context.lineWidth = 4;
    context.strokeRect(b2d.x * cellSize, b2d.y * cellSize, cellSize, cellSize);
}
