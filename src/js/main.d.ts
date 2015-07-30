/// <reference path="registry.d.ts" />
declare module ho.components {
    function run(): void;
    function register(c: typeof Component | typeof Attribute): void;
}
