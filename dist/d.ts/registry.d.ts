/// <reference path="componentsprovider.d.ts" />
/// <reference path="attributeprovider.d.ts" />
declare module ho.components.registry {
    import Promise = ho.promise.Promise;
    class Registry {
        private components;
        private attributes;
        register(ca: typeof Component | typeof Attribute): void;
        run(): void;
        initComponent(component: typeof Component, element?: HTMLElement | Document): void;
        initElement(element: HTMLElement): void;
        hasComponent(name: string): boolean;
        hasAttribute(name: string): boolean;
        getAttribute(name: string): typeof Attribute;
        loadComponent(name: string): Promise<typeof Component, string>;
        loadAttribute(name: string): Promise<typeof Attribute, string>;
    }
    let instance: Registry;
}
