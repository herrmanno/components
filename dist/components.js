var ho;
(function (ho) {
    var components;
    (function (components) {
        var componentprovider;
        (function (componentprovider) {
            var Promise = ho.promise.Promise;
            var ComponentProvider = (function () {
                function ComponentProvider() {
                    this.useMin = false;
                }
                ComponentProvider.prototype.resolve = function (name) {
                    return this.useMin ?
                        "components/" + name + ".min.js" :
                        "components/" + name + ".js";
                };
                ComponentProvider.prototype.getComponent = function (name) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var src = _this.resolve(name);
                        var script = document.createElement('script');
                        script.onload = function () {
                            //Component.register(window[name]);
                            if (typeof window[name] === 'function')
                                resolve(window[name]);
                            else
                                reject("Error while loading Component " + name);
                        };
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    });
                };
                return ComponentProvider;
            })();
            componentprovider.ComponentProvider = ComponentProvider;
            componentprovider.instance = new ComponentProvider();
        })(componentprovider = components.componentprovider || (components.componentprovider = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="../../bower_components/ho-watch/dist/d.ts/watch.d.ts"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ho;
(function (ho) {
    var components;
    (function (components) {
        /**
            Baseclass for Attributes.
            Used Attributes needs to be specified by Component#attributes property to get loaded properly.
        */
        var Attribute = (function () {
            function Attribute(element, value) {
                this.element = element;
                this.component = components.Component.getComponent(element);
                this.value = value;
                this.init();
            }
            Attribute.prototype.init = function () { };
            Object.defineProperty(Attribute.prototype, "name", {
                get: function () {
                    return Attribute.getName(this);
                },
                enumerable: true,
                configurable: true
            });
            Attribute.prototype.update = function () {
            };
            Attribute.getName = function (clazz) {
                if (clazz instanceof Attribute)
                    return clazz.constructor.toString().match(/\w+/g)[1];
                else
                    return clazz.toString().match(/\w+/g)[1];
            };
            return Attribute;
        })();
        components.Attribute = Attribute;
        var WatchAttribute = (function (_super) {
            __extends(WatchAttribute, _super);
            function WatchAttribute(element, value) {
                _super.call(this, element, value);
                this.r = /#(.+?)#/g;
                var m = this.value.match(this.r) || [];
                m.map(function (w) {
                    w = w.substr(1, w.length - 2);
                    this.watch(w);
                }.bind(this));
                this.value = this.value.replace(/#/g, '');
            }
            WatchAttribute.prototype.watch = function (path) {
                var pathArr = path.split('.');
                var prop = pathArr.pop();
                var obj = this.component;
                pathArr.map(function (part) {
                    obj = obj[part];
                });
                ho.watch.watch(obj, prop, this.update.bind(this));
            };
            WatchAttribute.prototype.eval = function (path) {
                var model = this.component;
                model = new Function(Object.keys(model).toString(), "return " + path)
                    .apply(null, Object.keys(model).map(function (k) { return model[k]; }));
                return model;
            };
            return WatchAttribute;
        })(Attribute);
        components.WatchAttribute = WatchAttribute;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="./attribute.ts"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var attributeprovider;
        (function (attributeprovider) {
            var Promise = ho.promise.Promise;
            var AttributeProvider = (function () {
                function AttributeProvider() {
                    this.useMin = false;
                }
                AttributeProvider.prototype.resolve = function (name) {
                    return this.useMin ?
                        "attributes/" + name + ".min.js" :
                        "attributes/" + name + ".js";
                };
                AttributeProvider.prototype.getAttribute = function (name) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var src = _this.resolve(name);
                        var script = document.createElement('script');
                        script.onload = function () {
                            //Component.register(window[name]);
                            if (typeof window[name] === 'function')
                                resolve(window[name]);
                            else
                                reject("Error while loading Attribute " + name);
                        };
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    });
                };
                return AttributeProvider;
            })();
            attributeprovider.AttributeProvider = AttributeProvider;
            attributeprovider.instance = new AttributeProvider();
        })(attributeprovider = components.attributeprovider || (components.attributeprovider = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
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
                Registry.prototype.register = function (ca) {
                    if (ca.prototype instanceof components.Component) {
                        this.components.push(ca);
                        document.createElement(components.Component.getName(ca));
                    }
                    else if (ca.prototype instanceof components.Attribute) {
                        this.attributes.push(ca);
                    }
                };
                Registry.prototype.run = function () {
                    var initComponent = this.initComponent.bind(this);
                    var promises = this.components.map(function (c) {
                        return initComponent(c);
                    });
                    return Promise.all(promises);
                };
                Registry.prototype.initComponent = function (component, element) {
                    if (element === void 0) { element = document; }
                    var promises = Array.prototype.map.call(element.querySelectorAll(components.Component.getName(component)), function (e) {
                        return new component(e)._init();
                    });
                    return Promise.all(promises);
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
                    return ho.components.componentprovider.instance.getComponent(name)
                        .then(function (component) {
                        self.register(component);
                        return component;
                    });
                    //return this.options.componentProvider.getComponent(name)
                };
                Registry.prototype.loadAttribute = function (name) {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        ho.components.attributeprovider.instance.getAttribute(name)
                            .then(function (attribute) {
                            self.register(attribute);
                            resolve(attribute);
                        });
                    });
                };
                return Registry;
            })();
            registry.Registry = Registry;
            registry.instance = new Registry();
        })(registry = components.registry || (components.registry = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="./registry.ts"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        function run() {
            return ho.components.registry.instance.run();
        }
        components.run = run;
        function register(c) {
            ho.components.registry.instance.register(c);
        }
        components.register = register;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
var ho;
(function (ho) {
    var components;
    (function (components) {
        var htmlprovider;
        (function (htmlprovider) {
            var Promise = ho.promise.Promise;
            var HtmlProvider = (function () {
                function HtmlProvider() {
                    this.cache = {};
                }
                HtmlProvider.prototype.resolve = function (name) {
                    return "components/" + name + ".html";
                };
                HtmlProvider.prototype.getHTML = function (name) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        if (typeof _this.cache[name] === 'string')
                            return resolve(_this.cache[name]);
                        var url = _this.resolve(name);
                        var xmlhttp = new XMLHttpRequest();
                        xmlhttp.onreadystatechange = function () {
                            if (xmlhttp.readyState == 4) {
                                var resp = xmlhttp.responseText;
                                if (xmlhttp.status == 200) {
                                    resolve(resp);
                                }
                                else {
                                    reject("Error while loading html for Component " + name);
                                }
                            }
                        };
                        xmlhttp.open('GET', url, true);
                        xmlhttp.send();
                    });
                };
                return HtmlProvider;
            })();
            htmlprovider.HtmlProvider = HtmlProvider;
            htmlprovider.instance = new HtmlProvider();
        })(htmlprovider = components.htmlprovider || (components.htmlprovider = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
var ho;
(function (ho) {
    var components;
    (function (components) {
        var temp;
        (function (temp) {
            var c = -1;
            var data = [];
            function set(d) {
                c++;
                data[c] = d;
                return c;
            }
            temp.set = set;
            function get(i) {
                return data[i];
            }
            temp.get = get;
            function call(i) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                data[i].apply(data, args);
            }
            temp.call = call;
        })(temp = components.temp || (components.temp = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="./registry.ts"/>
/// <reference path="./temp"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var renderer;
        (function (renderer) {
            var Registry = ho.components.registry.instance;
            var Node = (function () {
                function Node() {
                    this.children = [];
                }
                return Node;
            })();
            var Renderer = (function () {
                function Renderer() {
                    this.r = {
                        tag: /<([^>]*?(?:(?:('|")[^'"]*?\2)[^>]*?)*)>/,
                        repeat: /repeat=["|'].+["|']/,
                        type: /[\s|/]*(.*?)[\s|\/|>]/,
                        text: /(?:.|[\r\n])*?[^"'\\]</m
                    };
                    this.cache = {};
                }
                Renderer.prototype.render = function (component) {
                    if (typeof component.html === 'boolean' && !component.html)
                        return;
                    var name = component.name;
                    var root = this.cache[name] = this.cache[name] || this.parse(component.html).root;
                    root = this.renderRepeat(this.copyNode(root), component);
                    var html = this.domToString(root, -1);
                    component.element.innerHTML = html;
                };
                Renderer.prototype.parse = function (html, root) {
                    if (root === void 0) { root = new Node(); }
                    var m;
                    while ((m = this.r.tag.exec(html)) !== null) {
                        var tag, type, closing, selfClosing, repeat, unClose;
                        //------- found some text before next tag
                        if (m.index !== 0) {
                            tag = html.match(this.r.text)[0];
                            tag = tag.substr(0, tag.length - 1);
                            type = 'TEXT';
                            selfClosing = true;
                            repeat = false;
                        }
                        else {
                            tag = m[1].trim();
                            type = (tag + '>').match(this.r.type)[1];
                            closing = tag[0] === '/';
                            selfClosing = tag[tag.length - 1] === '/';
                            repeat = !!tag.match(this.r.repeat);
                            if (selfClosing && Registry.hasComponent(type)) {
                                selfClosing = false;
                                tag = tag.substr(0, tag.length - 1) + " ";
                                unClose = true;
                            }
                        }
                        html = html.slice(tag.length + (type === 'TEXT' ? 0 : 2));
                        if (closing) {
                            break;
                        }
                        else {
                            root.children.push({ parent: root, html: tag, type: type, selfClosing: selfClosing, repeat: repeat, children: [] });
                            if (!unClose && !selfClosing) {
                                var result = this.parse(html, root.children[root.children.length - 1]);
                                html = result.html;
                                root.children.pop();
                                root.children.push(result.root);
                            }
                        }
                        m = html.match(this.r.tag);
                    }
                    return { root: root, html: html };
                };
                Renderer.prototype.renderRepeat = function (root, models) {
                    models = [].concat(models);
                    for (var c = 0; c < root.children.length; c++) {
                        var child = root.children[c];
                        if (child.repeat) {
                            var regex = /repeat=["|']\s*(\S+)\s+as\s+(\S+?)["|']/;
                            var m = child.html.match(regex).slice(1);
                            var name = m[1];
                            var indexName;
                            if (name.indexOf(',') > -1) {
                                var names = name.split(',');
                                name = names[0].trim();
                                indexName = names[1].trim();
                            }
                            var model = this.evaluate(models, m[0]);
                            var holder = [];
                            model.forEach(function (value, index) {
                                var model2 = {};
                                model2[name] = value;
                                model2[indexName] = index;
                                var models2 = [].concat(models);
                                models2.unshift(model2);
                                var node = this.copyNode(child);
                                node.repeat = false;
                                node.html = node.html.replace(this.r.repeat, '');
                                node.html = this.repl(node.html, models2);
                                node = this.renderRepeat(node, models2);
                                //root.children.splice(root.children.indexOf(child), 0, node);
                                holder.push(node);
                            }.bind(this));
                            holder.forEach(function (n) {
                                root.children.splice(root.children.indexOf(child), 0, n);
                            });
                            root.children.splice(root.children.indexOf(child), 1);
                        }
                        else {
                            child.html = this.repl(child.html, models);
                            child = this.renderRepeat(child, models);
                            root.children[c] = child;
                        }
                    }
                    return root;
                };
                Renderer.prototype.domToString = function (root, indent) {
                    indent = indent || 0;
                    var html = '';
                    var tab = '\t';
                    if (root.html) {
                        html += new Array(indent).join(tab); //tab.repeat(indent);;
                        if (root.type !== 'TEXT')
                            html += '<' + root.html + '>';
                        else
                            html += root.html;
                    }
                    if (html)
                        html += '\n';
                    if (root.children.length) {
                        html += root.children.map(function (c) {
                            return this.domToString(c, indent + (root.type ? 1 : 2));
                        }.bind(this)).join('\n');
                    }
                    if (root.type && root.type !== 'TEXT' && !root.selfClosing) {
                        html += new Array(indent).join(tab); //tab.repeat(indent);
                        html += '</' + root.type + '>\n';
                    }
                    return html;
                };
                Renderer.prototype.repl = function (str, models) {
                    var regexG = /{(.+?)}}?/g;
                    var m = str.match(regexG);
                    if (!m)
                        return str;
                    while (m.length) {
                        var path = m[0];
                        path = path.substr(1, path.length - 2);
                        var value = this.evaluate(models, path);
                        if (value !== undefined) {
                            if (typeof value === 'function') {
                                value = "ho.components.Component.getComponent(this)." + path;
                            }
                            str = str.replace(m[0], value);
                        }
                        m = m.slice(1);
                    }
                    return str;
                };
                Renderer.prototype.evaluate = function (models, path) {
                    if (path[0] === '{' && path[--path.length] === '}')
                        return this.evaluateExpression(models, path.substr(1, path.length - 2));
                    else if (path[0] === '#')
                        return this.evaluateFunction(models, path.substr(1));
                    else
                        return this.evaluateValue(models, path);
                };
                Renderer.prototype.evaluateValue = function (models, path) {
                    return this.evaluateValueAndModel(models, path).value;
                };
                Renderer.prototype.evaluateValueAndModel = function (models, path) {
                    if (models.indexOf(window) == -1)
                        models.push(window);
                    var mi = 0;
                    var model = void 0;
                    while (mi < models.length && model === undefined) {
                        model = models[mi];
                        try {
                            model = new Function("model", "return model['" + path.split(".").join("']['") + "']")(model);
                        }
                        catch (e) {
                            model = void 0;
                        }
                        finally {
                            mi++;
                        }
                    }
                    return { "value": model, "model": models[--mi] };
                };
                Renderer.prototype.evaluateExpression = function (models, path) {
                    if (models.indexOf(window) == -1)
                        models.push(window);
                    var mi = 0;
                    var model = void 0;
                    while (mi < models.length && model === undefined) {
                        model = models[mi];
                        try {
                            //with(model) model = eval(path);
                            model = new Function(Object.keys(model).toString(), "return " + path)
                                .apply(null, Object.keys(model).map(function (k) { return model[k]; }));
                        }
                        catch (e) {
                            model = void 0;
                        }
                        finally {
                            mi++;
                        }
                    }
                    return model;
                };
                Renderer.prototype.evaluateFunction = function (models, path) {
                    var exp = this.evaluateExpression.bind(this, models);
                    var _a = path.split('('), name = _a[0], args = _a[1];
                    args = args.substr(0, --args.length);
                    var _b = this.evaluateValueAndModel(models, name), value = _b.value, model = _b.model;
                    var func = value;
                    var argArr = args.split('.').map(function (arg) {
                        return arg.indexOf('#') === 0 ?
                            arg.substr(1) :
                            exp(arg);
                    });
                    func = func.bind.apply(func, [model].concat(argArr));
                    var index = ho.components.temp.set(func);
                    var str = "ho.components.temp.call(" + index + ")";
                    return str;
                };
                Renderer.prototype.copyNode = function (node) {
                    var copyNode = this.copyNode.bind(this);
                    var n = {
                        parent: node.parent,
                        html: node.html,
                        type: node.type,
                        selfClosing: node.selfClosing,
                        repeat: node.repeat,
                        children: node.children.map(copyNode)
                    };
                    return n;
                };
                return Renderer;
            })();
            renderer.Renderer = Renderer;
            renderer.instance = new Renderer();
        })(renderer = components.renderer || (components.renderer = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="./main"/>
/// <reference path="./registry"/>
/// <reference path="./htmlprovider.ts"/>
/// <reference path="./renderer.ts"/>
/// <reference path="./attribute.ts"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var ho;
(function (ho) {
    var components;
    (function (components_1) {
        var Registry = ho.components.registry.instance;
        var HtmlProvider = ho.components.htmlprovider.instance;
        var Renderer = ho.components.renderer.instance;
        var Promise = ho.promise.Promise;
        /**
            Baseclass for Components
            important: do initialization work in Component#init
        */
        var Component = (function () {
            function Component(element) {
                this.properties = [];
                this.attributes = [];
                this.requires = [];
                this.children = {};
                //------- init Elemenet and Elements' original innerHTML
                this.element = element;
                this.element.component = this;
                this.original_innerHTML = element.innerHTML;
            }
            Object.defineProperty(Component.prototype, "name", {
                get: function () {
                    return Component.getName(this);
                },
                enumerable: true,
                configurable: true
            });
            Component.prototype.getName = function () {
                return this.name;
            };
            Component.prototype.getParent = function () {
                return Component.getComponent(this.element.parentNode);
            };
            Component.prototype._init = function () {
                var render = this.render.bind(this);
                //-------- init Properties
                this.initProperties();
                //------- call init() & loadRequirements() -> then render
                var ready = [this.initHTML(), Promise.create(this.init()), this.loadRequirements()];
                var p = new Promise();
                Promise.all(ready)
                    .then(function () {
                    p.resolve();
                    render();
                })
                    .catch(function (err) {
                    p.reject(err);
                    throw err;
                });
                return p;
            };
            /**
                Method that get called after initialization of a new instance.
                Do init-work here.
                May return a Promise.
            */
            Component.prototype.init = function () { };
            Component.prototype.update = function () { return void 0; };
            Component.prototype.render = function () {
                Renderer.render(this);
                Registry.initElement(this.element);
                this.initChildren();
                this.initAttributes();
                this.update();
            };
            ;
            /**
            *  Assure that this instance has an valid html attribute and if not load and set it.
            */
            Component.prototype.initHTML = function () {
                var p = new Promise();
                var self = this;
                if (typeof this.html === 'boolean')
                    p.resolve();
                if (typeof this.html === 'string')
                    p.resolve();
                if (typeof this.html === 'undefined') {
                    //let name = Component.getName(this);
                    HtmlProvider.getHTML(this.name)
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
                    if (child.tagName)
                        this.children[child.tagName] = this.children[child.tagName] || [];
                    this.children[child.tagName].push(child);
                }
            };
            Component.prototype.initAttributes = function () {
                var _this = this;
                this.attributes
                    .forEach(function (a) {
                    var attr = Registry.getAttribute(a);
                    Array.prototype.forEach.call(_this.element.querySelectorAll("*[" + a + "]"), function (e) {
                        var val = e.hasOwnProperty(a) ? e[a] : e.getAttribute(a);
                        if (typeof val === 'string' && val === '')
                            val = void 0;
                        new attr(e, val).update();
                    });
                });
            };
            Component.prototype.loadRequirements = function () {
                var components = this.requires
                    .filter(function (req) {
                    return !Registry.hasComponent(req);
                })
                    .map(function (req) {
                    return Registry.loadComponent(req);
                });
                var attributes = this.attributes
                    .filter(function (req) {
                    return !Registry.hasAttribute(req);
                })
                    .map(function (req) {
                    return Registry.loadAttribute(req);
                });
                var promises = components.concat(attributes);
                return Promise.all(promises);
            };
            ;
            /*
            static register(c: typeof Component): void {
                Registry.register(c);
            }
            */
            /*
            static run(opt?: any) {
                Registry.setOptions(opt);
                Registry.run();
            }
            */
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
            return Component;
        })();
        components_1.Component = Component;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHNwcm92aWRlci50cyIsImF0dHJpYnV0ZS50cyIsImF0dHJpYnV0ZXByb3ZpZGVyLnRzIiwicmVnaXN0cnkudHMiLCJtYWluLnRzIiwiaHRtbHByb3ZpZGVyLnRzIiwidGVtcC50cyIsInJlbmRlcmVyLnRzIiwiY29tcG9uZW50cy50cyJdLCJuYW1lcyI6WyJobyIsImhvLmNvbXBvbmVudHMiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5Db21wb25lbnRQcm92aWRlciIsImhvLmNvbXBvbmVudHMuY29tcG9uZW50cHJvdmlkZXIuQ29tcG9uZW50UHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLkNvbXBvbmVudFByb3ZpZGVyLnJlc29sdmUiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLkNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS5pbml0IiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUubmFtZSIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlLnVwZGF0ZSIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlLmdldE5hbWUiLCJoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5XYXRjaEF0dHJpYnV0ZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUud2F0Y2giLCJoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlLmV2YWwiLCJoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5hdHRyaWJ1dGVwcm92aWRlci5BdHRyaWJ1dGVQcm92aWRlciIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIuQXR0cmlidXRlUHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLkF0dHJpYnV0ZVByb3ZpZGVyLnJlc29sdmUiLCJoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLkF0dHJpYnV0ZVByb3ZpZGVyLmdldEF0dHJpYnV0ZSIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5IiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkucmVnaXN0ZXIiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LnJ1biIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaW5pdENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaW5pdEVsZW1lbnQiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5Lmhhc0NvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaGFzQXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5nZXRBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRDb21wb25lbnQiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJ1biIsImhvLmNvbXBvbmVudHMucmVnaXN0ZXIiLCJoby5jb21wb25lbnRzLmh0bWxwcm92aWRlciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5yZXNvbHZlIiwiaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIuSHRtbFByb3ZpZGVyLmdldEhUTUwiLCJoby5jb21wb25lbnRzLnRlbXAiLCJoby5jb21wb25lbnRzLnRlbXAuc2V0IiwiaG8uY29tcG9uZW50cy50ZW1wLmdldCIsImhvLmNvbXBvbmVudHMudGVtcC5jYWxsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuTm9kZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuTm9kZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZW5kZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLnBhcnNlIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZW5kZXJSZXBlYXQiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmRvbVRvU3RyaW5nIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZXBsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZUFuZE1vZGVsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZUV4cHJlc3Npb24iLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmV2YWx1YXRlRnVuY3Rpb24iLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmNvcHlOb2RlIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50Lm5hbWUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXROYW1lIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0UGFyZW50IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuX2luaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQudXBkYXRlIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucmVuZGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdEhUTUwiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0UHJvcGVydGllcyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRDaGlsZHJlbiIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRBdHRyaWJ1dGVzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQubG9hZFJlcXVpcmVtZW50cyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldENvbXBvbmVudCJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxFQUFFLENBa0NSO0FBbENELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQWtDbkJBO0lBbENTQSxXQUFBQSxVQUFVQTtRQUFDQyxJQUFBQSxpQkFBaUJBLENBa0NyQ0E7UUFsQ29CQSxXQUFBQSxpQkFBaUJBLEVBQUNBLENBQUNBO1lBQ3BDQyxJQUFPQSxPQUFPQSxHQUFHQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUVwQ0E7Z0JBQUFDO29CQUVJQyxXQUFNQSxHQUFZQSxLQUFLQSxDQUFDQTtnQkF5QjVCQSxDQUFDQTtnQkF2QkdELG1DQUFPQSxHQUFQQSxVQUFRQSxJQUFZQTtvQkFDaEJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BO3dCQUNkQSxnQkFBY0EsSUFBSUEsWUFBU0E7d0JBQzNCQSxnQkFBY0EsSUFBSUEsUUFBS0EsQ0FBQ0E7Z0JB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TUEsRUFBRUEsT0FBT0EsQ0FBQ0E7d0JBQ3JEQSxBQUNBQSx5Q0FEeUNBO3dCQUN6Q0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ2xCQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDakNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUNsQ0EsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0E7NEJBQ2RBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBOzRCQUNuQkEsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7d0JBQ2hCQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBOzRCQUNsQkEsSUFBSUEsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ3ZDQSxPQUFPQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQTs0QkFDekJBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBOzRCQUN4Q0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7NEJBRXBDQSxFQUFFQSxDQUFBQSxDQUFDQSxXQUFXQSxJQUFJQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0NBLFdBQVdBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUNwQkEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7Z0NBRXhDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTs0QkFDaEJBLENBQUNBO3dCQUNGQSxDQUFDQTt3QkFFREEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7d0JBRTNEQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDWkEsS0FBS0EsQ0FBQ0E7d0JBQ1BBLENBQUNBO3dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDUEEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsV0FBV0EsRUFBRUEsV0FBV0EsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsUUFBUUEsRUFBRUEsRUFBRUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBRWxIQSxFQUFFQSxDQUFBQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDN0JBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dDQUNyRUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0NBQ25CQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQ0FDcEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBOzRCQUNqQ0EsQ0FBQ0E7d0JBQ0ZBLENBQUNBO3dCQUVEQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDNUJBLENBQUNBO29CQUVEQSxNQUFNQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQTtnQkFDakNBLENBQUNBO2dCQUVPSCwrQkFBWUEsR0FBcEJBLFVBQXFCQSxJQUFJQSxFQUFFQSxNQUFNQTtvQkFDaENJLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO29CQUUzQkEsR0FBR0EsQ0FBQUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7d0JBQzlDQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDN0JBLEVBQUVBLENBQUFBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBOzRCQUNqQkEsSUFBSUEsS0FBS0EsR0FBR0EseUNBQXlDQSxDQUFDQTs0QkFDdERBLElBQUlBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUN6Q0EsSUFBSUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ2hCQSxJQUFJQSxTQUFTQSxDQUFDQTs0QkFDZEEsRUFBRUEsQ0FBQUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQzNCQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtnQ0FDNUJBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO2dDQUN2QkEsU0FBU0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7NEJBQzdCQSxDQUFDQTs0QkFFREEsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBRXhDQSxJQUFJQSxNQUFNQSxHQUFHQSxFQUFFQSxDQUFDQTs0QkFDaEJBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLFVBQVNBLEtBQUtBLEVBQUVBLEtBQUtBO2dDQUNsQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0NBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7Z0NBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUM7Z0NBRTFCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ2hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBRXhCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFR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LENBQUNBLFVBQVVBLENBQUNBO2dCQUNoREEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDdkJBLENBQUNBO1lBRU1kLGlCQUFPQSxHQUFkQSxVQUFlQSxLQUF1Q0E7Z0JBQ2xERyxFQUFFQSxDQUFBQSxDQUFDQSxLQUFLQSxZQUFZQSxTQUFTQSxDQUFDQTtvQkFDMUJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN6REEsSUFBSUE7b0JBQ0FBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxDQUFDQTtZQUdMSCxnQkFBQ0E7UUFBREEsQ0F6TEE1RCxBQXlMQzRELElBQUE1RDtRQXpMWUEsc0JBQVNBLFlBeUxyQkEsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUEvTVNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBK01uQkE7QUFBREEsQ0FBQ0EsRUEvTU0sRUFBRSxLQUFGLEVBQUUsUUErTVIiLCJmaWxlIjoiY29tcG9uZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyIHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHVzZU1pbjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZU1pbiA/XHJcbiAgICAgICAgICAgICAgICBgY29tcG9uZW50cy8ke25hbWV9Lm1pbi5qc2AgOlxyXG4gICAgICAgICAgICAgICAgYGNvbXBvbmVudHMvJHtuYW1lfS5qc2A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRDb21wb25lbnQobmFtZTogc3RyaW5nKTogUHJvbWlzZTx0eXBlb2YgQ29tcG9uZW50LCBzdHJpbmc+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHR5cGVvZiBDb21wb25lbnQsIGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IHRoaXMucmVzb2x2ZShuYW1lKTtcclxuICAgICAgICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0NvbXBvbmVudC5yZWdpc3Rlcih3aW5kb3dbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB3aW5kb3dbbmFtZV0gPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93W25hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChgRXJyb3Igd2hpbGUgbG9hZGluZyBDb21wb25lbnQgJHtuYW1lfWApXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnRQcm92aWRlcigpO1xyXG5cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby13YXRjaC9kaXN0L2QudHMvd2F0Y2guZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cblxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xuXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xuXG5cdC8qKlxuXHRcdEJhc2VjbGFzcyBmb3IgQXR0cmlidXRlcy5cblx0XHRVc2VkIEF0dHJpYnV0ZXMgbmVlZHMgdG8gYmUgc3BlY2lmaWVkIGJ5IENvbXBvbmVudCNhdHRyaWJ1dGVzIHByb3BlcnR5IHRvIGdldCBsb2FkZWQgcHJvcGVybHkuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBBdHRyaWJ1dGUge1xuXG5cdFx0cHJvdGVjdGVkIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXHRcdHByb3RlY3RlZCBjb21wb25lbnQ6IENvbXBvbmVudDtcblx0XHRwcm90ZWN0ZWQgdmFsdWU6IHN0cmluZztcblxuXHRcdGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB2YWx1ZT86IHN0cmluZykge1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblx0XHRcdHRoaXMuY29tcG9uZW50ID0gQ29tcG9uZW50LmdldENvbXBvbmVudChlbGVtZW50KTtcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuXHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGluaXQoKTogdm9pZCB7fVxuXG5cdFx0Z2V0IG5hbWUoKSB7XG5cdFx0XHRyZXR1cm4gQXR0cmlidXRlLmdldE5hbWUodGhpcyk7XG5cdFx0fVxuXG5cblx0XHRwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuXG5cdFx0fVxuXG5cblx0XHRzdGF0aWMgZ2V0TmFtZShjbGF6ejogdHlwZW9mIEF0dHJpYnV0ZSB8IEF0dHJpYnV0ZSk6IHN0cmluZyB7XG4gICAgICAgICAgICBpZihjbGF6eiBpbnN0YW5jZW9mIEF0dHJpYnV0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xhenouY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xhenoudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICAgICAgfVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFdhdGNoQXR0cmlidXRlIGV4dGVuZHMgQXR0cmlidXRlIHtcblxuXHRcdHByb3RlY3RlZCByOiBSZWdFeHAgPSAvIyguKz8pIy9nO1xuXG5cdFx0Y29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQsIHZhbHVlPzogc3RyaW5nKSB7XG5cdFx0XHRzdXBlcihlbGVtZW50LCB2YWx1ZSk7XG5cblx0XHRcdGxldCBtOiBhbnlbXSA9IHRoaXMudmFsdWUubWF0Y2godGhpcy5yKSB8fCBbXTtcblx0XHRcdG0ubWFwKGZ1bmN0aW9uKHcpIHtcblx0XHRcdFx0dyA9IHcuc3Vic3RyKDEsIHcubGVuZ3RoLTIpO1xuXHRcdFx0XHR0aGlzLndhdGNoKHcpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlLnJlcGxhY2UoLyMvZywgJycpO1xuXHRcdH1cblxuXG5cdFx0cHJvdGVjdGVkIHdhdGNoKHBhdGg6IHN0cmluZyk6IHZvaWQge1xuXHRcdFx0bGV0IHBhdGhBcnIgPSBwYXRoLnNwbGl0KCcuJyk7XG5cdFx0XHRsZXQgcHJvcCA9IHBhdGhBcnIucG9wKCk7XG5cdFx0XHRsZXQgb2JqID0gdGhpcy5jb21wb25lbnQ7XG5cblx0XHRcdHBhdGhBcnIubWFwKChwYXJ0KSA9PiB7XG5cdFx0XHRcdG9iaiA9IG9ialtwYXJ0XTtcblx0XHRcdH0pO1xuXG5cdFx0XHRoby53YXRjaC53YXRjaChvYmosIHByb3AsIHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBldmFsKHBhdGg6IHN0cmluZyk6IGFueSB7XG5cdFx0XHRsZXQgbW9kZWwgPSB0aGlzLmNvbXBvbmVudDtcblx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKE9iamVjdC5rZXlzKG1vZGVsKS50b1N0cmluZygpLCBcInJldHVybiBcIiArIHBhdGgpXG5cdFx0XHRcdC5hcHBseShudWxsLCBPYmplY3Qua2V5cyhtb2RlbCkubWFwKChrKSA9PiB7cmV0dXJuIG1vZGVsW2tdfSkgKTtcblx0XHRcdHJldHVybiBtb2RlbDtcblx0XHR9XG5cblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYXR0cmlidXRlLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIge1xyXG4gICAgaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZVByb3ZpZGVyIHtcclxuXHJcbiAgICAgICAgdXNlTWluOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJlc29sdmUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlTWluID9cclxuICAgICAgICAgICAgICAgIGBhdHRyaWJ1dGVzLyR7bmFtZX0ubWluLmpzYCA6XHJcbiAgICAgICAgICAgICAgICBgYXR0cmlidXRlcy8ke25hbWV9LmpzYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBBdHRyaWJ1dGUsIHN0cmluZz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dHlwZW9mIEF0dHJpYnV0ZSwgYW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gdGhpcy5yZXNvbHZlKG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vQ29tcG9uZW50LnJlZ2lzdGVyKHdpbmRvd1tuYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHdpbmRvd1tuYW1lXSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh3aW5kb3dbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBFcnJvciB3aGlsZSBsb2FkaW5nIEF0dHJpYnV0ZSAke25hbWV9YClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgbGV0IGluc3RhbmNlID0gbmV3IEF0dHJpYnV0ZVByb3ZpZGVyKCk7XHJcblxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2NvbXBvbmVudHNwcm92aWRlci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYXR0cmlidXRlcHJvdmlkZXIudHNcIi8+XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cy5yZWdpc3RyeSB7XHJcbiAgICBpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVnaXN0cnkge1xyXG5cclxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudHM6IEFycmF5PHR5cGVvZiBDb21wb25lbnQ+ID0gW107XHJcbiAgICAgICAgcHJpdmF0ZSBhdHRyaWJ1dGVzOiBBcnJheTx0eXBlb2YgQXR0cmlidXRlPiA9IFtdO1xyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHJlZ2lzdGVyKGNhOiB0eXBlb2YgQ29tcG9uZW50IHwgdHlwZW9mIEF0dHJpYnV0ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZihjYS5wcm90b3R5cGUgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKDx0eXBlb2YgQ29tcG9uZW50PmNhKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LmdldE5hbWUoPHR5cGVvZiBDb21wb25lbnQ+Y2EpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKGNhLnByb3RvdHlwZSBpbnN0YW5jZW9mIEF0dHJpYnV0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLnB1c2goPHR5cGVvZiBBdHRyaWJ1dGU+Y2EpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcnVuKCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuICAgICAgICAgICAgbGV0IGluaXRDb21wb25lbnQ6IChjOiB0eXBlb2YgQ29tcG9uZW50KT0+UHJvbWlzZTxhbnksIGFueT4gPSB0aGlzLmluaXRDb21wb25lbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgbGV0IHByb21pc2VzOiBBcnJheTxQcm9taXNlPGFueSwgYW55Pj4gPSB0aGlzLmNvbXBvbmVudHMubWFwKChjKT0+e1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluaXRDb21wb25lbnQoYyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0Q29tcG9uZW50KGNvbXBvbmVudDogdHlwZW9mIENvbXBvbmVudCwgZWxlbWVudDpIVE1MRWxlbWVudHxEb2N1bWVudD1kb2N1bWVudCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuICAgICAgICAgICAgbGV0IHByb21pc2VzOiBBcnJheTxQcm9taXNlPGFueSwgYW55Pj4gPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoQ29tcG9uZW50LmdldE5hbWUoY29tcG9uZW50KSksXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlKTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNvbXBvbmVudChlKS5faW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0RWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRDb21wb25lbnQoY29tcG9uZW50LCBlbGVtZW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaGFzQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChjb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50LmdldE5hbWUoY29tcG9uZW50KSA9PT0gbmFtZTtcclxuICAgICAgICAgICAgICAgIH0pLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaGFzQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXR0cmlidXRlLmdldE5hbWUoYXR0cmlidXRlKSA9PT0gbmFtZTtcclxuICAgICAgICAgICAgICAgIH0pLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IHR5cGVvZiBBdHRyaWJ1dGUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEF0dHJpYnV0ZS5nZXROYW1lKGF0dHJpYnV0ZSkgPT09IG5hbWU7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGxvYWRDb21wb25lbnQobmFtZTogc3RyaW5nKTogUHJvbWlzZTx0eXBlb2YgQ29tcG9uZW50LCBzdHJpbmc+IHtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5pbnN0YW5jZS5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICAgICAgLnRoZW4oKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5yZWdpc3Rlcihjb21wb25lbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IFByb21pc2U8dHlwZW9mIEF0dHJpYnV0ZSwgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHR5cGVvZiBBdHRyaWJ1dGUsIHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaG8uY29tcG9uZW50cy5hdHRyaWJ1dGVwcm92aWRlci5pbnN0YW5jZS5nZXRBdHRyaWJ1dGUobmFtZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShhdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZSA9IG5ldyBSZWdpc3RyeSgpO1xyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JlZ2lzdHJ5LnRzXCIvPlxuXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XG5cdGV4cG9ydCBmdW5jdGlvbiBydW4oKTogaG8ucHJvbWlzZS5Qcm9taXNlPGFueSwgYW55PiB7XG5cdFx0cmV0dXJuIGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2UucnVuKCk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCB8IHR5cGVvZiBBdHRyaWJ1dGUpOiB2b2lkIHtcblx0XHRoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLnJlZ2lzdGVyKGMpO1xuXHR9XG59XG4iLCJtb2R1bGUgaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIge1xyXG4gICAgaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEh0bWxQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2FjaGU6IHtba2F5OnN0cmluZ106c3RyaW5nfSA9IHt9O1xyXG5cclxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgY29tcG9uZW50cy8ke25hbWV9Lmh0bWxgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0SFRNTChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZywgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuY2FjaGVbbmFtZV0gPT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRoaXMuY2FjaGVbbmFtZV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLnJlc29sdmUobmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIFx0XHRcdHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcdFx0XHRcdGlmKHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0KSB7XHJcbiAgICBcdFx0XHRcdFx0bGV0IHJlc3AgPSB4bWxodHRwLnJlc3BvbnNlVGV4dDtcclxuICAgIFx0XHRcdFx0XHRpZih4bWxodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcCk7XHJcbiAgICBcdFx0XHRcdFx0fSBlbHNlIHtcclxuICAgIFx0XHRcdFx0XHRcdHJlamVjdChgRXJyb3Igd2hpbGUgbG9hZGluZyBodG1sIGZvciBDb21wb25lbnQgJHtuYW1lfWApO1xyXG4gICAgXHRcdFx0XHRcdH1cclxuICAgIFx0XHRcdFx0fVxyXG4gICAgXHRcdFx0fTtcclxuXHJcbiAgICBcdFx0XHR4bWxodHRwLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICBcdFx0XHR4bWxodHRwLnNlbmQoKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgbGV0IGluc3RhbmNlID0gbmV3IEh0bWxQcm92aWRlcigpO1xyXG5cclxufVxyXG4iLCJcbm1vZHVsZSBoby5jb21wb25lbnRzLnRlbXAge1xuXHRcdHZhciBjOiBudW1iZXIgPSAtMTtcblx0XHR2YXIgZGF0YTogYW55W10gPSBbXTtcblxuXHRcdGV4cG9ydCBmdW5jdGlvbiBzZXQoZDogYW55KTogbnVtYmVyIHtcblx0XHRcdGMrKztcblx0XHRcdGRhdGFbY10gPSBkO1xuXHRcdFx0cmV0dXJuIGM7XG5cdFx0fVxuXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGdldChpOiBudW1iZXIpOiBhbnkge1xuXHRcdFx0cmV0dXJuIGRhdGFbaV07XG5cdFx0fVxuXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGNhbGwoaTogbnVtYmVyLCAuLi5hcmdzKTogdm9pZCB7XG5cdFx0XHRkYXRhW2ldKC4uLmFyZ3MpO1xuXHRcdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JlZ2lzdHJ5LnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90ZW1wXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMucmVuZGVyZXIge1xyXG4gICAgaW1wb3J0IFJlZ2lzdHJ5ID0gaG8uY29tcG9uZW50cy5yZWdpc3RyeS5pbnN0YW5jZTtcclxuXHJcbiAgICBpbnRlcmZhY2UgTm9kZUh0bWwge1xyXG4gICAgICAgIHJvb3Q6IE5vZGU7XHJcbiAgICAgICAgaHRtbDogc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIE5vZGUge1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgICAgICBwYXJlbnQ6IE5vZGU7XHJcbiAgICAgICAgY2hpbGRyZW46IEFycmF5PE5vZGU+ID0gW107XHJcbiAgICAgICAgdHlwZTogc3RyaW5nO1xyXG4gICAgICAgIHNlbGZDbG9zaW5nOiBib29sZWFuO1xyXG4gICAgICAgIHJlcGVhdDogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVuZGVyZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIHI6IGFueSA9IHtcclxuXHRcdFx0dGFnOiAvPChbXj5dKj8oPzooPzooJ3xcIilbXidcIl0qP1xcMilbXj5dKj8pKik+LyxcclxuXHRcdFx0cmVwZWF0OiAvcmVwZWF0PVtcInwnXS4rW1wifCddLyxcclxuXHRcdFx0dHlwZTogL1tcXHN8L10qKC4qPylbXFxzfFxcL3w+XS8sXHJcblx0XHRcdHRleHQ6IC8oPzoufFtcXHJcXG5dKSo/W15cIidcXFxcXTwvbSxcclxuXHRcdH07XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2FjaGU6IHtba2V5OnN0cmluZ106Tm9kZX0gPSB7fTtcclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcihjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgY29tcG9uZW50Lmh0bWwgPT09ICdib29sZWFuJyAmJiAhY29tcG9uZW50Lmh0bWwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IGNvbXBvbmVudC5uYW1lO1xyXG4gICAgICAgICAgICBsZXQgcm9vdCA9IHRoaXMuY2FjaGVbbmFtZV0gPSB0aGlzLmNhY2hlW25hbWVdIHx8IHRoaXMucGFyc2UoY29tcG9uZW50Lmh0bWwpLnJvb3Q7XHJcbiAgICAgICAgICAgIHJvb3QgPSB0aGlzLnJlbmRlclJlcGVhdCh0aGlzLmNvcHlOb2RlKHJvb3QpLCBjb21wb25lbnQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSB0aGlzLmRvbVRvU3RyaW5nKHJvb3QsIC0xKTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5lbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG5cdFx0cHJpdmF0ZSBwYXJzZShodG1sOiBzdHJpbmcsIHJvb3Q9IG5ldyBOb2RlKCkpOiBOb2RlSHRtbCB7XHJcblxyXG5cdFx0XHR2YXIgbTtcclxuXHRcdFx0d2hpbGUoKG0gPSB0aGlzLnIudGFnLmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XHJcblx0XHRcdFx0dmFyIHRhZywgdHlwZSwgY2xvc2luZywgc2VsZkNsb3NpbmcsIHJlcGVhdCwgdW5DbG9zZTtcclxuXHRcdFx0XHQvLy0tLS0tLS0gZm91bmQgc29tZSB0ZXh0IGJlZm9yZSBuZXh0IHRhZ1xyXG5cdFx0XHRcdGlmKG0uaW5kZXggIT09IDApIHtcclxuXHRcdFx0XHRcdHRhZyA9IGh0bWwubWF0Y2godGhpcy5yLnRleHQpWzBdO1xyXG5cdFx0XHRcdFx0dGFnID0gdGFnLnN1YnN0cigwLCB0YWcubGVuZ3RoLTEpO1xyXG5cdFx0XHRcdFx0dHlwZSA9ICdURVhUJztcclxuXHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHRcdHJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0YWcgPSBtWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdHR5cGUgPSAodGFnKyc+JykubWF0Y2godGhpcy5yLnR5cGUpWzFdO1xyXG5cdFx0XHRcdFx0Y2xvc2luZyA9IHRhZ1swXSA9PT0gJy8nO1xyXG5cdFx0XHRcdFx0c2VsZkNsb3NpbmcgPSB0YWdbdGFnLmxlbmd0aC0xXSA9PT0gJy8nO1xyXG5cdFx0XHRcdFx0cmVwZWF0ID0gISF0YWcubWF0Y2godGhpcy5yLnJlcGVhdCk7XHJcblxyXG5cdFx0XHRcdFx0aWYoc2VsZkNsb3NpbmcgJiYgUmVnaXN0cnkuaGFzQ29tcG9uZW50KHR5cGUpKSB7XHJcblx0XHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHRhZyA9IHRhZy5zdWJzdHIoMCwgdGFnLmxlbmd0aC0xKSArIFwiIFwiO1xyXG5cclxuXHRcdFx0XHRcdFx0dW5DbG9zZSA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRodG1sID0gaHRtbC5zbGljZSh0YWcubGVuZ3RoICsgKHR5cGUgPT09ICdURVhUJyA/IDAgOiAyKSApO1xyXG5cclxuXHRcdFx0XHRpZihjbG9zaW5nKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHtwYXJlbnQ6IHJvb3QsIGh0bWw6IHRhZywgdHlwZTogdHlwZSwgc2VsZkNsb3Npbmc6IHNlbGZDbG9zaW5nLCByZXBlYXQ6IHJlcGVhdCwgY2hpbGRyZW46IFtdfSk7XHJcblxyXG5cdFx0XHRcdFx0aWYoIXVuQ2xvc2UgJiYgIXNlbGZDbG9zaW5nKSB7XHJcblx0XHRcdFx0XHRcdHZhciByZXN1bHQgPSB0aGlzLnBhcnNlKGh0bWwsIHJvb3QuY2hpbGRyZW5bcm9vdC5jaGlsZHJlbi5sZW5ndGgtMV0pO1xyXG5cdFx0XHRcdFx0XHRodG1sID0gcmVzdWx0Lmh0bWw7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucG9wKCk7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucHVzaChyZXN1bHQucm9vdCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRtID0gaHRtbC5tYXRjaCh0aGlzLnIudGFnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtyb290OiByb290LCBodG1sOiBodG1sfTtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIHJlbmRlclJlcGVhdChyb290LCBtb2RlbHMpOiBOb2RlIHtcclxuXHRcdFx0bW9kZWxzID0gW10uY29uY2F0KG1vZGVscyk7XHJcblxyXG5cdFx0XHRmb3IodmFyIGMgPSAwOyBjIDwgcm9vdC5jaGlsZHJlbi5sZW5ndGg7IGMrKykge1xyXG5cdFx0XHRcdHZhciBjaGlsZCA9IHJvb3QuY2hpbGRyZW5bY107XHJcblx0XHRcdFx0aWYoY2hpbGQucmVwZWF0KSB7XHJcblx0XHRcdFx0XHR2YXIgcmVnZXggPSAvcmVwZWF0PVtcInwnXVxccyooXFxTKylcXHMrYXNcXHMrKFxcUys/KVtcInwnXS87XHJcblx0XHRcdFx0XHR2YXIgbSA9IGNoaWxkLmh0bWwubWF0Y2gocmVnZXgpLnNsaWNlKDEpO1xyXG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBtWzFdO1xyXG5cdFx0XHRcdFx0dmFyIGluZGV4TmFtZTtcclxuXHRcdFx0XHRcdGlmKG5hbWUuaW5kZXhPZignLCcpID4gLTEpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG5hbWVzID0gbmFtZS5zcGxpdCgnLCcpO1xyXG5cdFx0XHRcdFx0XHRuYW1lID0gbmFtZXNbMF0udHJpbSgpO1xyXG5cdFx0XHRcdFx0XHRpbmRleE5hbWUgPSBuYW1lc1sxXS50cmltKCk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dmFyIG1vZGVsID0gdGhpcy5ldmFsdWF0ZShtb2RlbHMsIG1bMF0pO1xyXG5cclxuXHRcdFx0XHRcdHZhciBob2xkZXIgPSBbXTtcclxuXHRcdFx0XHRcdG1vZGVsLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcblx0XHRcdFx0XHRcdHZhciBtb2RlbDIgPSB7fTtcclxuXHRcdFx0XHRcdFx0bW9kZWwyW25hbWVdID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdG1vZGVsMltpbmRleE5hbWVdID0gaW5kZXg7XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgbW9kZWxzMiA9IFtdLmNvbmNhdChtb2RlbHMpO1xyXG5cdFx0XHRcdFx0XHRtb2RlbHMyLnVuc2hpZnQobW9kZWwyKTtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBub2RlID0gdGhpcy5jb3B5Tm9kZShjaGlsZCk7XHJcblx0XHRcdFx0XHRcdG5vZGUucmVwZWF0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdG5vZGUuaHRtbCA9IG5vZGUuaHRtbC5yZXBsYWNlKHRoaXMuci5yZXBlYXQsICcnKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5odG1sID0gdGhpcy5yZXBsKG5vZGUuaHRtbCwgbW9kZWxzMik7XHJcblxyXG5cdFx0XHRcdFx0XHRub2RlID0gdGhpcy5yZW5kZXJSZXBlYXQobm9kZSwgbW9kZWxzMik7XHJcblxyXG5cdFx0XHRcdFx0XHQvL3Jvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDAsIG5vZGUpO1xyXG5cdFx0XHRcdFx0XHRob2xkZXIucHVzaChub2RlKTtcclxuXHRcdFx0XHRcdH0uYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0XHRcdFx0aG9sZGVyLmZvckVhY2goZnVuY3Rpb24obikge1xyXG5cdFx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAwLCBuKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNoaWxkLmh0bWwgPSB0aGlzLnJlcGwoY2hpbGQuaHRtbCwgbW9kZWxzKTtcclxuXHRcdFx0XHRcdGNoaWxkID0gdGhpcy5yZW5kZXJSZXBlYXQoY2hpbGQsIG1vZGVscyk7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuW2NdID0gY2hpbGQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcm9vdDtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIGRvbVRvU3RyaW5nKHJvb3QsIGluZGVudCk6IHN0cmluZyB7XHJcblx0XHRcdGluZGVudCA9IGluZGVudCB8fCAwO1xyXG5cdFx0XHR2YXIgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCB0YWI6IGFueSA9ICdcXHQnO1xyXG5cclxuXHRcdFx0aWYocm9vdC5odG1sKSB7XHJcblx0XHRcdFx0aHRtbCArPSBuZXcgQXJyYXkoaW5kZW50KS5qb2luKHRhYik7IC8vdGFiLnJlcGVhdChpbmRlbnQpOztcclxuXHRcdFx0XHRpZihyb290LnR5cGUgIT09ICdURVhUJylcclxuXHRcdFx0XHRcdGh0bWwgKz0gJzwnICsgcm9vdC5odG1sICsgJz4nO1xyXG5cdFx0XHRcdGVsc2UgaHRtbCArPSByb290Lmh0bWw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGh0bWwpXHJcblx0XHRcdFx0aHRtbCArPSAnXFxuJztcclxuXHJcblx0XHRcdGlmKHJvb3QuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0aHRtbCArPSByb290LmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb21Ub1N0cmluZyhjLCBpbmRlbnQrKHJvb3QudHlwZSA/IDEgOiAyKSk7XHJcblx0XHRcdFx0fS5iaW5kKHRoaXMpKS5qb2luKCdcXG4nKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYocm9vdC50eXBlICYmIHJvb3QudHlwZSAhPT0gJ1RFWFQnICYmICFyb290LnNlbGZDbG9zaW5nKSB7XHJcblx0XHRcdFx0aHRtbCArPSBuZXcgQXJyYXkoaW5kZW50KS5qb2luKHRhYik7IC8vdGFiLnJlcGVhdChpbmRlbnQpO1xyXG5cdFx0XHRcdGh0bWwgKz0gJzwvJytyb290LnR5cGUrJz5cXG4nO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gaHRtbDtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXBsKHN0cjogc3RyaW5nLCBtb2RlbHM6IGFueVtdKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgdmFyIHJlZ2V4RyA9IC97KC4rPyl9fT8vZztcclxuXHJcbiAgICAgICAgICAgIHZhciBtID0gc3RyLm1hdGNoKHJlZ2V4Ryk7XHJcbiAgICAgICAgICAgIGlmKCFtKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlKG0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IG1bMF07XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHIoMSwgcGF0aC5sZW5ndGgtMik7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5ldmFsdWF0ZShtb2RlbHMsIHBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBcImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldENvbXBvbmVudCh0aGlzKS5cIitwYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShtWzBdLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbSA9IG0uc2xpY2UoMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgICAgIGlmKHBhdGhbMF0gPT09ICd7JyAmJiBwYXRoWy0tcGF0aC5sZW5ndGhdID09PSAnfScpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUV4cHJlc3Npb24obW9kZWxzLCBwYXRoLnN1YnN0cigxLCBwYXRoLmxlbmd0aC0yKSlcclxuICAgICAgICAgICAgZWxzZSBpZihwYXRoWzBdID09PSAnIycpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUZ1bmN0aW9uKG1vZGVscywgcGF0aC5zdWJzdHIoMSkpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZVZhbHVlKG1vZGVscywgcGF0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlVmFsdWUobW9kZWxzOiBhbnlbXSwgcGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVWYWx1ZUFuZE1vZGVsKG1vZGVscywgcGF0aCkudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuXHRcdHByaXZhdGUgZXZhbHVhdGVWYWx1ZUFuZE1vZGVsKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IHt2YWx1ZTogYW55LCBtb2RlbDogYW55fSB7XHJcblx0XHRcdGlmKG1vZGVscy5pbmRleE9mKHdpbmRvdykgPT0gLTEpXHJcbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaCh3aW5kb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1pID0gMDtcclxuXHRcdFx0dmFyIG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHR3aGlsZShtaSA8IG1vZGVscy5sZW5ndGggJiYgbW9kZWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG1vZGVsID0gbW9kZWxzW21pXTtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0bW9kZWwgPSBuZXcgRnVuY3Rpb24oXCJtb2RlbFwiLCBcInJldHVybiBtb2RlbFsnXCIgKyBwYXRoLnNwbGl0KFwiLlwiKS5qb2luKFwiJ11bJ1wiKSArIFwiJ11cIikobW9kZWwpO1xyXG5cdFx0XHRcdH0gY2F0Y2goZSkge1xyXG5cdFx0XHRcdFx0bW9kZWwgPSB2b2lkIDA7XHJcblx0XHRcdFx0fSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBtaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge1widmFsdWVcIjogbW9kZWwsIFwibW9kZWxcIjogbW9kZWxzWy0tbWldfTtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZUV4cHJlc3Npb24obW9kZWxzOiBhbnlbXSwgcGF0aDogc3RyaW5nKTogYW55IHtcclxuXHRcdFx0aWYobW9kZWxzLmluZGV4T2Yod2luZG93KSA9PSAtMSlcclxuICAgICAgICAgICAgICAgIG1vZGVscy5wdXNoKHdpbmRvdyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgbWkgPSAwO1xyXG5cdFx0XHR2YXIgbW9kZWwgPSB2b2lkIDA7XHJcblx0XHRcdHdoaWxlKG1pIDwgbW9kZWxzLmxlbmd0aCAmJiBtb2RlbCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0bW9kZWwgPSBtb2RlbHNbbWldO1xyXG5cdFx0XHRcdHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy93aXRoKG1vZGVsKSBtb2RlbCA9IGV2YWwocGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgPSBuZXcgRnVuY3Rpb24oT2JqZWN0LmtleXMobW9kZWwpLnRvU3RyaW5nKCksIFwicmV0dXJuIFwiICsgcGF0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGx5KG51bGwsIE9iamVjdC5rZXlzKG1vZGVsKS5tYXAoKGspID0+IHtyZXR1cm4gbW9kZWxba119KSApO1xyXG5cdFx0XHRcdH0gY2F0Y2goZSkge1xyXG5cdFx0XHRcdFx0bW9kZWwgPSB2b2lkIDA7XHJcblx0XHRcdFx0fSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBtaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gbW9kZWw7XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZXZhbHVhdGVGdW5jdGlvbihtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgICAgICBsZXQgZXhwID0gdGhpcy5ldmFsdWF0ZUV4cHJlc3Npb24uYmluZCh0aGlzLCBtb2RlbHMpO1xyXG5cdFx0XHR2YXIgW25hbWUsIGFyZ3NdID0gcGF0aC5zcGxpdCgnKCcpO1xyXG4gICAgICAgICAgICBhcmdzID0gYXJncy5zdWJzdHIoMCwgLS1hcmdzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBsZXQge3ZhbHVlLCBtb2RlbH0gPSB0aGlzLmV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHMsIG5hbWUpO1xyXG4gICAgICAgICAgICBsZXQgZnVuYzogRnVuY3Rpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgbGV0IGFyZ0Fycjogc3RyaW5nW10gPSBhcmdzLnNwbGl0KCcuJykubWFwKChhcmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcmcuaW5kZXhPZignIycpID09PSAwID9cclxuICAgICAgICAgICAgICAgICAgICBhcmcuc3Vic3RyKDEpIDpcclxuICAgICAgICAgICAgICAgICAgICBleHAoYXJnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jID0gZnVuYy5iaW5kKG1vZGVsLCAuLi5hcmdBcnIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gaG8uY29tcG9uZW50cy50ZW1wLnNldChmdW5jKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdHIgPSBgaG8uY29tcG9uZW50cy50ZW1wLmNhbGwoJHtpbmRleH0pYDtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIGNvcHlOb2RlKG5vZGU6IE5vZGUpOiBOb2RlIHtcclxuXHRcdFx0dmFyIGNvcHlOb2RlID0gdGhpcy5jb3B5Tm9kZS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG4gPSA8Tm9kZT57XHJcblx0XHRcdFx0cGFyZW50OiBub2RlLnBhcmVudCxcclxuXHRcdFx0XHRodG1sOiBub2RlLmh0bWwsXHJcblx0XHRcdFx0dHlwZTogbm9kZS50eXBlLFxyXG5cdFx0XHRcdHNlbGZDbG9zaW5nOiBub2RlLnNlbGZDbG9zaW5nLFxyXG5cdFx0XHRcdHJlcGVhdDogbm9kZS5yZXBlYXQsXHJcblx0XHRcdFx0Y2hpbGRyZW46IG5vZGUuY2hpbGRyZW4ubWFwKGNvcHlOb2RlKVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0cmV0dXJuIG47XHJcblx0XHR9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVuZGVyZXIoKTtcclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbWFpblwiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVnaXN0cnlcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2h0bWxwcm92aWRlci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVuZGVyZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2F0dHJpYnV0ZS50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L2QudHMvcHJvbWlzZS5kLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xyXG5cclxuICAgIGltcG9ydCBSZWdpc3RyeSA9IGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2U7XHJcbiAgICBpbXBvcnQgSHRtbFByb3ZpZGVyID0gaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIuaW5zdGFuY2U7XHJcbiAgICBpbXBvcnQgUmVuZGVyZXIgPSBoby5jb21wb25lbnRzLnJlbmRlcmVyLmluc3RhbmNlO1xyXG4gICAgaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGNvbXBvbmVudD86IENvbXBvbmVudDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElQcm9wcmV0eSB7XHJcbiAgICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcclxuICAgICAgICBkZWZhdWx0PzogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAgIEJhc2VjbGFzcyBmb3IgQ29tcG9uZW50c1xyXG4gICAgICAgIGltcG9ydGFudDogZG8gaW5pdGlhbGl6YXRpb24gd29yayBpbiBDb21wb25lbnQjaW5pdFxyXG4gICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xyXG4gICAgICAgIGVsZW1lbnQ6IENvbXBvbmVudEVsZW1lbnQ7XHJcbiAgICAgICAgb3JpZ2luYWxfaW5uZXJIVE1MOiBzdHJpbmc7XHJcbiAgICAgICAgaHRtbDogc3RyaW5nO1xyXG4gICAgICAgIHByb3BlcnRpZXM6IEFycmF5PHN0cmluZ3xJUHJvcHJldHk+ID0gW107XHJcbiAgICAgICAgYXR0cmlidXRlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIHJlcXVpcmVzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICAgICAgY2hpbGRyZW46IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLSBpbml0IEVsZW1lbmV0IGFuZCBFbGVtZW50cycgb3JpZ2luYWwgaW5uZXJIVE1MXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jb21wb25lbnQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsX2lubmVySFRNTCA9IGVsZW1lbnQuaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldCBuYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQuZ2V0TmFtZSh0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXROYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UGFyZW50KCk6IENvbXBvbmVudCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQuZ2V0Q29tcG9uZW50KDxDb21wb25lbnRFbGVtZW50PnRoaXMuZWxlbWVudC5wYXJlbnROb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBfaW5pdCgpOiBQcm9taXNlPGFueSwgYW55PiB7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0tIGluaXQgUHJvcGVydGllc1xyXG4gICAgICAgICAgICB0aGlzLmluaXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICAvLy0tLS0tLS0gY2FsbCBpbml0KCkgJiBsb2FkUmVxdWlyZW1lbnRzKCkgLT4gdGhlbiByZW5kZXJcclxuICAgICAgICAgICAgbGV0IHJlYWR5ID0gW3RoaXMuaW5pdEhUTUwoKSwgUHJvbWlzZS5jcmVhdGUodGhpcy5pbml0KCkpLCB0aGlzLmxvYWRSZXF1aXJlbWVudHMoKV07XHJcblxyXG4gICAgICAgICAgICBsZXQgcCA9IG5ldyBQcm9taXNlPGFueSwgYW55PigpO1xyXG5cclxuICAgICAgICAgICAgUHJvbWlzZS5hbGwocmVhZHkpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHAucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICAgIE1ldGhvZCB0aGF0IGdldCBjYWxsZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24gb2YgYSBuZXcgaW5zdGFuY2UuXHJcbiAgICAgICAgICAgIERvIGluaXQtd29yayBoZXJlLlxyXG4gICAgICAgICAgICBNYXkgcmV0dXJuIGEgUHJvbWlzZS5cclxuICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbml0KCk6IGFueSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge3JldHVybiB2b2lkIDA7fVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgXHRcdFJlbmRlcmVyLnJlbmRlcih0aGlzKTtcclxuXHJcbiAgICBcdFx0UmVnaXN0cnkuaW5pdEVsZW1lbnQodGhpcy5lbGVtZW50KTtcclxuXHJcbiAgICBcdFx0dGhpcy5pbml0Q2hpbGRyZW4oKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEF0dHJpYnV0ZXMoKTtcclxuXHJcblx0XHRcdHRoaXMudXBkYXRlKCk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogIEFzc3VyZSB0aGF0IHRoaXMgaW5zdGFuY2UgaGFzIGFuIHZhbGlkIGh0bWwgYXR0cmlidXRlIGFuZCBpZiBub3QgbG9hZCBhbmQgc2V0IGl0LlxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0SFRNTCgpOiBQcm9taXNlPGFueSxhbnk+IHtcclxuICAgICAgICAgICAgbGV0IHAgPSBuZXcgUHJvbWlzZSgpO1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5odG1sID09PSAnYm9vbGVhbicpXHJcbiAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIC8vbGV0IG5hbWUgPSBDb21wb25lbnQuZ2V0TmFtZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgIEh0bWxQcm92aWRlci5nZXRIVE1MKHRoaXMubmFtZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5odG1sID0gaHRtbDtcclxuICAgICAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2gocC5yZWplY3QpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdFByb3BlcnRpZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcGVydGllc1twcm9wLm5hbWVdID0gdGhpcy5lbGVtZW50W3Byb3AubmFtZV0gfHwgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShwcm9wLm5hbWUpIHx8IHByb3AuZGVmYXVsdDtcclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnByb3BlcnRpZXNbcHJvcC5uYW1lXSA9PT0gdW5kZWZpbmVkICYmIHByb3AucmVxdWlyZWQgPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGBQcm9wZXJ0eSAke3Byb3AubmFtZX0gaXMgcmVxdWlyZWQgYnV0IG5vdCBwcm92aWRlZGA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BlcnRpZXNbcHJvcF0gPSB0aGlzLmVsZW1lbnRbcHJvcF0gfHwgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShwcm9wKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdENoaWxkcmVuKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGRzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcclxuICAgIFx0XHRmb3IobGV0IGMgPSAwOyBjIDwgY2hpbGRzLmxlbmd0aDsgYysrKSB7XHJcbiAgICBcdFx0XHRsZXQgY2hpbGQgPSBjaGlsZHNbY107XHJcbiAgICBcdFx0XHRpZihjaGlsZC5pZCkge1xyXG4gICAgXHRcdFx0XHR0aGlzLmNoaWxkcmVuW2NoaWxkLmlkXSA9IGNoaWxkO1xyXG4gICAgXHRcdFx0fVxyXG4gICAgXHRcdFx0aWYoY2hpbGQudGFnTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuW2NoaWxkLnRhZ05hbWVdID0gdGhpcy5jaGlsZHJlbltjaGlsZC50YWdOYW1lXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgICg8RWxlbWVudFtdPnRoaXMuY2hpbGRyZW5bY2hpbGQudGFnTmFtZV0pLnB1c2goY2hpbGQpO1xyXG4gICAgXHRcdH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdEF0dHJpYnV0ZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAuZm9yRWFjaCgoYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGF0dHIgPSBSZWdpc3RyeS5nZXRBdHRyaWJ1dGUoYSk7XHJcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGAqWyR7YX1dYCksIChlOiBIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWwgPSBlLmhhc093blByb3BlcnR5KGEpID8gZVthXSA6IGUuZ2V0QXR0cmlidXRlKGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmIHZhbCA9PT0gJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgYXR0cihlLCB2YWwpLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBsb2FkUmVxdWlyZW1lbnRzKCkge1xyXG4gICAgXHRcdGxldCBjb21wb25lbnRzOiBhbnlbXSA9IHRoaXMucmVxdWlyZXNcclxuICAgICAgICAgICAgLmZpbHRlcigocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIVJlZ2lzdHJ5Lmhhc0NvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAubWFwKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWdpc3RyeS5sb2FkQ29tcG9uZW50KHJlcSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVzOiBhbnlbXSA9IHRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhUmVnaXN0cnkuaGFzQXR0cmlidXRlKHJlcSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5tYXAoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZ2lzdHJ5LmxvYWRBdHRyaWJ1dGUocmVxKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgbGV0IHByb21pc2VzID0gY29tcG9uZW50cy5jb25jYXQoYXR0cmlidXRlcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgXHR9O1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIHN0YXRpYyByZWdpc3RlcihjOiB0eXBlb2YgQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlZ2lzdHJ5LnJlZ2lzdGVyKGMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAqL1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIHN0YXRpYyBydW4ob3B0PzogYW55KSB7XHJcbiAgICAgICAgICAgIFJlZ2lzdHJ5LnNldE9wdGlvbnMob3B0KTtcclxuICAgICAgICAgICAgUmVnaXN0cnkucnVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICovXHJcblxyXG4gICAgICAgIHN0YXRpYyBnZXRDb21wb25lbnQoZWxlbWVudDogQ29tcG9uZW50RWxlbWVudCk6IENvbXBvbmVudCB7XHJcbiAgICAgICAgICAgIHdoaWxlKCFlbGVtZW50LmNvbXBvbmVudClcclxuICAgIFx0XHRcdGVsZW1lbnQgPSA8Q29tcG9uZW50RWxlbWVudD5lbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICBcdFx0cmV0dXJuIGVsZW1lbnQuY29tcG9uZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGdldE5hbWUoY2xheno6ICh0eXBlb2YgQ29tcG9uZW50KSB8IChDb21wb25lbnQpKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgaWYoY2xhenogaW5zdGFuY2VvZiBDb21wb25lbnQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xhenouY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9