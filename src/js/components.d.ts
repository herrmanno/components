/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
import Promise = ho.promise.Promise;
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
        property: {
            [key: string]: string;
        };
        requires: Array<string>;
        children: {
            [key: string]: any;
        };
        static registry: Registry;
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
        private loadRequirements();
        static register(c: typeof Component): void;
        static run(opt?: any): void;
        static getComponent(element: ComponentElement): Component;
        static getName(clazz: typeof Component | Component): string;
    }
}
