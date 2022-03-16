// @ts-check

import { APGM_ID } from "./core.js";
import { completionItemProvider } from "./completionItemProvider.js";
import { monarchTokensProvider } from "./monarchTokensProvider.js";
import { languageConfiguration } from "./languageConfiguration.js";

export function initMonaco() {
    monaco.languages.register({
        id: APGM_ID,
    });

    monaco.languages.registerCompletionItemProvider(
        APGM_ID,
        completionItemProvider,
    );

    // https://github.com/microsoft/monaco-editor/blob/main/website/monarch/monarch.js
    monaco.languages.setMonarchTokensProvider(APGM_ID, monarchTokensProvider);
    monaco.languages.setLanguageConfiguration(APGM_ID, languageConfiguration);
}

/**
 * @param {HTMLElement} container
 */
export function initEditor(container) {
    const editor = monaco.editor.create(container, {
        value: ``,
        language: "apgm",
        theme: "vs-dark",
        // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneEditorConstructionOptions.html#suggest
        suggest: {
            // スニペットの中を打っている最中にサジェスト表示
            snippetsPreventQuickSuggestions: false,
        },
        // ブラウザのサイズ変更時
        automaticLayout: true,
        // editor.scrollbar.alwaysConsumeMouseWheel: false
        scrollbar: {
            // alwaysConsumeMouseWheel: false,
        },
        // カスタムで登録しているのでできない
        // wordBasedSuggestions: true
    });

    return {
        /**
         * @returns {string}
         */
        getValue() {
            return editor.getValue();
        },
        /**
         * @param {string} str
         */
        setValue(str) {
            editor.setValue(str);
        },
        scrollToTop() {
            editor.revealLine(1);
        },
    };
}
