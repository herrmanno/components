declare module ho.components.componentprovider {
    import Promise = ho.promise.Promise;
    let mapping: {
        [name: string]: string;
    };
    class ComponentProvider {
        useMin: boolean;
        resolve(name: string): string;
        getComponent(name: string): Promise<typeof Component, string>;
        private get(name);
    }
    let instance: ComponentProvider;
}
