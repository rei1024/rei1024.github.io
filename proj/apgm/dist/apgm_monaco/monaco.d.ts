interface MonacoEditor {
    setModelMarkers(model: any, owner: string, _: any[]): unknown;
    create(container: HTMLElement, _: any): Editor;
}

interface Editor {
    getModel(): unknown;
    getValue(): string;
    setValue(str: string): string;
    revealLine(line: number): void;
}

interface Languages {
    register(_: unknown): any;
    registerCompletionItemProvider(id: string, _: unknown): unknown;
    setMonarchTokensProvider(id: string, _: unknown): unknown;
    setLanguageConfiguration(id: string, _: unknown): unknown;
    registerHoverProvider(id: string, _: unknown): unknown;
    CompletionItemKind: any;
    CompletionItemInsertTextRule: any;
}

interface Monaco {
    languages: Languages;
    editor: MonacoEditor;
    MarkerSeverity: any;
}

declare var monaco: Monaco;
