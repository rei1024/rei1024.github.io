interface Editor {
    setModelMarkers(model: any, owner: string, _: any[]): any;
    create(container: HTMLElement, _: any): any;
}

interface Languages {
    register(_: any): any;
    registerCompletionItemProvider(id: string, _: any): any;
    setMonarchTokensProvider(id: string, _: any): any;
    setLanguageConfiguration(id: string, _: any): any;
    CompletionItemKind: any;
    CompletionItemInsertTextRule: any;
}

interface Monaco {
    languages: Languages;
    editor: Editor;
    MarkerSeverity: any;
}

declare var monaco: Monaco;
