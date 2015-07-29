/// <reference path="options"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Registry = (function () {
            function Registry(options) {
                this.components = [];
                this.htmlMap = {};
                this.options = new components.RegistryOptions(options);
            }
            Registry.prototype.setOptions = function (options) {
                this.options = new components.RegistryOptions(options);
            };
            Registry.prototype.register = function (c) {
                this.components.push(c);
                document.createElement(components.Component.getName(c));
            };
            Registry.prototype.run = function () {
                var _this = this;
                this.components.forEach(function (c) {
                    _this.initComponent(c);
                });
            };
            Registry.prototype.initComponent = function (component, element) {
                if (element === void 0) { element = document; }
                Array.prototype.forEach.call(element.querySelectorAll(components.Component.getName(component)), function (e) {
                    new component(e)._init();
                });
            };
            Registry.prototype.initElement = function (element) {
                var _this = this;
                this.components.forEach(function (component) {
                    _this.initComponent(component, element);
                });
            };
            Registry.prototype.hasComponent = function (name) {
                return this.components
                    .filter(function (component) {
                    return components.Component.getName(component) === name;
                }).length > 0;
            };
            Registry.prototype.loadComponent = function (name) {
                return this.options.componentProvider.getComponent(name);
            };
            Registry.prototype.getHtml = function (name) {
                var p = new Promise();
                if (this.htmlMap[name] !== undefined) {
                    p.resolve(this.htmlMap[name]);
                }
                else {
                    this.options.htmlProvider.getHTML(name)
                        .then(function (html) {
                        p.resolve(html);
                    });
                }
                return p;
            };
            Registry.prototype.render = function (component) {
                this.options.renderer.render(component);
            };
            return Registry;
        })();
        components.Registry = Registry;
        components.registry = new Registry();
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
