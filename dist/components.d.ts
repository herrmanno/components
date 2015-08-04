/// <reference path="bower_components/ho-watch/dist/d.ts/watch.d.ts" />
/// <reference path="bower_components/ho-promise/dist/promise.d.ts" />
declare module ho.components {
    /**
        Baseclass for Attributes.
        Used Attributes needs to be specified by Component#attributes property to get loaded properly.
    */
    class Attribute {
        protected element: HTMLElement;
        protected component: Component;
        protected value: string;
        constructor(element: HTMLElement, value?: string);
        protected init(): void;
        name: string;
        update(): void;
        static getName(clazz: typeof Attribute | Attribute): string;
    }
    class WatchAttribute extends Attribute {
        protected r: RegExp;
        constructor(element: HTMLElement, value?: string);
        protected watch(path: string): void;
        protected eval(path: string): any;
    }
}
declare module ho.components.attributeprovider {
    import Promise = ho.promise.Promise;
    class AttributeProvider {
        useMin: boolean;
        resolve(name: string): string;
        getAttribute(name: string): Promise<typeof Attribute, string>;
    }
    let instance: AttributeProvider;
}
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
declare module ho.components.registry {
    import Promise = ho.promise.Promise;
    class Registry {
        private components;
        private attributes;
        register(ca: typeof Component | typeof Attribute): void;
        run(): Promise<any, any>;
        initComponent(component: typeof Component, element?: HTMLElement | Document): Promise<any, any>;
        initElement(element: HTMLElement): void;
        hasComponent(name: string): boolean;
        hasAttribute(name: string): boolean;
        getAttribute(name: string): typeof Attribute;
        loadComponent(name: string): Promise<typeof Component, string>;
        protected getParentOfComponent(name: string): Promise<string, any>;
        loadAttribute(name: string): Promise<typeof Attribute, string>;
    }
    let instance: Registry;
}
declare module ho.components {
    function run(): ho.promise.Promise<any, any>;
    function register(c: typeof Component | typeof Attribute): void;
}
declare module ho.components.htmlprovider {
    import Promise = ho.promise.Promise;
    class HtmlProvider {
        private cache;
        resolve(name: string): string;
        getHTML(name: string): Promise<string, string>;
    }
    let instance: HtmlProvider;
}
declare module ho.components.temp {
    function set(d: any): number;
    function get(i: number): any;
    function call(i: number, ...args: any[]): void;
}
declare module ho.components.renderer {
    class Renderer {
        private r;
        private cache;
        render(component: Component): void;
        private parse(html, root?);
        private renderRepeat(root, models);
        private domToString(root, indent);
        private repl(str, models);
        private evaluate(models, path);
        private evaluateValue(models, path);
        private evaluateValueAndModel(models, path);
        private evaluateExpression(models, path);
        private evaluateFunction(models, path);
        private copyNode(node);
    }
    let instance: Renderer;
}
declare module ho.components {
    import Promise = ho.promise.Promise;
    interface ComponentElement extends HTMLElement {
        component?: Component;
    }
    interface IProprety {
        name: string;
        required?: boolean;
        default?: any;
    }
    /**
        Baseclass for Components
        important: do initialization work in Component#init
    */
    class Component {
        element: ComponentElement;
        original_innerHTML: string;
        html: string;
        properties: Array<string | IProprety>;
        attributes: Array<string>;
        requires: Array<string>;
        children: {
            [key: string]: any;
        };
        constructor(element: HTMLElement);
        name: string;
        getName(): string;
        getParent(): Component;
        _init(): Promise<any, any>;
        /**
            Method that get called after initialization of a new instance.
            Do init-work here.
            May return a Promise.
        */
        init(): any;
        update(): void;
        render(): void;
        /**
        *  Assure that this instance has an valid html attribute and if not load and set it.
        */
        private initHTML();
        private initProperties();
        private initChildren();
        private initAttributes();
        private loadRequirements();
        static getComponent(element: ComponentElement): Component;
        static getName(clazz: typeof Component): string;
        static getName(clazz: Component): string;
    }
}
