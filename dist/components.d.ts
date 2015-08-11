/// <reference path="bower_components/ho-promise/dist/promise.d.ts" />
/// <reference path="bower_components/ho-classloader/dist/classloader.d.ts" />
/// <reference path="bower_components/ho-watch/dist/watch.d.ts" />
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
        style: string;
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
        private initStyle();
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
declare module ho.components {
    function run(): ho.promise.Promise<any, any>;
    function register(c: typeof Component | typeof Attribute): void;
    let dir: boolean;
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
declare module ho.components.registry {
    import Promise = ho.promise.Promise;
    let mapping: {
        [key: string]: string;
    };
    class Registry {
        private components;
        private attributes;
        private componentLoader;
        private attributeLoader;
        register(ca: typeof Component | typeof Attribute): void;
        run(): Promise<any, any>;
        initComponent(component: typeof Component, element?: HTMLElement | Document): Promise<any, any>;
        initElement(element: HTMLElement): Promise<any, any>;
        hasComponent(name: string): boolean;
        hasAttribute(name: string): boolean;
        getAttribute(name: string): typeof Attribute;
        loadComponent(name: string): Promise<typeof Component, string>;
        loadAttribute(name: string): Promise<typeof Attribute, string>;
    }
    let instance: Registry;
}
declare module ho.components.renderer {
    class Renderer {
        private r;
        private voids;
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
        private isVoid(name);
    }
    let instance: Renderer;
}
declare module ho.components.styler {
    interface IStyler {
        applyStyle(component: Component, css?: string): void;
    }
    let instance: IStyler;
}
declare module ho.components.temp {
    function set(d: any): number;
    function get(i: number): any;
    function call(i: number, ...args: any[]): void;
}
