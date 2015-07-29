/// <reference path="./registry.ts"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        function run() {
            ho.components.registry.instance.run();
        }
        components.run = run;
        function register(component) {
            ho.components.registry.instance.register(component);
        }
        components.register = register;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
