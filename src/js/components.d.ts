/// <reference path="htmlprovider.d.ts" />
/// <reference path="renderer.d.ts" />
/// <reference path="attribute.d.ts" />
/// <reference path="../../bower_components/ho-promise/dist/promise.d.ts" />
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
