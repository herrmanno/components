/// <reference path="registry.d.ts" />
declare module ho.components {
    function run(): ho.promise.Promise<any, any>;
    function register(c: typeof Component | typeof Attribute): void;
}
