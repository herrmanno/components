declare module ho.components.htmlprovider {
    import Promise = ho.promise.Promise;
    class HtmlProvider {
        private cache;
        resolve(name: string): string;
        getHTML(name: string): Promise<string, string>;
    }
    let instance: HtmlProvider;
}
