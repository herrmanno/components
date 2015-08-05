/// <reference path="componentsprovider.d.ts" />
/// <reference path="attributeprovider.d.ts" />
declare module ho.components.registry {
    import Promise = ho.promise.Promise;
    class Registry {
        private components;
        private attributes;
        register(ca: typeof Component | typeof Attribute): void;
        run(): Promise<any, any>;
        initComponent(component: typeof Component, element?: HTMLElement | Document): Promise<any, any>;
        initElement(element: HTMLElement): Promise<any, any>;
        hasComponent(name: string): boolean;
        hasAttribute(name: string): boolean;
        getAttribute(name: string): typeof Attribute;
        loadComponent(name: string): Promise<typeof Component, string>;
        protected getParentOfComponent(name: string): Promise<string, any>;
        loadAttribute(name: string): Promise<typeof Attribute, string>;
    }
    let instance: Registry;
}
