// @ts-check

// critical path
import {} from "./util/selector.js";
import {} from "./util/frequency.js";
import {} from "./components/renderB2D.js";
import {} from "./components/unary_ui.js";
import {} from "./components/binary_ui.js";
import {} from "./components/stats_ui.js";

import { setCustomError, removeCustomError } from "./util/validation_ui.js";
import { makeSpinner } from "./util/spinner.js";
import { importFileAsText } from "./util/import_file.js";
import { getSaveData } from "./util/save_data.js";
import { idle } from "./util/idle.js";
import { prefetch } from "./util/prefetch.js";

import {
    $input,
    $toggle,
    $reset,
    $step,
    $configButton,
    $statsButton,
    $frequencyInput,
    $b2dDetail,
    $unaryRegisterDetail,
    $binaryRegisterDetail,
    $fileImport,
    $sampleCodes,
    $samples,

    // Modal
    $configModalContent,
    $stepInput,
    $hideBinary,
    $reverseBinary,
    $showBinaryValueInDecimal,
    $showBinaryValueInHex,
    $darkMode,
    $darkModeLabel,
    $b2dHidePointer,
    $b2dFlipUpsideDown,

    // Stats
    $statsModal,
} from "./bind.js";

import { App, DEFUALT_FREQUENCY } from "./app.js";

// データ
// GitHub Pagesは1階層上になる
const DATA_DIR = location.origin.includes('github') ?
    "../apgsembly-emulator-2/data/" :
    "../data/";

/**
 * @typedef {"Initial" | "Running" | "Stop" | "ParseError" |
 *           "RuntimeError" | "Halted"} AppState
 */

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

const spinner = makeSpinner();

