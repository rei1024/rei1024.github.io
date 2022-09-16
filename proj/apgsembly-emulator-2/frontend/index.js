// @ts-check

// critical path
import {} from "./util/selector.js";
import {} from "./util/frequency.js";
import {} from "./util/create.js";
import {} from "./util/continuously-variable-emitter.js";
import {} from "./components/renderB2D.js";
import {} from "./components/unary_ui.js";
import {} from "./components/binary_ui.js";
import {} from "./components/stats_ui.js";
import {} from "./components/breakpoint.js";
import {} from "./components/toggle.js";
import {} from "./components/error.js";
import {} from "./components/output.js";

import { setupFrequencyInput } from "./components/frequency_input.js";
import { setCustomError, removeCustomError } from "./util/validation_ui.js";
import { makeSpinner } from "./util/spinner.js";
import { importFileAsText } from "./util/import_file.js";
import { getSaveData } from "./util/save_data.js";
import { idle } from "./util/idle.js";
import { prefetch } from "./util/prefetch.js";
import { localStorageSetItem } from "./util/local-storage-set-item.js";

import {
    $input,
    $toggle,
    $reset,
    $step,
    $configButton,
    $frequencyInput,
    $b2dDetail,
    $unaryRegisterDetail,
    $binaryRegisterDetail,
    $fileImport,
    $exampleCodes,
    $examples,

    // Modal
    $configModalContent,
    $stepInput,
    binaryConfig,
    $darkMode,
    $darkModeLabel,
    $b2dHidePointer,
    $b2dFlipUpsideDown,

    // Stats
    $statsModal,
} from "./bind.js";

import { App } from "./app.js";

// データ
// GitHub Pagesは1階層上になる
const DATA_DIR = location.origin.includes('github') ?
    "../apgsembly-emulator-2/data/" :
    "../data/";

/** instance */
const app = new App();

// Reset button
$reset.addEventListener('click', () => {
    app.reset();
});

// Toggle button
$toggle.addEventListener('click', () => {
    if (app.appState === "Running") {
        app.stop();
    } else {
        app.start();
    }
});

// Step button
$step.addEventListener('click', () => {
    // 時間がかかる時はスピナーを表示する
    // show a spinner
    if (app.stepConfig >= 5000000) {
        const spinner = makeSpinner();

        $step.append(spinner);
        $step.disabled = true;

        // 他のボタンも一時的に無効化する app.runで有効化される
        $reset.disabled = true;
        $toggle.disabled = true;

        setTimeout(() => {
            // $step.disabled = false; // app.runで更新されるため必要ない
            app.run(app.stepConfig);
            $step.removeChild(spinner);
        }, 33); // 走らせるタイミングを遅らせることでスピナーの表示を確定させる
    } else {
        app.run(app.stepConfig);
    }
});

const SRC_KEY = 'src';

// サンプル
$exampleCodes.forEach(e => {
    e.addEventListener('click', async () => {
        $examples.style.opacity = "0.5";
        const src = e.dataset[SRC_KEY];
        try {
            const response = await fetch(DATA_DIR + src);
            app.setInputAndReset(await response.text());
            // スクロール
            $input.scrollTop = 0;
        } catch (_) {
            console.error(`Fetch Error: ${src}`);
        } finally {
            $examples.style.opacity = "1";
        }
    });
});

// 周波数の設定
setupFrequencyInput($frequencyInput, app);

// 開閉で描画
$b2dDetail.addEventListener('toggle', () => {
    app.renderB2D();
});

$binaryRegisterDetail.addEventListener('toggle', () => {
    app.renderBinary();
});

$unaryRegisterDetail.addEventListener('toggle', () => {
    app.renderUnary();
});

// ファイルインポート
importFileAsText($fileImport, result => {
    app.setInputAndReset(result);
    // スクロール
    $input.scrollTop = 0;
});

// ** Modal ** //

$stepInput.addEventListener('input', () => {
    const n = Number($stepInput.value);
    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
        setCustomError($stepInput, 'Enter a positive integer');
        app.stepConfig = 1;
    } else {
        removeCustomError($stepInput);
        app.stepConfig = n;
    }
});

/**
 * @param {HTMLInputElement} $checkbox
 * @param {string} key
 */
function setupCheckbox($checkbox, key) {
    $checkbox.addEventListener("change", () => {
        app.render();
        localStorageSetItem(key, $checkbox.checked.toString());
    });
}

// バイナリを非表示にする
const HIDE_BINARY_KEY = 'hide_binary';
setupCheckbox(binaryConfig.$hideBinary, HIDE_BINARY_KEY);

const REVERSE_BINARY_KEY = 'reverse_binary';
setupCheckbox(binaryConfig.$reverseBinary, REVERSE_BINARY_KEY);

const SHOW_BINARY_IN_DECIMAL_KEY = 'show_binary_in_decimal';
setupCheckbox(binaryConfig.$showBinaryValueInDecimal, SHOW_BINARY_IN_DECIMAL_KEY);

const SHOW_BINARY_IN_HEX_KEY = 'show_binary_in_hex';
setupCheckbox(binaryConfig.$showBinaryValueInHex, SHOW_BINARY_IN_HEX_KEY);

