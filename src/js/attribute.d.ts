/// <reference path="../../bower_components/ho-watch/dist/d.ts/watch.d.ts" />
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
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
