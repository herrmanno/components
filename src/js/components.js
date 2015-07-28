/// <reference path="./registry"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var Promise = ho.promise.Promise;
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Component = (function () {
            //static name: string;
            function Component(element) {
                this.properties = [];
                this.property = {};
                this.requires = [];
                this.children = {};
                //------- init Elemenet and Elements' original innerHTML
                this.element = element;
                this.element.component = this;
                this.original_innerHTML = element.innerHTML;
            }
            Component.prototype.getParent = function () {
                return Component.getComponent(this.element.parentNode);
            };
            Component.prototype._init = function () {
                var render = this.render.bind(this);
                //-------- init Properties
                this.initProperties();
                //------- call init() & loadRequirements() -> then render
                var ready = [this.initHTML(), Promise.create(this.init()), this.loadRequirements()];
                Promise.all(ready)
                    .then(function () {
                    render();
                })
                    .catch(function (err) {
                    throw err;
                });
            };
            Component.prototype.init = function () { };
            Component.prototype.update = function () { return void 0; };
            Component.prototype.render = function () {
                Component.registry.render(this);
                this.update();
                this.initChildren();
                Component.registry.initElement(this.element);
            };
            ;
            /**
            *  Assure that this instance has an valid html attribute and if not load it.
            */
            Component.prototype.initHTML = function () {
                var p = new Promise();
                var self = this;
                if (typeof this.html === 'boolean')
                    p.resolve();
                if (typeof this.html === 'string')
                    p.resolve();
                if (typeof this.html === 'undefined') {
                    var name_1 = Component.getName(this);
                    Component.registry.getHtml(name_1)
                        .then(function (html) {
                        self.html = html;
                        p.resolve();
                    })
                        .catch(p.reject);
                }
                return p;
            };
            Component.prototype.initProperties = function () {
                this.properties.forEach(function (prop) {
                    if (typeof prop === 'object') {
                        this.properties[prop.name] = this.element[prop.name] || this.element.getAttribute(prop.name) || prop.default;
                        if (this.properties[prop.name] === undefined && prop.required === true)
                            throw "Property " + prop.name + " is required but not provided";
                    }
                    else if (typeof prop === 'string')
                        this.properties[prop] = this.element[prop] || this.element.getAttribute(prop);
                }.bind(this));
            };
            Component.prototype.initChildren = function () {
                var childs = this.element.querySelectorAll('*');
                for (var c = 0; c < childs.length; c++) {
                    var child = childs[c];
                    if (child.id) {
                        this.children[child.id] = child;
                    }
                    this.children[child.tagName] = this.children[child.tagName] || [];
                    this.children[child.tagName].push(child);
                }
            };
            Component.prototype.loadRequirements = function () {
                var promises = this.requires
                    .filter(function (req) {
                    return !Component.registry.hasComponent(req);
                })
                    .map(function (req) {
                    return Component.registry.loadComponent(req);
                });
                return Promise.all(promises);
            };
            ;
            Component.register = function (c) {
                Component.registry.register(c);
            };
            Component.run = function (opt) {
                Component.registry.setOptions(opt);
                Component.registry.run();
            };
            Component.getComponent = function (element) {
                while (!element.component)
                    element = element.parentNode;
                return element.component;
            };
            Component.getName = function (clazz) {
                if (clazz instanceof Component)
                    return clazz.constructor.toString().match(/\w+/g)[1];
                else
                    return clazz.toString().match(/\w+/g)[1];
            };
            Component.registry = new components.Registry();
            return Component;
        })();
        components.Component = Component;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
