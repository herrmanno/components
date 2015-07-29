declare module ho.components.componentprovider {
    import Promise = ho.promise.Promise;
    class ComponentProvider {
        useMin: boolean;
        resolve(name: string): string;
        getComponent(name: string): Promise<typeof Component, string>;
    }
    let instance: ComponentProvider;
}