// B2D
$b2dHidePointer.addEventListener('change', () => {
    app.renderB2D();
});

const B2D_FLIP_UPSIDE_DOWN_KEY = 'b2d_flip_upside_down';
setupCheckbox($b2dFlipUpsideDown, B2D_FLIP_UPSIDE_DOWN_KEY);

// showの場合クラスが追加されない
$statsModal.addEventListener('shown.bs.modal', () => {
    app.renderStats();
});

// ダークモード
// bodyタグ直下で設定してDark mode flashingを防ぐ
const DARK_MODE_KEY = 'dark_mode';
$darkMode.addEventListener('change', () => {
    const onOrOff = $darkMode.checked ? "on" : "off";
    localStorageSetItem(DARK_MODE_KEY, onOrOff);
    document.body.setAttribute('apge_dark', onOrOff);

    $darkModeLabel.textContent = $darkMode.checked ? "On" : "Off";

    // アニメーションを付与
    const ANIMATE = "animate-color-and-background-color";
    document.body.classList.add(ANIMATE);
    $configModalContent.classList.add(ANIMATE);
    setTimeout(() => {
        document.body.classList.remove(ANIMATE);
        $configModalContent.classList.remove(ANIMATE);
    }, 500);
});

// キーボード入力
// keyboard input
// Enter: toggle Start and Stop
// Space: Step
document.addEventListener('keydown', e => {
    const activeElementTagName =
        document.activeElement?.tagName.toLowerCase() ?? "";
    const tags = ["textarea", "input", "details", "button", "audio", "video", "select", "option"];
    // 入力中は無し
    if (tags.includes(activeElementTagName)) {
        return;
    }

    switch (e.code) {
        case "Enter": {
            switch (app.appState) {
                case "Running": return app.stop();
                case "Stop": return app.start();
            }
            break;
        }
        case "Space": {
            // ステップが無効化されていないときだけ
            if (!$step.disabled) {
                // スペースで下に移動することを防ぐ
                e.preventDefault();
                // 実行中の場合は停止する
                if (app.appState === "Running") {
                    app.stop();
                }
                app.run(app.stepConfig);
            }
            break;
        }
    }
});

// ファイルドロップ
$input.addEventListener("drop", async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files.item(0);
    if (file == undefined) {
        return;
    }

    app.setInputAndReset(await file.text());
    // スクロール
    $input.scrollTop = 0;
});

// ボタンの有効化
$examples.disabled = false;
$configButton.disabled = false;

// 初回描画
// first render
app.initializeApp();

// 初期コード
idle(() => {
    const INIT_CODE = "initial_code";
    const initCode = localStorage.getItem(INIT_CODE);
    if (initCode !== null && initCode !== "") {
        localStorage.removeItem(INIT_CODE);
        app.setInputAndReset(initCode);
    }
});

// 実行時間が掛かる処理をまとめる
idle(() => {
    // デフォルトはtrue
    if (localStorage.getItem(SHOW_BINARY_IN_DECIMAL_KEY) === null) {
        localStorageSetItem(SHOW_BINARY_IN_DECIMAL_KEY, "true");
    }

    /**
     * @type {{ key: string; checkbox: HTMLInputElement}[]}
     */
    const items = [
        { key: B2D_FLIP_UPSIDE_DOWN_KEY, checkbox: $b2dFlipUpsideDown },
        { key: REVERSE_BINARY_KEY, checkbox: binaryConfig.$reverseBinary },
        { key: HIDE_BINARY_KEY, checkbox: binaryConfig.$hideBinary },
        { key: SHOW_BINARY_IN_DECIMAL_KEY, checkbox: binaryConfig.$showBinaryValueInDecimal },
        { key: SHOW_BINARY_IN_HEX_KEY, checkbox: binaryConfig.$showBinaryValueInHex },
    ];

    for (const { key, checkbox } of items) {
        if (localStorage.getItem(key) === "true") {
            checkbox.checked = true;
        }
    }

    // ダークモードについてはbodyタグ直下でも設定する
    // チェックボタンはここで処理する
    if (localStorage.getItem(DARK_MODE_KEY) === "on") {
        document.body.setAttribute('apge_dark', "on");
        $darkMode.checked = true;
        $darkModeLabel.textContent = "On";
    }
    app.render();
});

// サンプルコードをプレフェッチ
idle(() => {
    const saveData = getSaveData();
    if (saveData) {
        return;
    }
    $exampleCodes.forEach(e => {
        const src = e.dataset[SRC_KEY];
        if (src !== undefined) {
            prefetch(DATA_DIR + src);
        }
    });
});

// PWA
if ("serviceWorker" in navigator) {
    idle(async () => {
        // await navigator.serviceWorker.register("./service-worker.js?2022-09-14");

        // // check for update
        // if (navigator.onLine) {
        //     navigator.serviceWorker
        //     .getRegistrations()
        //     .then((registrations) => registrations.forEach((reg) => reg.update()));
        // }

        // unregister all
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (const registration of registrations) {
                registration.unregister();
            }
        });
    });
}

export const _index = null;
