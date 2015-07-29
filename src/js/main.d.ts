/// <reference path="registry.d.ts" />
declare module ho.components {
    function run(): void;
    function register(component: typeof Component): void;
}
