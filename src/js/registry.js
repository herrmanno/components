/// <reference path="./componentsprovider.ts"/>
/// <reference path="./attributeprovider.ts"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var registry;
        (function (registry) {
            var Promise = ho.promise.Promise;
            var Registry = (function () {
                function Registry() {
                    this.components = [];
                    this.attributes = [];
                }
                //private options: RegistryOptions;
                //private htmlMap: {[key: string]: string} = {};
                /*
                constructor(options?: any) {
                    this.options = new RegistryOptions(options);
                }
        
                public setOptions(options?: any) {
                    this.options = new RegistryOptions(options);
                }
                */
                Registry.prototype.register = function (c) {
                    this.components.push(c);
                    document.createElement(components.Component.getName(c));
                };
                Registry.prototype.registerAttribute = function (a) {
                    this.attributes.push(a);
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
                Registry.prototype.hasAttribute = function (name) {
                    return this.attributes
                        .filter(function (attribute) {
                        return components.Attribute.getName(attribute) === name;
                    }).length > 0;
                };
                Registry.prototype.getAttribute = function (name) {
                    return this.attributes
                        .filter(function (attribute) {
                        return components.Attribute.getName(attribute) === name;
                    })[0];
                };
                Registry.prototype.loadComponent = function (name) {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        ho.components.componentprovider.instance.getComponent(name)
                            .then(function (component) {
                            self.register(component);
                            resolve(component);
                        });
                    });
                    //return this.options.componentProvider.getComponent(name)
                };
                Registry.prototype.loadAttribute = function (name) {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        ho.components.attributeprovider.instance.getAttribute(name)
                            .then(function (attribute) {
                            self.registerAttribute(attribute);
                            resolve(attribute);
                        });
                    });
                    //return this.options.componentProvider.getComponent(name)
                };
                return Registry;
            })();
            registry.Registry = Registry;
            registry.instance = new Registry();
        })(registry = components.registry || (components.registry = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
