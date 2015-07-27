/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
import Promise = ho.promise.Promise;
declare module ho.components {
    class Component {
        element: any;
        original_innerHTML: string;
        html: string;
        properties: Array<string> | any;
        requires: Array<string>;
        static registry: Registry;
        static name: string;
        constructor(element: HTMLElement);
        _init(): void;
        init(): Promise;
        update(): void;
        render(): void;
        private initProperties();
        private loadRequirements();
        static register(c: typeof Component): void;
        static run(opt?: any): void;
    }
}
