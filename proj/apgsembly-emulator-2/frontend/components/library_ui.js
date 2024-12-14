// @ts-check

import {
    $addBinaryLibraryFile,
    $addLibraryFileButton,
    $libraryList,
    $libraryModalClose,
} from "../bind.js";
import { create } from "../util/create.js";

/**
 * ファイル選択ボタンを設定する関数
 * @param {HTMLButtonElement} button - ファイル選択をトリガーするボタン
 * @param {(file: File) => void} onFilePicked - ファイルが選択されたときのコールバック関数
 */
function setupFilePicker(button, onFilePicked) {
    // 非表示の<input type="file">を作成
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";

    // ボタンがクリックされたときにファイル選択をトリガー
    button.addEventListener("click", () => {
        fileInput.click(); // ファイル選択ダイアログを開く
    });

    // ファイルが選択されたときの処理
    fileInput.addEventListener("change", (event) => {
        // @ts-ignore
        const files = event.target.files; // 選択されたファイルを取得
        if (files.length > 0) {
            const file = files[0];
            onFilePicked(file); // コールバックを呼び出す
        }
    });

    // DOMにfileInputを追加（必要に応じて）
    document.body.appendChild(fileInput);
}

/**
 * UI for library files
 */
export class LibraryUI {
    constructor() {
        /**
         * @private
         * @type {{ name: string; content: string, buildin?: true }[]}
         */
        this.files = [];
    }

    getFiles() {
        return this.files.slice();
    }

    initialize() {
        $addBinaryLibraryFile.addEventListener("click", async () => {
            $addBinaryLibraryFile.disabled = true;
            this.addFile({
                name: "binary.apglib",
                content: await (fetch("./frontend/data/" + "binary.apglib"))
                    .then((r) => r.text()),
                builtin: true,
            });
            await new Promise((resolve) => setTimeout(resolve, 500));
            $libraryModalClose.click();
        });
        setupFilePicker($addLibraryFileButton, async (file) => {
            this.addFile({ name: file.name, content: await file.text() });
            await new Promise((resolve) => setTimeout(resolve, 500));
            $libraryModalClose.click();
        });
    }

    /**
     * @private
     * @param {{ name: string; content: string, builtin?: boolean }} file
     */
    addFile(file) {
        this.files.push(file);

        const $name = create("td");
        $name.textContent = file.name;
        const $deleteButton = create("button", { text: "Delete" });
        $deleteButton.className = "btn btn-danger btn-sm";
        $deleteButton.addEventListener("click", () => {
            if (file.builtin) {
                $addBinaryLibraryFile.disabled = false;
            }
            this.files = this.files.filter((x) => x.name !== file.name);
            $row.remove();
        });
        const $deleteCell = create("td", { children: [$deleteButton] });
        const $row = create("tr", { children: [$name, $deleteCell] });
        $libraryList.append($row);
    }
}