// Step button
$step.addEventListener('click', () => {
    if ($step.disabled) {
        return;
    }
    // 時間がかかる時はスピナーを表示する
    // show a spinner
    if (app.stepConfig >= 5000000) {
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
$sampleCodes.forEach(e => {
    if (!(e instanceof HTMLElement)) {
        throw Error('is not HTMLElement');
    }

    e.addEventListener('click', () => {
        $samples.style.opacity = "0.5";
        const src = e.dataset[SRC_KEY];
        fetch(DATA_DIR + src).then(res => res.text()).then(text => {
            $input.value = text;
            app.reset();
        }).catch(() => {
            console.error(`Fetch Error: ${src}`);
        }).finally(() => {
            $samples.style.opacity = "1";
        });
    });
});

// 周波数の設定
/** @type {number[]} */
const frequencyArray = [];
for (let i = 0; i < 7; i++) {
    const base = 10 ** i;
    for (let j = 1; j <= 9; j++) {
        frequencyArray.push(base * j);
    }
}

frequencyArray.push(10 ** 7);

$frequencyInput.min = "0";
$frequencyInput.max = (frequencyArray.length - 1).toString();

$frequencyInput.addEventListener('input', () => {
    const value = parseInt($frequencyInput.value, 10);
    if (!isNaN(value)) {
        const freq = frequencyArray[value] ?? DEFUALT_FREQUENCY;
        $frequencyInput.ariaValueText = `(${freq.toString()}Hz)`;
        app.cve.frequency = freq;
    } else {
        app.cve.frequency = DEFUALT_FREQUENCY;
    }

    app.renderFrequencyOutput();
});

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
    $input.value = result;
    app.reset();
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

// バイナリを非表示にする
const HIDE_BINARY_KEY = 'hide_binary';

$hideBinary.addEventListener('change', () => {
    app.renderBinary();
    localStorage.setItem(HIDE_BINARY_KEY, $hideBinary.checked.toString());
});

const REVERSE_BINARY_KEY = 'reverse_binary';

$reverseBinary.addEventListener('change', () => {
    app.renderBinary();
    localStorage.setItem(REVERSE_BINARY_KEY, $reverseBinary.checked.toString());
});

const SHOW_BINARY_IN_DECIMAL_KEY = 'show_binary_in_decimal';

$showBinaryValueInDecimal.addEventListener('change', () => {
    app.renderBinary();
    localStorage.setItem(SHOW_BINARY_IN_DECIMAL_KEY, $showBinaryValueInDecimal.checked.toString());
});

const SHOW_BINARY_IN_HEX_KEY = 'show_binary_in_hex';

$showBinaryValueInHex.addEventListener('change', () => {
    app.renderBinary();
    localStorage.setItem(SHOW_BINARY_IN_HEX_KEY, $showBinaryValueInHex.checked.toString());
});

// B2D
$b2dHidePointer.addEventListener('change', () => {
    app.renderB2D();
});

const B2D_FLIP_UPSIDE_DOWN_KEY = 'b2d_flip_upside_down';

$b2dFlipUpsideDown.addEventListener('change', () => {
    localStorage.setItem(
        B2D_FLIP_UPSIDE_DOWN_KEY,
        $b2dFlipUpsideDown.checked.toString()
    );
    app.renderB2D();
});

// showの場合クラスが追加されない
$statsModal.addEventListener('shown.bs.modal', () => {
    app.renderStats();
});

// ダークモード
// bodyタグ直下で設定してDark mode flashingを防ぐ
const DARK_MODE_KEY = 'dark_mode';
$darkMode.addEventListener('change', () => {
    const onOrOff = $darkMode.checked ? "on" : "off";
    localStorage.setItem(DARK_MODE_KEY, onOrOff);
    document.body.setAttribute('apge_dark_mode', onOrOff);

    $darkModeLabel.textContent = $darkMode.checked ? "On" : "Off";

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
        document.activeElement?.tagName.toUpperCase() ?? "";
    const tags = ["TEXTAREA", "INPUT", "DETAILS", "BUTTON", "AUDIO", "VIDEO", "SELECT", "OPTION"];
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
    if (file == null) {
        return;
    }

    const text = await file.text();
    if (text === undefined) {
        return;
    }
    $input.value = text;
    app.reset();
});

// ボタンの有効化
$samples.disabled = false;
$configButton.disabled = false;
$statsButton.disabled = false;

// 初回描画
// first render
app.initializeApp();

idle(() => {
    // 実行時間が掛かる処理をまとめる
    if (localStorage.getItem(B2D_FLIP_UPSIDE_DOWN_KEY) === "true") {
        $b2dFlipUpsideDown.checked = true;
    }

    if (localStorage.getItem(REVERSE_BINARY_KEY) === "true") {
        $reverseBinary.checked = true;
    }

    if (localStorage.getItem(HIDE_BINARY_KEY) === "true") {
        $hideBinary.checked = true;
    }

    // デフォルトはtrue
    if (localStorage.getItem(SHOW_BINARY_IN_DECIMAL_KEY) === null) {
        localStorage.setItem(SHOW_BINARY_IN_DECIMAL_KEY, 'true');
    }

    if (localStorage.getItem(SHOW_BINARY_IN_DECIMAL_KEY) === "true") {
        $showBinaryValueInDecimal.checked = true;
    }

    if (localStorage.getItem(SHOW_BINARY_IN_HEX_KEY) === "true") {
        $showBinaryValueInHex.checked = true;
    }

    // ダークモードについてはbodyタグ直下でも設定する
    if (localStorage.getItem(DARK_MODE_KEY) === "on") {
        document.body.setAttribute('apge_dark_mode', "on");
        $darkMode.checked = true;
        $darkModeLabel.textContent = "On";
    }
    app.render();
});

// 初期コード
const INIT_CODE = "initial_code";
const initCode = localStorage.getItem(INIT_CODE);
if (initCode !== null && initCode !== "") {
    localStorage.removeItem(INIT_CODE);
    $input.value = initCode;
    app.reset();
}

// サンプルコードをプレフェッチ
idle(() => {
    try {
        const saveData = getSaveData();
        if (saveData === false || saveData === undefined) {
            $sampleCodes.forEach(e => {
                if (!(e instanceof HTMLElement)) {
                    return;
                }
                const src = e.dataset[SRC_KEY];
                if (src !== undefined) {
                    prefetch(DATA_DIR + src);
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
});

// PWA
if ("serviceWorker" in navigator) {
    // navigator.serviceWorker.register("./service-worker.js?2022-06-10");
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
        }
    });
}
