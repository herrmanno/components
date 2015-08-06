/// <reference path="attribute.d.ts" />
declare module ho.components.attributeprovider {
    import Promise = ho.promise.Promise;
    let mapping: {
        [name: string]: string;
    };
    class AttributeProvider {
        useMin: boolean;
        resolve(name: string): string;
        getAttribute(name: string): Promise<typeof Attribute, string>;
    }
    let instance: AttributeProvider;
}
