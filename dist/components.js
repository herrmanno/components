var ho;
(function (ho) {
    var components;
    (function (components) {
        var componentprovider;
        (function (componentprovider) {
            var Promise = ho.promise.Promise;
            componentprovider.mapping = {};
            var ComponentProvider = (function () {
                function ComponentProvider() {
                    this.useMin = false;
                }
                ComponentProvider.prototype.resolve = function (name) {
                    name = name.split('.').join('/');
                    return this.useMin ?
                        "components/" + name + ".min.js" :
                        "components/" + name + ".js";
                };
                ComponentProvider.prototype.getComponent = function (name) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var src = componentprovider.mapping[name] || _this.resolve(name);
                        var script = document.createElement('script');
                        script.onload = function () {
                            //Component.register(window[name]);
                            if (typeof this.get(name) === 'function')
                                resolve(this.get(name));
                            else
                                reject("Error while loading Component " + name);
                        }.bind(_this);
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    });
                };
                ComponentProvider.prototype.get = function (name) {
                    var c = window;
                    name.split('.').forEach(function (part) {
                        c = c[part];
                    });
                    return c;
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
                    return this.getParentOfComponent(name)
                        .then(function (parent) {
                        if (self.hasComponent(parent) || parent === 'ho.components.Component')
                            return true;
                        else
                            return self.loadComponent(parent);
                    })
                        .then(function (parentType) {
                        return ho.components.componentprovider.instance.getComponent(name);
                    })
                        .then(function (component) {
                        self.register(component);
                        return component;
                    });
                    //return this.options.componentProvider.getComponent(name)
                };
                Registry.prototype.getParentOfComponent = function (name) {
                    return new Promise(function (resolve, reject) {
                        var xmlhttp = new XMLHttpRequest();
                        xmlhttp.onreadystatechange = function () {
                            if (xmlhttp.readyState == 4) {
                                var resp = xmlhttp.responseText;
                                if (xmlhttp.status == 200) {
                                    var m = resp.match(/}\)\((.*)\);/);
                                    if (m !== null) {
                                        resolve(m[1]);
                                    }
                                    else {
                                        resolve(null);
                                    }
                                }
                                else {
                                    reject(resp);
                                }
                            }
                        };
                        xmlhttp.open('GET', ho.components.componentprovider.instance.resolve(name));
                        xmlhttp.send();
                    });
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
                        text: /(?:.|[\r\n])*?[^"'\\]</m,
                    };
                    this.voids = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
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
                        var tag, type, closing, isVoid, selfClosing, repeat, unClose;
                        //------- found some text before next tag
                        if (m.index !== 0) {
                            tag = html.match(this.r.text)[0];
                            tag = tag.substr(0, tag.length - 1);
                            type = 'TEXT';
                            isVoid = false;
                            selfClosing = true;
                            repeat = false;
                        }
                        else {
                            tag = m[1].trim();
                            type = (tag + '>').match(this.r.type)[1];
                            closing = tag[0] === '/';
                            isVoid = this.isVoid(type);
                            selfClosing = isVoid || tag[tag.length - 1] === '/';
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
                            root.children.push({ parent: root, html: tag, type: type, isVoid: isVoid, selfClosing: selfClosing, repeat: repeat, children: [] });
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
                        if (root.type !== 'TEXT') {
                            if (root.selfClosing && !root.isVoid)
                                html += '<' + root.html + '/>';
                            else
                                html += '<' + root.html + '>';
                        }
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
                Renderer.prototype.isVoid = function (name) {
                    return this.voids.indexOf(name.toLowerCase()) !== -1;
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
/// <reference path="../../bower_components/ho-promise/dist/promise.d.ts"/>
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHNwcm92aWRlci50cyIsImF0dHJpYnV0ZS50cyIsImF0dHJpYnV0ZXByb3ZpZGVyLnRzIiwicmVnaXN0cnkudHMiLCJtYWluLnRzIiwiaHRtbHByb3ZpZGVyLnRzIiwidGVtcC50cyIsInJlbmRlcmVyLnRzIiwiY29tcG9uZW50cy50cyJdLCJuYW1lcyI6WyJobyIsImhvLmNvbXBvbmVudHMiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5Db21wb25lbnRQcm92aWRlciIsImhvLmNvbXBvbmVudHMuY29tcG9uZW50cHJvdmlkZXIuQ29tcG9uZW50UHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLkNvbXBvbmVudFByb3ZpZGVyLnJlc29sdmUiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLkNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuY29tcG9uZW50cHJvdmlkZXIuQ29tcG9uZW50UHJvdmlkZXIuZ2V0IiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlLmluaXQiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS5uYW1lIiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUudXBkYXRlIiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUuZ2V0TmFtZSIsImhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5XYXRjaEF0dHJpYnV0ZS53YXRjaCIsImhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUuZXZhbCIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIiLCJoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLkF0dHJpYnV0ZVByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5hdHRyaWJ1dGVwcm92aWRlci5BdHRyaWJ1dGVQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIuQXR0cmlidXRlUHJvdmlkZXIucmVzb2x2ZSIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIuQXR0cmlidXRlUHJvdmlkZXIuZ2V0QXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeSIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5yZWdpc3RlciIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkucnVuIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5pbml0Q29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5pbml0RWxlbWVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaGFzQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5oYXNBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmdldEF0dHJpYnV0ZSIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkubG9hZENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuZ2V0UGFyZW50T2ZDb21wb25lbnQiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJ1biIsImhvLmNvbXBvbmVudHMucmVnaXN0ZXIiLCJoby5jb21wb25lbnRzLmh0bWxwcm92aWRlciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5yZXNvbHZlIiwiaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIuSHRtbFByb3ZpZGVyLmdldEhUTUwiLCJoby5jb21wb25lbnRzLnRlbXAiLCJoby5jb21wb25lbnRzLnRlbXAuc2V0IiwiaG8uY29tcG9uZW50cy50ZW1wLmdldCIsImhvLmNvbXBvbmVudHMudGVtcC5jYWxsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuTm9kZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuTm9kZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZW5kZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLnBhcnNlIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZW5kZXJSZXBlYXQiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmRvbVRvU3RyaW5nIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZXBsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZUFuZE1vZGVsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZUV4cHJlc3Npb24iLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmV2YWx1YXRlRnVuY3Rpb24iLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmNvcHlOb2RlIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5pc1ZvaWQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQubmFtZSIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldE5hbWUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXRQYXJlbnQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5faW5pdCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC51cGRhdGUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5yZW5kZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0SFRNTCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRQcm9wZXJ0aWVzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdENoaWxkcmVuIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdEF0dHJpYnV0ZXMiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5sb2FkUmVxdWlyZW1lbnRzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0Q29tcG9uZW50Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEVBQUUsQ0E2Q1I7QUE3Q0QsV0FBTyxFQUFFO0lBQUNBLElBQUFBLFVBQVVBLENBNkNuQkE7SUE3Q1NBLFdBQUFBLFVBQVVBO1FBQUNDLElBQUFBLGlCQUFpQkEsQ0E2Q3JDQTtRQTdDb0JBLFdBQUFBLGlCQUFpQkEsRUFBQ0EsQ0FBQ0E7WUFDcENDLElBQU9BLE9BQU9BLEdBQUdBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBO1lBRXpCQSx5QkFBT0EsR0FBMkJBLEVBQUVBLENBQUNBO1lBRWhEQTtnQkFBQUM7b0JBRUlDLFdBQU1BLEdBQVlBLEtBQUtBLENBQUNBO2dCQWtDNUJBLENBQUNBO2dCQWhDR0QsbUNBQU9BLEdBQVBBLFVBQVFBLElBQVlBO29CQUNoQkUsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQTt3QkFDZEEsZ0JBQWNBLElBQUlBLFlBQVNBO3dCQUMzQkEsZ0JBQWNBLElBQUlBLFFBQUtBLENBQUNBO2dCQUNoQ0EsQ0FBQ0E7Z0JBRURGLHdDQUFZQSxHQUFaQSxVQUFhQSxJQUFZQTtvQkFBekJHLGlCQWVDQTtvQkFkR0EsTUFBTUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBd0JBLFVBQUNBLE9BQU9BLEVBQUVBLE1BQU1BO3dCQUN0REEsSUFBSUEsR0FBR0EsR0FBR0EseUJBQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUM5Q0EsSUFBSUEsTUFBTUEsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7d0JBQzlDQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQTs0QkFDWixBQUNBLG1DQURtQzs0QkFDbkMsRUFBRSxDQUFBLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsQ0FBQztnQ0FDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDNUIsSUFBSTtnQ0FDQSxNQUFNLENBQUMsbUNBQWlDLElBQU0sQ0FBQyxDQUFBO3dCQUN2RCxDQUFDLENBQUNBLElBQUlBLENBQUNBLEtBQUlBLENBQUNBLENBQUNBO3dCQUNiQSxNQUFNQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTt3QkFDakJBLFFBQVFBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2pFQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFFUEEsQ0FBQ0E7Z0JBRU9ILCtCQUFHQSxHQUFYQSxVQUFZQSxJQUFZQTtvQkFDcEJJLElBQUlBLENBQUNBLEdBQVFBLE1BQU1BLENBQUNBO29CQUNwQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsSUFBSUE7d0JBQ3pCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDaEJBLENBQUNBLENBQUNBLENBQUNBO29CQUNIQSxNQUFNQSxDQUFtQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQy9CQSxDQUFDQTtnQkFFTEosd0JBQUNBO1lBQURBLENBcENBRCxBQW9DQ0MsSUFBQUQ7WUFwQ1lBLG1DQUFpQkEsb0JBb0M3QkEsQ0FBQUE7WUFFVUEsMEJBQVFBLEdBQUdBLElBQUlBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFFbERBLENBQUNBLEVBN0NvQkQsaUJBQWlCQSxHQUFqQkEsNEJBQWlCQSxLQUFqQkEsNEJBQWlCQSxRQTZDckNBO0lBQURBLENBQUNBLEVBN0NTRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQTZDbkJBO0FBQURBLENBQUNBLEVBN0NNLEVBQUUsS0FBRixFQUFFLFFBNkNSO0FDN0NELDRFQUE0RTtBQUM1RSxnRkFBZ0Y7Ozs7Ozs7QUFFaEYsSUFBTyxFQUFFLENBOEVSO0FBOUVELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQThFbkJBO0lBOUVTQSxXQUFBQSxVQUFVQSxFQUFDQSxDQUFDQTtRQUlyQkMsQUFJQUE7OztVQURFQTs7WUFPRE8sbUJBQVlBLE9BQW9CQSxFQUFFQSxLQUFjQTtnQkFDL0NDLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0Esb0JBQVNBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO2dCQUNqREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBRW5CQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtZQUNiQSxDQUFDQTtZQUVTRCx3QkFBSUEsR0FBZEEsY0FBd0JFLENBQUNBO1lBRXpCRixzQkFBSUEsMkJBQUlBO3FCQUFSQTtvQkFDQ0csTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hDQSxDQUFDQTs7O2VBQUFIO1lBR01BLDBCQUFNQSxHQUFiQTtZQUVBSSxDQUFDQTtZQUdNSixpQkFBT0EsR0FBZEEsVUFBZUEsS0FBbUNBO2dCQUN4Q0ssRUFBRUEsQ0FBQUEsQ0FBQ0EsS0FBS0EsWUFBWUEsU0FBU0EsQ0FBQ0E7b0JBQzFCQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekRBLElBQUlBO29CQUNBQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqREEsQ0FBQ0E7WUFDUkwsZ0JBQUNBO1FBQURBLENBaENBUCxBQWdDQ08sSUFBQVA7UUFoQ1lBLG9CQUFTQSxZQWdDckJBLENBQUFBO1FBRURBO1lBQW9DYSxrQ0FBU0E7WUFJNUNBLHdCQUFZQSxPQUFvQkEsRUFBRUEsS0FBY0E7Z0JBQy9DQyxrQkFBTUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBSGJBLE1BQUNBLEdBQVdBLFVBQVVBLENBQUNBO2dCQUtoQ0EsSUFBSUEsQ0FBQ0EsR0FBVUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7Z0JBQzlDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFTQSxDQUFDQTtvQkFDZixDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZixDQUFDLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNkQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUMzQ0EsQ0FBQ0E7WUFHU0QsOEJBQUtBLEdBQWZBLFVBQWdCQSxJQUFZQTtnQkFDM0JFLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO2dCQUM5QkEsSUFBSUEsSUFBSUEsR0FBR0EsT0FBT0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7Z0JBQ3pCQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtnQkFFekJBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLFVBQUNBLElBQUlBO29CQUNoQkEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFFSEEsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBRVNGLDZCQUFJQSxHQUFkQSxVQUFlQSxJQUFZQTtnQkFDMUJHLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO2dCQUMzQkEsS0FBS0EsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7cUJBQ25FQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFDQSxDQUFDQSxJQUFNQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFBQSxDQUFBQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtnQkFDakVBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1lBQ2RBLENBQUNBO1lBRUZILHFCQUFDQTtRQUFEQSxDQW5DQWIsQUFtQ0NhLEVBbkNtQ2IsU0FBU0EsRUFtQzVDQTtRQW5DWUEseUJBQWNBLGlCQW1DMUJBLENBQUFBO0lBQ0ZBLENBQUNBLEVBOUVTRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQThFbkJBO0FBQURBLENBQUNBLEVBOUVNLEVBQUUsS0FBRixFQUFFLFFBOEVSO0FDakZELHNDQUFzQztBQUV0QyxJQUFPLEVBQUUsQ0FrQ1I7QUFsQ0QsV0FBTyxFQUFFO0lBQUNBLElBQUFBLFVBQVVBLENBa0NuQkE7SUFsQ1NBLFdBQUFBLFVBQVVBO1FBQUNDLElBQUFBLGlCQUFpQkEsQ0FrQ3JDQTtRQWxDb0JBLFdBQUFBLGlCQUFpQkEsRUFBQ0EsQ0FBQ0E7WUFDcENpQixJQUFPQSxPQUFPQSxHQUFHQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUVwQ0E7Z0JBQUFDO29CQUVJQyxXQUFNQSxHQUFZQSxLQUFLQSxDQUFDQTtnQkF5QjVCQSxDQUFDQTtnQkF2QkdELG1DQUFPQSxHQUFQQSxVQUFRQSxJQUFZQTtvQkFDaEJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BO3dCQUNkQSxnQkFBY0EsSUFBSUEsWUFBU0E7d0JBQzNCQSxnQkFBY0EsSUFBSUEsUUFBS0EsQ0FBQ0E7Z0JBQ2hDQSxDQUFDQTtnQkFFREYsd0NBQVlBLEdBQVpBLFVBQWFBLElBQVlBO29CQUF6QkcsaUJBZUNBO29CQWRHQSxNQUFNQSxDQUFDQSxJQUFJQSxPQUFPQSxDQUF3QkEsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7d0JBQ3REQSxJQUFJQSxHQUFHQSxHQUFHQSxLQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDN0JBLElBQUlBLE1BQU1BLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO3dCQUM5Q0EsTUFBTUEsQ0FBQ0EsTUFBTUEsR0FBR0E7NEJBQ1osQUFDQSxtQ0FEbUM7NEJBQ25DLEVBQUUsQ0FBQSxDQUFDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsQ0FBQztnQ0FDbEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUMxQixJQUFJO2dDQUNBLE1BQU0sQ0FBQyxtQ0FBaUMsSUFBTSxDQUFDLENBQUE7d0JBQ3ZELENBQUMsQ0FBQ0E7d0JBQ0ZBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO3dCQUNqQkEsUUFBUUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtvQkFDakVBLENBQUNBLENBQUNBLENBQUNBO2dCQUVQQSxDQUFDQTtnQkFFTEgsd0JBQUNBO1lBQURBLENBM0JBRCxBQTJCQ0MsSUFBQUQ7WUEzQllBLG1DQUFpQkEsb0JBMkI3QkEsQ0FBQUE7WUFFVUEsMEJBQVFBLEdBQUdBLElBQUlBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFFbERBLENBQUNBLEVBbENvQmpCLGlCQUFpQkEsR0FBakJBLDRCQUFpQkEsS0FBakJBLDRCQUFpQkEsUUFrQ3JDQTtJQUFEQSxDQUFDQSxFQWxDU0QsVUFBVUEsR0FBVkEsYUFBVUEsS0FBVkEsYUFBVUEsUUFrQ25CQTtBQUFEQSxDQUFDQSxFQWxDTSxFQUFFLEtBQUYsRUFBRSxRQWtDUjtBQ3BDRCwrQ0FBK0M7QUFDL0MsOENBQThDO0FBRTlDLElBQU8sRUFBRSxDQStIUjtBQS9IRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0ErSG5CQTtJQS9IU0EsV0FBQUEsVUFBVUE7UUFBQ0MsSUFBQUEsUUFBUUEsQ0ErSDVCQTtRQS9Ib0JBLFdBQUFBLFFBQVFBLEVBQUNBLENBQUNBO1lBQzNCc0IsSUFBT0EsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7WUFFcENBO2dCQUFBQztvQkFFWUMsZUFBVUEsR0FBNEJBLEVBQUVBLENBQUNBO29CQUN6Q0EsZUFBVUEsR0FBNEJBLEVBQUVBLENBQUNBO2dCQXNIckRBLENBQUNBO2dCQW5IVUQsMkJBQVFBLEdBQWZBLFVBQWdCQSxFQUF1Q0E7b0JBQ25ERSxFQUFFQSxDQUFBQSxDQUFDQSxFQUFFQSxDQUFDQSxTQUFTQSxZQUFZQSxvQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ25DQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFtQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQzNDQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxvQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBbUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO29CQUNwRUEsQ0FBQ0E7b0JBQ0RBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLEVBQUVBLENBQUNBLFNBQVNBLFlBQVlBLG9CQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDeENBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQW1CQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDL0NBLENBQUNBO2dCQUNMQSxDQUFDQTtnQkFFTUYsc0JBQUdBLEdBQVZBO29CQUNJRyxJQUFJQSxhQUFhQSxHQUE2Q0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQzVGQSxJQUFJQSxRQUFRQSxHQUE2QkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQ0EsQ0FBQ0E7d0JBQzNEQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDNUJBLENBQUNBLENBQUNBLENBQUNBO29CQUVIQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtnQkFDakNBLENBQUNBO2dCQUVNSCxnQ0FBYUEsR0FBcEJBLFVBQXFCQSxTQUEyQkEsRUFBRUEsT0FBcUNBO29CQUFyQ0ksdUJBQXFDQSxHQUFyQ0Esa0JBQXFDQTtvQkFDbkZBLElBQUlBLFFBQVFBLEdBQTZCQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUM3REEsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxvQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFDdERBLFVBQVNBLENBQUNBO3dCQUNULE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDakMsQ0FBQyxDQUNiQSxDQUFDQTtvQkFFT0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pDQSxDQUFDQTtnQkFFTUosOEJBQVdBLEdBQWxCQSxVQUFtQkEsT0FBb0JBO29CQUF2Q0ssaUJBSUNBO29CQUhHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxTQUFTQTt3QkFDOUJBLEtBQUlBLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO29CQUMzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1BBLENBQUNBO2dCQUVNTCwrQkFBWUEsR0FBbkJBLFVBQW9CQSxJQUFZQTtvQkFDNUJNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBO3lCQUNqQkEsTUFBTUEsQ0FBQ0EsVUFBQ0EsU0FBU0E7d0JBQ2RBLE1BQU1BLENBQUNBLG9CQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQTtvQkFDakRBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO2dCQUN0QkEsQ0FBQ0E7Z0JBRU1OLCtCQUFZQSxHQUFuQkEsVUFBb0JBLElBQVlBO29CQUM1Qk8sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUE7eUJBQ2pCQSxNQUFNQSxDQUFDQSxVQUFDQSxTQUFTQTt3QkFDZEEsTUFBTUEsQ0FBQ0Esb0JBQVNBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBO29CQUNqREEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxDQUFDQTtnQkFFTVAsK0JBQVlBLEdBQW5CQSxVQUFvQkEsSUFBWUE7b0JBQzVCUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQTt5QkFDckJBLE1BQU1BLENBQUNBLFVBQUNBLFNBQVNBO3dCQUNkQSxNQUFNQSxDQUFDQSxvQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0E7b0JBQ2pEQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDVkEsQ0FBQ0E7Z0JBRU1SLGdDQUFhQSxHQUFwQkEsVUFBcUJBLElBQVlBO29CQUM3QlMsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBRWhCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBO3lCQUNyQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsTUFBTUE7d0JBQ1RBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLE1BQU1BLEtBQUtBLHlCQUF5QkEsQ0FBQ0E7NEJBQ2pFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFDaEJBLElBQUlBOzRCQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtvQkFDM0NBLENBQUNBLENBQUNBO3lCQUNEQSxJQUFJQSxDQUFDQSxVQUFDQSxVQUFVQTt3QkFDYkEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFBQTtvQkFDdEVBLENBQUNBLENBQUNBO3lCQUNEQSxJQUFJQSxDQUFDQSxVQUFDQSxTQUFTQTt3QkFDWkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3pCQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQTtvQkFDckJBLENBQUNBLENBQUNBLENBQUNBO29CQUNIQSwwREFBMERBO2dCQUM5REEsQ0FBQ0E7Z0JBRVNULHVDQUFvQkEsR0FBOUJBLFVBQStCQSxJQUFZQTtvQkFDdkNVLE1BQU1BLENBQUNBLElBQUlBLE9BQU9BLENBQUNBLFVBQUNBLE9BQU9BLEVBQUVBLE1BQU1BO3dCQUUvQkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsY0FBY0EsRUFBRUEsQ0FBQ0E7d0JBQ25DQSxPQUFPQSxDQUFDQSxrQkFBa0JBLEdBQUdBOzRCQUN6QkEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBVUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQ3pCQSxJQUFJQSxJQUFJQSxHQUFHQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQTtnQ0FDaENBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO29DQUN2QkEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7b0NBQ25DQSxFQUFFQSxDQUFBQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTt3Q0FDWkEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQ2xCQSxDQUFDQTtvQ0FDREEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0NBQ0ZBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO29DQUNsQkEsQ0FBQ0E7Z0NBQ0xBLENBQUNBO2dDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQ0FDSkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0NBQ2pCQSxDQUFDQTs0QkFFTEEsQ0FBQ0E7d0JBQ0xBLENBQUNBLENBQUNBO3dCQUVGQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxpQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO3dCQUM1RUEsT0FBT0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7b0JBRW5CQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDUEEsQ0FBQ0E7Z0JBRU1WLGdDQUFhQSxHQUFwQkEsVUFBcUJBLElBQVlBO29CQUM3QlcsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBQ2hCQSxNQUFNQSxDQUFDQSxJQUFJQSxPQUFPQSxDQUEyQkEsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7d0JBQ3pEQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxpQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBOzZCQUMxREEsSUFBSUEsQ0FBQ0EsVUFBQ0EsU0FBU0E7NEJBQ1pBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBOzRCQUN6QkEsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3ZCQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDUEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1BBLENBQUNBO2dCQUVMWCxlQUFDQTtZQUFEQSxDQXpIQUQsQUF5SENDLElBQUFEO1lBekhZQSxpQkFBUUEsV0F5SHBCQSxDQUFBQTtZQUVVQSxpQkFBUUEsR0FBR0EsSUFBSUEsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDekNBLENBQUNBLEVBL0hvQnRCLFFBQVFBLEdBQVJBLG1CQUFRQSxLQUFSQSxtQkFBUUEsUUErSDVCQTtJQUFEQSxDQUFDQSxFQS9IU0QsVUFBVUEsR0FBVkEsYUFBVUEsS0FBVkEsYUFBVUEsUUErSG5CQTtBQUFEQSxDQUFDQSxFQS9ITSxFQUFFLEtBQUYsRUFBRSxRQStIUjtBQ2xJRCxxQ0FBcUM7QUFFckMsSUFBTyxFQUFFLENBUVI7QUFSRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0FRbkJBO0lBUlNBLFdBQUFBLFVBQVVBLEVBQUNBLENBQUNBO1FBQ3JCQztZQUNDbUMsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDOUNBLENBQUNBO1FBRmVuQyxjQUFHQSxNQUVsQkEsQ0FBQUE7UUFFREEsa0JBQXlCQSxDQUFzQ0E7WUFDOURvQyxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFGZXBDLG1CQUFRQSxXQUV2QkEsQ0FBQUE7SUFDRkEsQ0FBQ0EsRUFSU0QsVUFBVUEsR0FBVkEsYUFBVUEsS0FBVkEsYUFBVUEsUUFRbkJBO0FBQURBLENBQUNBLEVBUk0sRUFBRSxLQUFGLEVBQUUsUUFRUjtBQ1ZELElBQU8sRUFBRSxDQXdDUjtBQXhDRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0F3Q25CQTtJQXhDU0EsV0FBQUEsVUFBVUE7UUFBQ0MsSUFBQUEsWUFBWUEsQ0F3Q2hDQTtRQXhDb0JBLFdBQUFBLFlBQVlBLEVBQUNBLENBQUNBO1lBQy9CcUMsSUFBT0EsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7WUFFcENBO2dCQUFBQztvQkFFWUMsVUFBS0EsR0FBMEJBLEVBQUVBLENBQUNBO2dCQStCOUNBLENBQUNBO2dCQTdCR0QsOEJBQU9BLEdBQVBBLFVBQVFBLElBQVlBO29CQUNoQkUsTUFBTUEsQ0FBQ0EsZ0JBQWNBLElBQUlBLFVBQU9BLENBQUNBO2dCQUNyQ0EsQ0FBQ0E7Z0JBRURGLDhCQUFPQSxHQUFQQSxVQUFRQSxJQUFZQTtvQkFBcEJHLGlCQXdCQ0E7b0JBdkJHQSxNQUFNQSxDQUFDQSxJQUFJQSxPQUFPQSxDQUFDQSxVQUFDQSxPQUFPQSxFQUFFQSxNQUFNQTt3QkFFL0JBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLFFBQVFBLENBQUNBOzRCQUNwQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBRXJDQSxJQUFJQSxHQUFHQSxHQUFHQSxLQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFFN0JBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLGNBQWNBLEVBQUVBLENBQUNBO3dCQUM1Q0EsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxHQUFHQTs0QkFDNUIsRUFBRSxDQUFBLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUM1QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO2dDQUNoQyxFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0NBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNqQyxDQUFDO2dDQUFDLElBQUksQ0FBQyxDQUFDO29DQUNQLE1BQU0sQ0FBQyw0Q0FBMEMsSUFBTSxDQUFDLENBQUM7Z0NBQzFELENBQUM7NEJBQ0YsQ0FBQzt3QkFDRixDQUFDLENBQUNBO3dCQUVGQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDL0JBLE9BQU9BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO29CQUVWQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDUEEsQ0FBQ0E7Z0JBQ0xILG1CQUFDQTtZQUFEQSxDQWpDQUQsQUFpQ0NDLElBQUFEO1lBakNZQSx5QkFBWUEsZUFpQ3hCQSxDQUFBQTtZQUVVQSxxQkFBUUEsR0FBR0EsSUFBSUEsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFFN0NBLENBQUNBLEVBeENvQnJDLFlBQVlBLEdBQVpBLHVCQUFZQSxLQUFaQSx1QkFBWUEsUUF3Q2hDQTtJQUFEQSxDQUFDQSxFQXhDU0QsVUFBVUEsR0FBVkEsYUFBVUEsS0FBVkEsYUFBVUEsUUF3Q25CQTtBQUFEQSxDQUFDQSxFQXhDTSxFQUFFLEtBQUYsRUFBRSxRQXdDUjtBQ3ZDRCxJQUFPLEVBQUUsQ0FpQlI7QUFqQkQsV0FBTyxFQUFFO0lBQUNBLElBQUFBLFVBQVVBLENBaUJuQkE7SUFqQlNBLFdBQUFBLFVBQVVBO1FBQUNDLElBQUFBLElBQUlBLENBaUJ4QkE7UUFqQm9CQSxXQUFBQSxJQUFJQSxFQUFDQSxDQUFDQTtZQUN6QjBDLElBQUlBLENBQUNBLEdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ25CQSxJQUFJQSxJQUFJQSxHQUFVQSxFQUFFQSxDQUFDQTtZQUVyQkEsYUFBb0JBLENBQU1BO2dCQUN6QkMsQ0FBQ0EsRUFBRUEsQ0FBQ0E7Z0JBQ0pBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO2dCQUNaQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNWQSxDQUFDQTtZQUplRCxRQUFHQSxNQUlsQkEsQ0FBQUE7WUFFREEsYUFBb0JBLENBQVNBO2dCQUM1QkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBRmVGLFFBQUdBLE1BRWxCQSxDQUFBQTtZQUVEQSxjQUFxQkEsQ0FBU0E7Z0JBQUVHLGNBQU9BO3FCQUFQQSxXQUFPQSxDQUFQQSxzQkFBT0EsQ0FBUEEsSUFBT0E7b0JBQVBBLDZCQUFPQTs7Z0JBQ3RDQSxJQUFJQSxDQUFDQSxDQUFDQSxRQUFOQSxJQUFJQSxFQUFPQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNsQkEsQ0FBQ0E7WUFGZUgsU0FBSUEsT0FFbkJBLENBQUFBO1FBQ0hBLENBQUNBLEVBakJvQjFDLElBQUlBLEdBQUpBLGVBQUlBLEtBQUpBLGVBQUlBLFFBaUJ4QkE7SUFBREEsQ0FBQ0EsRUFqQlNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBaUJuQkE7QUFBREEsQ0FBQ0EsRUFqQk0sRUFBRSxLQUFGLEVBQUUsUUFpQlI7QUNsQkQscUNBQXFDO0FBQ3JDLDhCQUE4QjtBQUU5QixJQUFPLEVBQUUsQ0FrVFI7QUFsVEQsV0FBTyxFQUFFO0lBQUNBLElBQUFBLFVBQVVBLENBa1RuQkE7SUFsVFNBLFdBQUFBLFVBQVVBO1FBQUNDLElBQUFBLFFBQVFBLENBa1Q1QkE7UUFsVG9CQSxXQUFBQSxRQUFRQSxFQUFDQSxDQUFDQTtZQUMzQjhDLElBQU9BLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBO1lBT2xEQTtnQkFBQUM7b0JBR0lDLGFBQVFBLEdBQWdCQSxFQUFFQSxDQUFDQTtnQkFLL0JBLENBQUNBO2dCQUFERCxXQUFDQTtZQUFEQSxDQVJBRCxBQVFDQyxJQUFBRDtZQUVEQTtnQkFBQUc7b0JBRVlDLE1BQUNBLEdBQVFBO3dCQUN0QkEsR0FBR0EsRUFBRUEseUNBQXlDQTt3QkFDOUNBLE1BQU1BLEVBQUVBLHFCQUFxQkE7d0JBQzdCQSxJQUFJQSxFQUFFQSx1QkFBdUJBO3dCQUM3QkEsSUFBSUEsRUFBRUEseUJBQXlCQTtxQkFDL0JBLENBQUNBO29CQUVZQSxVQUFLQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxTQUFTQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxPQUFPQSxFQUFFQSxRQUFRQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxPQUFPQSxFQUFFQSxRQUFRQSxFQUFFQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtvQkFFN0lBLFVBQUtBLEdBQXdCQSxFQUFFQSxDQUFDQTtnQkFpUjVDQSxDQUFDQTtnQkEvUVVELHlCQUFNQSxHQUFiQSxVQUFjQSxTQUFvQkE7b0JBQzlCRSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxTQUFTQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFDdERBLE1BQU1BLENBQUNBO29CQUVYQSxJQUFJQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQTtvQkFDMUJBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO29CQUNsRkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7b0JBRXpEQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFFdENBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUV2Q0EsQ0FBQ0E7Z0JBR0NGLHdCQUFLQSxHQUFiQSxVQUFjQSxJQUFZQSxFQUFFQSxJQUFnQkE7b0JBQWhCRyxvQkFBZ0JBLEdBQWhCQSxXQUFVQSxJQUFJQSxFQUFFQTtvQkFFM0NBLElBQUlBLENBQUNBLENBQUNBO29CQUNOQSxPQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxFQUFFQSxDQUFDQTt3QkFDNUNBLElBQUlBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLE9BQU9BLEVBQUVBLE1BQU1BLEVBQUVBLFdBQVdBLEVBQUVBLE1BQU1BLEVBQUVBLE9BQU9BLENBQUNBO3dCQUM3REEsQUFDQUEseUNBRHlDQTt3QkFDekNBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUNsQkEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ2pDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDbENBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBOzRCQUNDQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQTs0QkFDOUJBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBOzRCQUNuQkEsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7d0JBQ2hCQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBOzRCQUNsQkEsSUFBSUEsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ3ZDQSxPQUFPQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQTs0QkFDVkEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQzFDQSxXQUFXQSxHQUFHQSxNQUFNQSxJQUFJQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQTs0QkFDbERBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBOzRCQUVwQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsV0FBV0EsSUFBSUEsUUFBUUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQy9DQSxXQUFXQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDcEJBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO2dDQUV4Q0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7NEJBQ2hCQSxDQUFDQTt3QkFDRkEsQ0FBQ0E7d0JBRURBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLEtBQUtBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUVBLENBQUNBO3dCQUUzREEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ1pBLEtBQUtBLENBQUNBO3dCQUNQQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEVBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUVBLFdBQVdBLEVBQUVBLFdBQVdBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUVBLFFBQVFBLEVBQUVBLEVBQUVBLEVBQUNBLENBQUNBLENBQUNBOzRCQUVsSUEsRUFBRUEsQ0FBQUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQzdCQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDckVBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO2dDQUNuQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7Z0NBQ3BCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDakNBLENBQUNBO3dCQUNGQSxDQUFDQTt3QkFFREEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQzVCQSxDQUFDQTtvQkFFREEsTUFBTUEsQ0FBQ0Es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aERBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBO1lBQ3ZCQSxDQUFDQTtZQUlNZCxpQkFBT0EsR0FBZEEsVUFBZUEsS0FBdUNBO2dCQUNsREcsRUFBRUEsQ0FBQUEsQ0FBQ0EsS0FBS0EsWUFBWUEsU0FBU0EsQ0FBQ0E7b0JBQzFCQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekRBLElBQUlBO29CQUNBQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqREEsQ0FBQ0E7WUFHTEgsZ0JBQUNBO1FBQURBLENBM0xBL0QsQUEyTEMrRCxJQUFBL0Q7UUEzTFlBLHNCQUFTQSxZQTJMckJBLENBQUFBO0lBQ0xBLENBQUNBLEVBak5TRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQWlObkJBO0FBQURBLENBQUNBLEVBak5NLEVBQUUsS0FBRixFQUFFLFFBaU5SIiwiZmlsZSI6ImNvbXBvbmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlciB7XHJcbiAgICBpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcbiAgICBleHBvcnQgbGV0IG1hcHBpbmc6IHtbbmFtZTpzdHJpbmddOnN0cmluZ30gPSB7fTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50UHJvdmlkZXIge1xyXG5cclxuICAgICAgICB1c2VNaW46IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmVzb2x2ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zcGxpdCgnLicpLmpvaW4oJy8nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlTWluID9cclxuICAgICAgICAgICAgICAgIGBjb21wb25lbnRzLyR7bmFtZX0ubWluLmpzYCA6XHJcbiAgICAgICAgICAgICAgICBgY29tcG9uZW50cy8ke25hbWV9LmpzYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBDb21wb25lbnQsIHN0cmluZz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dHlwZW9mIENvbXBvbmVudCwgYW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gbWFwcGluZ1tuYW1lXSB8fCB0aGlzLnJlc29sdmUobmFtZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9Db21wb25lbnQucmVnaXN0ZXIod2luZG93W25hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5nZXQobmFtZSkgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5nZXQobmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBFcnJvciB3aGlsZSBsb2FkaW5nIENvbXBvbmVudCAke25hbWV9YClcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0KG5hbWU6IHN0cmluZyk6IHR5cGVvZiBDb21wb25lbnQge1xyXG4gICAgICAgICAgICBsZXQgYzogYW55ID0gd2luZG93O1xyXG4gICAgICAgICAgICBuYW1lLnNwbGl0KCcuJykuZm9yRWFjaCgocGFydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYyA9IGNbcGFydF07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gPHR5cGVvZiBDb21wb25lbnQ+YztcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50UHJvdmlkZXIoKTtcclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8td2F0Y2gvZGlzdC9kLnRzL3dhdGNoLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby1wcm9taXNlL2Rpc3QvZC50cy9wcm9taXNlLmQudHNcIi8+XG5cbm1vZHVsZSBoby5jb21wb25lbnRzIHtcblxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXHQvKipcblx0XHRCYXNlY2xhc3MgZm9yIEF0dHJpYnV0ZXMuXG5cdFx0VXNlZCBBdHRyaWJ1dGVzIG5lZWRzIHRvIGJlIHNwZWNpZmllZCBieSBDb21wb25lbnQjYXR0cmlidXRlcyBwcm9wZXJ0eSB0byBnZXQgbG9hZGVkIHByb3Blcmx5LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQXR0cmlidXRlIHtcblxuXHRcdHByb3RlY3RlZCBlbGVtZW50OiBIVE1MRWxlbWVudDtcblx0XHRwcm90ZWN0ZWQgY29tcG9uZW50OiBDb21wb25lbnQ7XG5cdFx0cHJvdGVjdGVkIHZhbHVlOiBzdHJpbmc7XG5cblx0XHRjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgdmFsdWU/OiBzdHJpbmcpIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cdFx0XHR0aGlzLmNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRDb21wb25lbnQoZWxlbWVudCk7XG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cblx0XHRcdHRoaXMuaW5pdCgpO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBpbml0KCk6IHZvaWQge31cblxuXHRcdGdldCBuYW1lKCkge1xuXHRcdFx0cmV0dXJuIEF0dHJpYnV0ZS5nZXROYW1lKHRoaXMpO1xuXHRcdH1cblxuXG5cdFx0cHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcblxuXHRcdH1cblxuXG5cdFx0c3RhdGljIGdldE5hbWUoY2xheno6IHR5cGVvZiBBdHRyaWJ1dGUgfCBBdHRyaWJ1dGUpOiBzdHJpbmcge1xuICAgICAgICAgICAgaWYoY2xhenogaW5zdGFuY2VvZiBBdHRyaWJ1dGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgICAgIH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBXYXRjaEF0dHJpYnV0ZSBleHRlbmRzIEF0dHJpYnV0ZSB7XG5cblx0XHRwcm90ZWN0ZWQgcjogUmVnRXhwID0gLyMoLis/KSMvZztcblxuXHRcdGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB2YWx1ZT86IHN0cmluZykge1xuXHRcdFx0c3VwZXIoZWxlbWVudCwgdmFsdWUpO1xuXG5cdFx0XHRsZXQgbTogYW55W10gPSB0aGlzLnZhbHVlLm1hdGNoKHRoaXMucikgfHwgW107XG5cdFx0XHRtLm1hcChmdW5jdGlvbih3KSB7XG5cdFx0XHRcdHcgPSB3LnN1YnN0cigxLCB3Lmxlbmd0aC0yKTtcblx0XHRcdFx0dGhpcy53YXRjaCh3KTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZS5yZXBsYWNlKC8jL2csICcnKTtcblx0XHR9XG5cblxuXHRcdHByb3RlY3RlZCB3YXRjaChwYXRoOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdGxldCBwYXRoQXJyID0gcGF0aC5zcGxpdCgnLicpO1xuXHRcdFx0bGV0IHByb3AgPSBwYXRoQXJyLnBvcCgpO1xuXHRcdFx0bGV0IG9iaiA9IHRoaXMuY29tcG9uZW50O1xuXG5cdFx0XHRwYXRoQXJyLm1hcCgocGFydCkgPT4ge1xuXHRcdFx0XHRvYmogPSBvYmpbcGFydF07XG5cdFx0XHR9KTtcblxuXHRcdFx0aG8ud2F0Y2gud2F0Y2gob2JqLCBwcm9wLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgZXZhbChwYXRoOiBzdHJpbmcpOiBhbnkge1xuXHRcdFx0bGV0IG1vZGVsID0gdGhpcy5jb21wb25lbnQ7XG5cdFx0XHRtb2RlbCA9IG5ldyBGdW5jdGlvbihPYmplY3Qua2V5cyhtb2RlbCkudG9TdHJpbmcoKSwgXCJyZXR1cm4gXCIgKyBwYXRoKVxuXHRcdFx0XHQuYXBwbHkobnVsbCwgT2JqZWN0LmtleXMobW9kZWwpLm1hcCgoaykgPT4ge3JldHVybiBtb2RlbFtrXX0pICk7XG5cdFx0XHRyZXR1cm4gbW9kZWw7XG5cdFx0fVxuXG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2F0dHJpYnV0ZS50c1wiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyIHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHVzZU1pbjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZU1pbiA/XHJcbiAgICAgICAgICAgICAgICBgYXR0cmlidXRlcy8ke25hbWV9Lm1pbi5qc2AgOlxyXG4gICAgICAgICAgICAgICAgYGF0dHJpYnV0ZXMvJHtuYW1lfS5qc2A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogUHJvbWlzZTx0eXBlb2YgQXR0cmlidXRlLCBzdHJpbmc+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHR5cGVvZiBBdHRyaWJ1dGUsIGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IHRoaXMucmVzb2x2ZShuYW1lKTtcclxuICAgICAgICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0NvbXBvbmVudC5yZWdpc3Rlcih3aW5kb3dbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB3aW5kb3dbbmFtZV0gPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93W25hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChgRXJyb3Igd2hpbGUgbG9hZGluZyBBdHRyaWJ1dGUgJHtuYW1lfWApXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZSA9IG5ldyBBdHRyaWJ1dGVQcm92aWRlcigpO1xyXG5cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9jb21wb25lbnRzcHJvdmlkZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2F0dHJpYnV0ZXByb3ZpZGVyLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMucmVnaXN0cnkge1xyXG4gICAgaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5IHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRzOiBBcnJheTx0eXBlb2YgQ29tcG9uZW50PiA9IFtdO1xyXG4gICAgICAgIHByaXZhdGUgYXR0cmlidXRlczogQXJyYXk8dHlwZW9mIEF0dHJpYnV0ZT4gPSBbXTtcclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyByZWdpc3RlcihjYTogdHlwZW9mIENvbXBvbmVudCB8IHR5cGVvZiBBdHRyaWJ1dGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYoY2EucHJvdG90eXBlIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaCg8dHlwZW9mIENvbXBvbmVudD5jYSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KENvbXBvbmVudC5nZXROYW1lKDx0eXBlb2YgQ29tcG9uZW50PmNhKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihjYS5wcm90b3R5cGUgaW5zdGFuY2VvZiBBdHRyaWJ1dGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlcy5wdXNoKDx0eXBlb2YgQXR0cmlidXRlPmNhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJ1bigpOiBQcm9taXNlPGFueSwgYW55PiB7XHJcbiAgICAgICAgICAgIGxldCBpbml0Q29tcG9uZW50OiAoYzogdHlwZW9mIENvbXBvbmVudCk9PlByb21pc2U8YW55LCBhbnk+ID0gdGhpcy5pbml0Q29tcG9uZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxhbnksIGFueT4+ID0gdGhpcy5jb21wb25lbnRzLm1hcCgoYyk9PntcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbml0Q29tcG9uZW50KGMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdENvbXBvbmVudChjb21wb25lbnQ6IHR5cGVvZiBDb21wb25lbnQsIGVsZW1lbnQ6SFRNTEVsZW1lbnR8RG9jdW1lbnQ9ZG9jdW1lbnQpOiBQcm9taXNlPGFueSwgYW55PiB7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxhbnksIGFueT4+ID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKENvbXBvbmVudC5nZXROYW1lKGNvbXBvbmVudCkpLFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZSk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjb21wb25lbnQoZSkuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdEVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q29tcG9uZW50KGNvbXBvbmVudCwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5nZXROYW1lKGNvbXBvbmVudCkgPT09IG5hbWU7XHJcbiAgICAgICAgICAgICAgICB9KS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0F0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEF0dHJpYnV0ZS5nZXROYW1lKGF0dHJpYnV0ZSkgPT09IG5hbWU7XHJcbiAgICAgICAgICAgICAgICB9KS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB0eXBlb2YgQXR0cmlidXRlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBdHRyaWJ1dGUuZ2V0TmFtZShhdHRyaWJ1dGUpID09PSBuYW1lO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8dHlwZW9mIENvbXBvbmVudCwgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFBhcmVudE9mQ29tcG9uZW50KG5hbWUpXHJcbiAgICAgICAgICAgIC50aGVuKChwYXJlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHNlbGYuaGFzQ29tcG9uZW50KHBhcmVudCkgfHwgcGFyZW50ID09PSAnaG8uY29tcG9uZW50cy5Db21wb25lbnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gc2VsZi5sb2FkQ29tcG9uZW50KHBhcmVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChwYXJlbnRUeXBlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5pbnN0YW5jZS5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5yZWdpc3Rlcihjb21wb25lbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBnZXRQYXJlbnRPZkNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZywgYW55PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXNwID0geG1saHR0cC5yZXNwb25zZVRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHhtbGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG0gPSByZXNwLm1hdGNoKC99XFwpXFwoKC4qKVxcKTsvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1bMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHhtbGh0dHAub3BlbignR0VUJywgaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5pbnN0YW5jZS5yZXNvbHZlKG5hbWUpKTtcclxuICAgICAgICAgICAgICAgIHhtbGh0dHAuc2VuZCgpO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9hZEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBBdHRyaWJ1dGUsIHN0cmluZz4ge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx0eXBlb2YgQXR0cmlidXRlLCBzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIGhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIuaW5zdGFuY2UuZ2V0QXR0cmlidXRlKG5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWdpc3RlcihhdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYXR0cmlidXRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVnaXN0cnkoKTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWdpc3RyeS50c1wiLz5cblxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xuXHRleHBvcnQgZnVuY3Rpb24gcnVuKCk6IGhvLnByb21pc2UuUHJvbWlzZTxhbnksIGFueT4ge1xuXHRcdHJldHVybiBoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLnJ1bigpO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyKGM6IHR5cGVvZiBDb21wb25lbnQgfCB0eXBlb2YgQXR0cmlidXRlKTogdm9pZCB7XG5cdFx0aG8uY29tcG9uZW50cy5yZWdpc3RyeS5pbnN0YW5jZS5yZWdpc3RlcihjKTtcblx0fVxufVxuIiwibW9kdWxlIGhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyIHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBIdG1sUHJvdmlkZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIGNhY2hlOiB7W2theTpzdHJpbmddOnN0cmluZ30gPSB7fTtcclxuXHJcbiAgICAgICAgcmVzb2x2ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYGNvbXBvbmVudHMvJHtuYW1lfS5odG1sYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldEhUTUwobmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcsIHN0cmluZz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmNhY2hlW25hbWVdID09PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0aGlzLmNhY2hlW25hbWVdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5yZXNvbHZlKG5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICBcdFx0XHR4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXHRcdFx0XHRpZih4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCkge1xyXG4gICAgXHRcdFx0XHRcdGxldCByZXNwID0geG1saHR0cC5yZXNwb25zZVRleHQ7XHJcbiAgICBcdFx0XHRcdFx0aWYoeG1saHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3ApO1xyXG4gICAgXHRcdFx0XHRcdH0gZWxzZSB7XHJcbiAgICBcdFx0XHRcdFx0XHRyZWplY3QoYEVycm9yIHdoaWxlIGxvYWRpbmcgaHRtbCBmb3IgQ29tcG9uZW50ICR7bmFtZX1gKTtcclxuICAgIFx0XHRcdFx0XHR9XHJcbiAgICBcdFx0XHRcdH1cclxuICAgIFx0XHRcdH07XHJcblxyXG4gICAgXHRcdFx0eG1saHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZSA9IG5ldyBIdG1sUHJvdmlkZXIoKTtcclxuXHJcbn1cclxuIiwiXG5tb2R1bGUgaG8uY29tcG9uZW50cy50ZW1wIHtcblx0XHR2YXIgYzogbnVtYmVyID0gLTE7XG5cdFx0dmFyIGRhdGE6IGFueVtdID0gW107XG5cblx0XHRleHBvcnQgZnVuY3Rpb24gc2V0KGQ6IGFueSk6IG51bWJlciB7XG5cdFx0XHRjKys7XG5cdFx0XHRkYXRhW2NdID0gZDtcblx0XHRcdHJldHVybiBjO1xuXHRcdH1cblxuXHRcdGV4cG9ydCBmdW5jdGlvbiBnZXQoaTogbnVtYmVyKTogYW55IHtcblx0XHRcdHJldHVybiBkYXRhW2ldO1xuXHRcdH1cblxuXHRcdGV4cG9ydCBmdW5jdGlvbiBjYWxsKGk6IG51bWJlciwgLi4uYXJncyk6IHZvaWQge1xuXHRcdFx0ZGF0YVtpXSguLi5hcmdzKTtcblx0XHR9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWdpc3RyeS50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdGVtcFwiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzLnJlbmRlcmVyIHtcclxuICAgIGltcG9ydCBSZWdpc3RyeSA9IGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2U7XHJcblxyXG4gICAgaW50ZXJmYWNlIE5vZGVIdG1sIHtcclxuICAgICAgICByb290OiBOb2RlO1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBOb2RlIHtcclxuICAgICAgICBodG1sOiBzdHJpbmc7XHJcbiAgICAgICAgcGFyZW50OiBOb2RlO1xyXG4gICAgICAgIGNoaWxkcmVuOiBBcnJheTxOb2RlPiA9IFtdO1xyXG4gICAgICAgIHR5cGU6IHN0cmluZztcclxuICAgICAgICBzZWxmQ2xvc2luZzogYm9vbGVhbjtcclxuICAgICAgICBpc1ZvaWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcmVwZWF0OiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgcjogYW55ID0ge1xyXG5cdFx0XHR0YWc6IC88KFtePl0qPyg/Oig/OignfFwiKVteJ1wiXSo/XFwyKVtePl0qPykqKT4vLFxyXG5cdFx0XHRyZXBlYXQ6IC9yZXBlYXQ9W1wifCddLitbXCJ8J10vLFxyXG5cdFx0XHR0eXBlOiAvW1xcc3wvXSooLio/KVtcXHN8XFwvfD5dLyxcclxuXHRcdFx0dGV4dDogLyg/Oi58W1xcclxcbl0pKj9bXlwiJ1xcXFxdPC9tLFxyXG5cdFx0fTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkcyA9IFtcImFyZWFcIiwgXCJiYXNlXCIsIFwiYnJcIiwgXCJjb2xcIiwgXCJjb21tYW5kXCIsIFwiZW1iZWRcIiwgXCJoclwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwia2V5Z2VuXCIsIFwibGlua1wiLCBcIm1ldGFcIiwgXCJwYXJhbVwiLCBcInNvdXJjZVwiLCBcInRyYWNrXCIsIFwid2JyXCJdO1xyXG5cclxuICAgICAgICBwcml2YXRlIGNhY2hlOiB7W2tleTpzdHJpbmddOk5vZGV9ID0ge307XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYodHlwZW9mIGNvbXBvbmVudC5odG1sID09PSAnYm9vbGVhbicgJiYgIWNvbXBvbmVudC5odG1sKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWUgPSBjb21wb25lbnQubmFtZTtcclxuICAgICAgICAgICAgbGV0IHJvb3QgPSB0aGlzLmNhY2hlW25hbWVdID0gdGhpcy5jYWNoZVtuYW1lXSB8fCB0aGlzLnBhcnNlKGNvbXBvbmVudC5odG1sKS5yb290O1xyXG4gICAgICAgICAgICByb290ID0gdGhpcy5yZW5kZXJSZXBlYXQodGhpcy5jb3B5Tm9kZShyb290KSwgY29tcG9uZW50KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gdGhpcy5kb21Ub1N0cmluZyhyb290LCAtMSk7XHJcblxyXG4gICAgICAgICAgICBjb21wb25lbnQuZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuXHRcdHByaXZhdGUgcGFyc2UoaHRtbDogc3RyaW5nLCByb290PSBuZXcgTm9kZSgpKTogTm9kZUh0bWwge1xyXG5cclxuXHRcdFx0dmFyIG07XHJcblx0XHRcdHdoaWxlKChtID0gdGhpcy5yLnRhZy5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdHZhciB0YWcsIHR5cGUsIGNsb3NpbmcsIGlzVm9pZCwgc2VsZkNsb3NpbmcsIHJlcGVhdCwgdW5DbG9zZTtcclxuXHRcdFx0XHQvLy0tLS0tLS0gZm91bmQgc29tZSB0ZXh0IGJlZm9yZSBuZXh0IHRhZ1xyXG5cdFx0XHRcdGlmKG0uaW5kZXggIT09IDApIHtcclxuXHRcdFx0XHRcdHRhZyA9IGh0bWwubWF0Y2godGhpcy5yLnRleHQpWzBdO1xyXG5cdFx0XHRcdFx0dGFnID0gdGFnLnN1YnN0cigwLCB0YWcubGVuZ3RoLTEpO1xyXG5cdFx0XHRcdFx0dHlwZSA9ICdURVhUJztcclxuICAgICAgICAgICAgICAgICAgICBpc1ZvaWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHRcdHJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0YWcgPSBtWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdHR5cGUgPSAodGFnKyc+JykubWF0Y2godGhpcy5yLnR5cGUpWzFdO1xyXG5cdFx0XHRcdFx0Y2xvc2luZyA9IHRhZ1swXSA9PT0gJy8nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzVm9pZCA9IHRoaXMuaXNWb2lkKHR5cGUpO1xyXG5cdFx0XHRcdFx0c2VsZkNsb3NpbmcgPSBpc1ZvaWQgfHwgdGFnW3RhZy5sZW5ndGgtMV0gPT09ICcvJztcclxuXHRcdFx0XHRcdHJlcGVhdCA9ICEhdGFnLm1hdGNoKHRoaXMuci5yZXBlYXQpO1xyXG5cclxuXHRcdFx0XHRcdGlmKHNlbGZDbG9zaW5nICYmIFJlZ2lzdHJ5Lmhhc0NvbXBvbmVudCh0eXBlKSkge1xyXG5cdFx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR0YWcgPSB0YWcuc3Vic3RyKDAsIHRhZy5sZW5ndGgtMSkgKyBcIiBcIjtcclxuXHJcblx0XHRcdFx0XHRcdHVuQ2xvc2UgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aHRtbCA9IGh0bWwuc2xpY2UodGFnLmxlbmd0aCArICh0eXBlID09PSAnVEVYVCcgPyAwIDogMikgKTtcclxuXHJcblx0XHRcdFx0aWYoY2xvc2luZykge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucHVzaCh7cGFyZW50OiByb290LCBodG1sOiB0YWcsIHR5cGU6IHR5cGUsIGlzVm9pZDogaXNWb2lkLCBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsIHJlcGVhdDogcmVwZWF0LCBjaGlsZHJlbjogW119KTtcclxuXHJcblx0XHRcdFx0XHRpZighdW5DbG9zZSAmJiAhc2VsZkNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2UoaHRtbCwgcm9vdC5jaGlsZHJlbltyb290LmNoaWxkcmVuLmxlbmd0aC0xXSk7XHJcblx0XHRcdFx0XHRcdGh0bWwgPSByZXN1bHQuaHRtbDtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wb3AoKTtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHJlc3VsdC5yb290KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG0gPSBodG1sLm1hdGNoKHRoaXMuci50YWcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge3Jvb3Q6IHJvb3QsIGh0bWw6IGh0bWx9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgcmVuZGVyUmVwZWF0KHJvb3QsIG1vZGVscyk6IE5vZGUge1xyXG5cdFx0XHRtb2RlbHMgPSBbXS5jb25jYXQobW9kZWxzKTtcclxuXHJcblx0XHRcdGZvcih2YXIgYyA9IDA7IGMgPCByb290LmNoaWxkcmVuLmxlbmd0aDsgYysrKSB7XHJcblx0XHRcdFx0dmFyIGNoaWxkID0gcm9vdC5jaGlsZHJlbltjXTtcclxuXHRcdFx0XHRpZihjaGlsZC5yZXBlYXQpIHtcclxuXHRcdFx0XHRcdHZhciByZWdleCA9IC9yZXBlYXQ9W1wifCddXFxzKihcXFMrKVxccythc1xccysoXFxTKz8pW1wifCddLztcclxuXHRcdFx0XHRcdHZhciBtID0gY2hpbGQuaHRtbC5tYXRjaChyZWdleCkuc2xpY2UoMSk7XHJcblx0XHRcdFx0XHR2YXIgbmFtZSA9IG1bMV07XHJcblx0XHRcdFx0XHR2YXIgaW5kZXhOYW1lO1xyXG5cdFx0XHRcdFx0aWYobmFtZS5pbmRleE9mKCcsJykgPiAtMSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KCcsJyk7XHJcblx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lc1swXS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGluZGV4TmFtZSA9IG5hbWVzWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR2YXIgbW9kZWwgPSB0aGlzLmV2YWx1YXRlKG1vZGVscywgbVswXSk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGhvbGRlciA9IFtdO1xyXG5cdFx0XHRcdFx0bW9kZWwuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG1vZGVsMiA9IHt9O1xyXG5cdFx0XHRcdFx0XHRtb2RlbDJbbmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0bW9kZWwyW2luZGV4TmFtZV0gPSBpbmRleDtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBtb2RlbHMyID0gW10uY29uY2F0KG1vZGVscyk7XHJcblx0XHRcdFx0XHRcdG1vZGVsczIudW5zaGlmdChtb2RlbDIpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLmNvcHlOb2RlKGNoaWxkKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0bm9kZS5odG1sID0gbm9kZS5odG1sLnJlcGxhY2UodGhpcy5yLnJlcGVhdCwgJycpO1xyXG5cdFx0XHRcdFx0XHRub2RlLmh0bWwgPSB0aGlzLnJlcGwobm9kZS5odG1sLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdG5vZGUgPSB0aGlzLnJlbmRlclJlcGVhdChub2RlLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vcm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMCwgbm9kZSk7XHJcblx0XHRcdFx0XHRcdGhvbGRlci5wdXNoKG5vZGUpO1xyXG5cdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRcdFx0XHRob2xkZXIuZm9yRWFjaChmdW5jdGlvbihuKSB7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDAsIG4pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAxKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2hpbGQuaHRtbCA9IHRoaXMucmVwbChjaGlsZC5odG1sLCBtb2RlbHMpO1xyXG5cdFx0XHRcdFx0Y2hpbGQgPSB0aGlzLnJlbmRlclJlcGVhdChjaGlsZCwgbW9kZWxzKTtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW5bY10gPSBjaGlsZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByb290O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZG9tVG9TdHJpbmcocm9vdDogTm9kZSwgaW5kZW50OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0XHRpbmRlbnQgPSBpbmRlbnQgfHwgMDtcclxuXHRcdFx0dmFyIGh0bWwgPSAnJztcclxuICAgICAgICAgICAgY29uc3QgdGFiOiBhbnkgPSAnXFx0JztcclxuXHJcblx0XHRcdGlmKHJvb3QuaHRtbCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gbmV3IEFycmF5KGluZGVudCkuam9pbih0YWIpOyAvL3RhYi5yZXBlYXQoaW5kZW50KTs7XHJcblx0XHRcdFx0aWYocm9vdC50eXBlICE9PSAnVEVYVCcpIHtcclxuXHRcdFx0XHRcdGlmKHJvb3Quc2VsZkNsb3NpbmcgJiYgIXJvb3QuaXNWb2lkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8JyArIHJvb3QuaHRtbCArICcvPic7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8JyArIHJvb3QuaHRtbCArICc+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0XHRlbHNlIGh0bWwgKz0gcm9vdC5odG1sO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihodG1sKVxyXG5cdFx0XHRcdGh0bWwgKz0gJ1xcbic7XHJcblxyXG5cdFx0XHRpZihyb290LmNoaWxkcmVuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gcm9vdC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9tVG9TdHJpbmcoYywgaW5kZW50Kyhyb290LnR5cGUgPyAxIDogMikpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzKSkuam9pbignXFxuJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHJvb3QudHlwZSAmJiByb290LnR5cGUgIT09ICdURVhUJyAmJiAhcm9vdC5zZWxmQ2xvc2luZykge1xyXG5cdFx0XHRcdGh0bWwgKz0gbmV3IEFycmF5KGluZGVudCkuam9pbih0YWIpOyAvL3RhYi5yZXBlYXQoaW5kZW50KTtcclxuXHRcdFx0XHRodG1sICs9ICc8Lycrcm9vdC50eXBlKyc+XFxuJztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGh0bWw7XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVwbChzdHI6IHN0cmluZywgbW9kZWxzOiBhbnlbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHZhciByZWdleEcgPSAveyguKz8pfX0/L2c7XHJcblxyXG4gICAgICAgICAgICB2YXIgbSA9IHN0ci5tYXRjaChyZWdleEcpO1xyXG4gICAgICAgICAgICBpZighbSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblxyXG4gICAgICAgICAgICB3aGlsZShtLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBtWzBdO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKDEsIHBhdGgubGVuZ3RoLTIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZXZhbHVhdGUobW9kZWxzLCBwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gXCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXRDb21wb25lbnQodGhpcykuXCIrcGF0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobVswXSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG0gPSBtLnNsaWNlKDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZShtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgICAgICBpZihwYXRoWzBdID09PSAneycgJiYgcGF0aFstLXBhdGgubGVuZ3RoXSA9PT0gJ30nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVscywgcGF0aC5zdWJzdHIoMSwgcGF0aC5sZW5ndGgtMikpXHJcbiAgICAgICAgICAgIGVsc2UgaWYocGF0aFswXSA9PT0gJyMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVGdW5jdGlvbihtb2RlbHMsIHBhdGguc3Vic3RyKDEpKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVWYWx1ZShtb2RlbHMsIHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZVZhbHVlKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHMsIHBhdGgpLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcblx0XHRwcml2YXRlIGV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiB7dmFsdWU6IGFueSwgbW9kZWw6IGFueX0ge1xyXG5cdFx0XHRpZihtb2RlbHMuaW5kZXhPZih3aW5kb3cpID09IC0xKVxyXG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2god2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKFwibW9kZWxcIiwgXCJyZXR1cm4gbW9kZWxbJ1wiICsgcGF0aC5zcGxpdChcIi5cIikuam9pbihcIiddWydcIikgKyBcIiddXCIpKG1vZGVsKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcInZhbHVlXCI6IG1vZGVsLCBcIm1vZGVsXCI6IG1vZGVsc1stLW1pXX07XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcblx0XHRcdGlmKG1vZGVscy5pbmRleE9mKHdpbmRvdykgPT0gLTEpXHJcbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaCh3aW5kb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1pID0gMDtcclxuXHRcdFx0dmFyIG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHR3aGlsZShtaSA8IG1vZGVscy5sZW5ndGggJiYgbW9kZWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG1vZGVsID0gbW9kZWxzW21pXTtcclxuXHRcdFx0XHR0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aChtb2RlbCkgbW9kZWwgPSBldmFsKHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsID0gbmV3IEZ1bmN0aW9uKE9iamVjdC5rZXlzKG1vZGVsKS50b1N0cmluZygpLCBcInJldHVybiBcIiArIHBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBseShudWxsLCBPYmplY3Qua2V5cyhtb2RlbCkubWFwKChrKSA9PiB7cmV0dXJuIG1vZGVsW2tdfSkgKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1vZGVsO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlRnVuY3Rpb24obW9kZWxzOiBhbnlbXSwgcGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICAgICAgbGV0IGV4cCA9IHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uLmJpbmQodGhpcywgbW9kZWxzKTtcclxuXHRcdFx0dmFyIFtuYW1lLCBhcmdzXSA9IHBhdGguc3BsaXQoJygnKTtcclxuICAgICAgICAgICAgYXJncyA9IGFyZ3Muc3Vic3RyKDAsIC0tYXJncy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHt2YWx1ZSwgbW9kZWx9ID0gdGhpcy5ldmFsdWF0ZVZhbHVlQW5kTW9kZWwobW9kZWxzLCBuYW1lKTtcclxuICAgICAgICAgICAgbGV0IGZ1bmM6IEZ1bmN0aW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGxldCBhcmdBcnI6IHN0cmluZ1tdID0gYXJncy5zcGxpdCgnLicpLm1hcCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnLmluZGV4T2YoJyMnKSA9PT0gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnLnN1YnN0cigxKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwKGFyZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuYyA9IGZ1bmMuYmluZChtb2RlbCwgLi4uYXJnQXJyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhvLmNvbXBvbmVudHMudGVtcC5zZXQoZnVuYyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RyID0gYGhvLmNvbXBvbmVudHMudGVtcC5jYWxsKCR7aW5kZXh9KWA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBjb3B5Tm9kZShub2RlOiBOb2RlKTogTm9kZSB7XHJcblx0XHRcdHZhciBjb3B5Tm9kZSA9IHRoaXMuY29weU5vZGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBuID0gPE5vZGU+e1xyXG5cdFx0XHRcdHBhcmVudDogbm9kZS5wYXJlbnQsXHJcblx0XHRcdFx0aHRtbDogbm9kZS5odG1sLFxyXG5cdFx0XHRcdHR5cGU6IG5vZGUudHlwZSxcclxuXHRcdFx0XHRzZWxmQ2xvc2luZzogbm9kZS5zZWxmQ2xvc2luZyxcclxuXHRcdFx0XHRyZXBlYXQ6IG5vZGUucmVwZWF0LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBub2RlLmNoaWxkcmVuLm1hcChjb3B5Tm9kZSlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHJldHVybiBuO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGlzVm9pZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudm9pZHMuaW5kZXhPZihuYW1lLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVuZGVyZXIoKTtcclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbWFpblwiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVnaXN0cnlcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2h0bWxwcm92aWRlci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVuZGVyZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2F0dHJpYnV0ZS50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L3Byb21pc2UuZC50c1wiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBpbXBvcnQgUmVnaXN0cnkgPSBoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlO1xyXG4gICAgaW1wb3J0IEh0bWxQcm92aWRlciA9IGhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLmluc3RhbmNlO1xyXG4gICAgaW1wb3J0IFJlbmRlcmVyID0gaG8uY29tcG9uZW50cy5yZW5kZXJlci5pbnN0YW5jZTtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgICAgICBjb21wb25lbnQ/OiBDb21wb25lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJUHJvcHJldHkge1xyXG4gICAgICAgIG5hbWU6IHN0cmluZztcclxuICAgICAgICByZXF1aXJlZD86IGJvb2xlYW47XHJcbiAgICAgICAgZGVmYXVsdD86IGFueTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAgICBCYXNlY2xhc3MgZm9yIENvbXBvbmVudHNcclxuICAgICAgICBpbXBvcnRhbnQ6IGRvIGluaXRpYWxpemF0aW9uIHdvcmsgaW4gQ29tcG9uZW50I2luaXRcclxuICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcclxuICAgICAgICBlbGVtZW50OiBDb21wb25lbnRFbGVtZW50O1xyXG4gICAgICAgIG9yaWdpbmFsX2lubmVySFRNTDogc3RyaW5nO1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgICAgICBwcm9wZXJ0aWVzOiBBcnJheTxzdHJpbmd8SVByb3ByZXR5PiA9IFtdO1xyXG4gICAgICAgIGF0dHJpYnV0ZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgICAgICByZXF1aXJlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIGNoaWxkcmVuOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0gaW5pdCBFbGVtZW5ldCBhbmQgRWxlbWVudHMnIG9yaWdpbmFsIGlubmVySFRNTFxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY29tcG9uZW50ID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbF9pbm5lckhUTUwgPSBlbGVtZW50LmlubmVySFRNTDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXQgbmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50LmdldE5hbWUodGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBhcmVudCgpOiBDb21wb25lbnQge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50LmdldENvbXBvbmVudCg8Q29tcG9uZW50RWxlbWVudD50aGlzLmVsZW1lbnQucGFyZW50Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgX2luaXQoKTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVuZGVyID0gdGhpcy5yZW5kZXIuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgLy8tLS0tLS0tLSBpbml0IFByb3BlcnRpZXNcclxuICAgICAgICAgICAgdGhpcy5pbml0UHJvcGVydGllcygpO1xyXG5cclxuICAgICAgICAgICAgLy8tLS0tLS0tIGNhbGwgaW5pdCgpICYgbG9hZFJlcXVpcmVtZW50cygpIC0+IHRoZW4gcmVuZGVyXHJcbiAgICAgICAgICAgIGxldCByZWFkeSA9IFt0aGlzLmluaXRIVE1MKCksIFByb21pc2UuY3JlYXRlKHRoaXMuaW5pdCgpKSwgdGhpcy5sb2FkUmVxdWlyZW1lbnRzKCldO1xyXG5cclxuICAgICAgICAgICAgbGV0IHAgPSBuZXcgUHJvbWlzZTxhbnksIGFueT4oKTtcclxuXHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHJlYWR5KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlbmRlcigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAgICBNZXRob2QgdGhhdCBnZXQgY2FsbGVkIGFmdGVyIGluaXRpYWxpemF0aW9uIG9mIGEgbmV3IGluc3RhbmNlLlxyXG4gICAgICAgICAgICBEbyBpbml0LXdvcmsgaGVyZS5cclxuICAgICAgICAgICAgTWF5IHJldHVybiBhIFByb21pc2UuXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW5pdCgpOiBhbnkge31cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtyZXR1cm4gdm9pZCAwO31cclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgIFx0XHRSZW5kZXJlci5yZW5kZXIodGhpcyk7XHJcblxyXG4gICAgXHRcdFJlZ2lzdHJ5LmluaXRFbGVtZW50KHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgXHRcdHRoaXMuaW5pdENoaWxkcmVuKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluaXRBdHRyaWJ1dGVzKCk7XHJcblxyXG5cdFx0XHR0aGlzLnVwZGF0ZSgpO1xyXG4gICAgXHR9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqICBBc3N1cmUgdGhhdCB0aGlzIGluc3RhbmNlIGhhcyBhbiB2YWxpZCBodG1sIGF0dHJpYnV0ZSBhbmQgaWYgbm90IGxvYWQgYW5kIHNldCBpdC5cclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaW5pdEhUTUwoKTogUHJvbWlzZTxhbnksYW55PiB7XHJcbiAgICAgICAgICAgIGxldCBwID0gbmV3IFByb21pc2UoKTtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ2Jvb2xlYW4nKVxyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmh0bWwgPT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmh0bWwgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAvL2xldCBuYW1lID0gQ29tcG9uZW50LmdldE5hbWUodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBIdG1sUHJvdmlkZXIuZ2V0SFRNTCh0aGlzLm5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaHRtbCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKHAucmVqZWN0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRQcm9wZXJ0aWVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgcHJvcCA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BlcnRpZXNbcHJvcC5uYW1lXSA9IHRoaXMuZWxlbWVudFtwcm9wLm5hbWVdIHx8IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUocHJvcC5uYW1lKSB8fCBwcm9wLmRlZmF1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5wcm9wZXJ0aWVzW3Byb3AubmFtZV0gPT09IHVuZGVmaW5lZCAmJiBwcm9wLnJlcXVpcmVkID09PSB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBgUHJvcGVydHkgJHtwcm9wLm5hbWV9IGlzIHJlcXVpcmVkIGJ1dCBub3QgcHJvdmlkZWRgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZih0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3BdID0gdGhpcy5lbGVtZW50W3Byb3BdIHx8IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUocHJvcCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRDaGlsZHJlbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkcyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgICBcdFx0Zm9yKGxldCBjID0gMDsgYyA8IGNoaWxkcy5sZW5ndGg7IGMrKykge1xyXG4gICAgXHRcdFx0bGV0IGNoaWxkID0gY2hpbGRzW2NdO1xyXG4gICAgXHRcdFx0aWYoY2hpbGQuaWQpIHtcclxuICAgIFx0XHRcdFx0dGhpcy5jaGlsZHJlbltjaGlsZC5pZF0gPSBjaGlsZDtcclxuICAgIFx0XHRcdH1cclxuICAgIFx0XHRcdGlmKGNoaWxkLnRhZ05hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltjaGlsZC50YWdOYW1lXSA9IHRoaXMuY2hpbGRyZW5bY2hpbGQudGFnTmFtZV0gfHwgW107XHJcbiAgICAgICAgICAgICAgICAoPEVsZW1lbnRbXT50aGlzLmNoaWxkcmVuW2NoaWxkLnRhZ05hbWVdKS5wdXNoKGNoaWxkKTtcclxuICAgIFx0XHR9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRBdHRyaWJ1dGVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyID0gUmVnaXN0cnkuZ2V0QXR0cmlidXRlKGEpO1xyXG4gICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgKlske2F9XWApLCAoZTogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsID0gZS5oYXNPd25Qcm9wZXJ0eShhKSA/IGVbYV0gOiBlLmdldEF0dHJpYnV0ZShhKTtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJiB2YWwgPT09ICcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IGF0dHIoZSwgdmFsKS51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbG9hZFJlcXVpcmVtZW50cygpIHtcclxuICAgIFx0XHRsZXQgY29tcG9uZW50czogYW55W10gPSB0aGlzLnJlcXVpcmVzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICFSZWdpc3RyeS5oYXNDb21wb25lbnQocmVxKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm1hcCgocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVnaXN0cnkubG9hZENvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICBsZXQgYXR0cmlidXRlczogYW55W10gPSB0aGlzLmF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgLmZpbHRlcigocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIVJlZ2lzdHJ5Lmhhc0F0dHJpYnV0ZShyZXEpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAubWFwKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWdpc3RyeS5sb2FkQXR0cmlidXRlKHJlcSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlcyA9IGNvbXBvbmVudHMuY29uY2F0KGF0dHJpYnV0ZXMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgIFx0fTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICBzdGF0aWMgcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZWdpc3RyeS5yZWdpc3RlcihjKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICBzdGF0aWMgcnVuKG9wdD86IGFueSkge1xyXG4gICAgICAgICAgICBSZWdpc3RyeS5zZXRPcHRpb25zKG9wdCk7XHJcbiAgICAgICAgICAgIFJlZ2lzdHJ5LnJ1bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAqL1xyXG5cclxuICAgICAgICBzdGF0aWMgZ2V0Q29tcG9uZW50KGVsZW1lbnQ6IENvbXBvbmVudEVsZW1lbnQpOiBDb21wb25lbnQge1xyXG4gICAgICAgICAgICB3aGlsZSghZWxlbWVudC5jb21wb25lbnQpXHJcbiAgICBcdFx0XHRlbGVtZW50ID0gPENvbXBvbmVudEVsZW1lbnQ+ZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgXHRcdHJldHVybiBlbGVtZW50LmNvbXBvbmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBnZXROYW1lKGNsYXp6OiB0eXBlb2YgQ29tcG9uZW50KTogc3RyaW5nO1xyXG4gICAgICAgIHN0YXRpYyBnZXROYW1lKGNsYXp6OiBDb21wb25lbnQpOiBzdHJpbmc7XHJcbiAgICAgICAgc3RhdGljIGdldE5hbWUoY2xheno6ICh0eXBlb2YgQ29tcG9uZW50KSB8IChDb21wb25lbnQpKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgaWYoY2xhenogaW5zdGFuY2VvZiBDb21wb25lbnQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xhenouY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9