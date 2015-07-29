declare module ho.components {
    class Registry {
        private options;
        private components;
        private htmlMap;
        constructor(options?: any);
        setOptions(options?: any): void;
        register(c: typeof Component): void;
        run(): void;
        initComponent(component: typeof Component, element?: HTMLElement | Document): void;
        initElement(element: HTMLElement): void;
        hasComponent(name: string): boolean;
        loadComponent(name: string): Promise;
        getHtml(name: string): Promise;
        render(component: Component): void;
    }
    var registry: Registry;
}
