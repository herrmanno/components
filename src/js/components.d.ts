/// <reference path="htmlprovider.d.ts" />
/// <reference path="renderer.d.ts" />
/// <reference path="attribute.d.ts" />
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
declare module ho.components {
    interface ComponentElement extends HTMLElement {
        component?: Component;
    }
    interface IProprety {
        name: string;
        required?: boolean;
        default?: any;
    }
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
        getParent(): Component;
        _init(): void;
        init(): any;
        update(): void;
        render(): void;
        /**
        *  Assure that this instance has an valid html attribute and if not load it.
        */
        private initHTML();
        private initProperties();
        private initChildren();
        private initAttributes();
        private loadRequirements();
        static getComponent(element: ComponentElement): Component;
        static getName(clazz: typeof Component | Component): string;
    }
}
