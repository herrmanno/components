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
                    if (ho.components.dir) {
                        name += '.' + name.split('.').pop();
                    }
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
/// <reference path="../../bower_components/ho-promise/dist/promise.d.ts"/>
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
                    if (ho.components.dir) {
                        name += '.' + name.split('.').pop();
                    }
                    name = name.split('.').join('/');
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
                    var initComponent = this.initComponent.bind(this);
                    var promises = Array.prototype.map.call(this.components, function (component) {
                        return initComponent(component, element);
                    });
                    return Promise.all(promises);
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
                Registry.prototype.loadAttribute = function (name) {
                    var self = this;
                    return this.getParentOfAttribute(name)
                        .then(function (parent) {
                        if (self.hasAttribute(parent) || parent === 'ho.components.Attribute' || parent === 'ho.component.WatchAttribute')
                            return true;
                        else
                            return self.loadAttribute(parent);
                    })
                        .then(function (parentType) {
                        return ho.components.attributeprovider.instance.getAttribute(name);
                    })
                        .then(function (attribute) {
                        self.register(attribute);
                        return attribute;
                    });
                    /*
                    let self = this;
                    return new Promise<typeof Attribute, string>((resolve, reject) => {
                        ho.components.attributeprovider.instance.getAttribute(name)
                        .then((attribute) => {
                            self.register(attribute);
                            resolve(attribute);
                        });
                    });
                    */
                };
                Registry.prototype.getParentOfComponent = function (name) {
                    return this.getParentOfClass(ho.components.componentprovider.instance.resolve(name));
                };
                Registry.prototype.getParentOfAttribute = function (name) {
                    return this.getParentOfClass(ho.components.attributeprovider.instance.resolve(name));
                };
                Registry.prototype.getParentOfClass = function (path) {
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
                        xmlhttp.open('GET', path);
                        xmlhttp.send();
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
        components.dir = false;
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
                    if (ho.components.dir) {
                        name += '.' + name.split('.').pop();
                    }
                    name = name.split('.').join('/');
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
                            //if(root.selfClosing && !root.isVoid)
                            //    html += '<' + root.html + '/>';
                            //else
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
var ho;
(function (ho) {
    var components;
    (function (components) {
        var styler;
        (function (styler) {
            var Styler = (function () {
                function Styler() {
                }
                Styler.prototype.applyStyle = function (component, css) {
                    var _this = this;
                    if (css === void 0) { css = component.style; }
                    var style = this.parseStyle(component.style);
                    style.forEach(function (s) {
                        _this.applyStyleBlock(component, s);
                    });
                };
                Styler.prototype.applyStyleBlock = function (component, style) {
                    var _this = this;
                    if (style.selector.trim().toLowerCase() === 'this') {
                        style.rules.forEach(function (r) {
                            _this.applyRule(component.element, r);
                        });
                    }
                    else {
                        Array.prototype.forEach.call(component.element.querySelectorAll(style.selector), function (el) {
                            style.rules.forEach(function (r) {
                                _this.applyRule(el, r);
                            });
                        });
                    }
                };
                Styler.prototype.applyRule = function (element, rule) {
                    var prop = rule.property.replace(/-(\w)/g, function (_, letter) {
                        return letter.toUpperCase();
                    }).trim();
                    element.style[prop] = rule.value;
                };
                Styler.prototype.parseStyle = function (css) {
                    var r = /(.+?)\s*{(.*?)}/gm;
                    var r2 = /(.+?)\s?:(.+?);/gm;
                    css = css.replace(/\n/g, '');
                    var blocks = (css.match(r) || [])
                        .map(function (b) {
                        if (!b.match(r))
                            return null;
                        var _a = r.exec(b), _ = _a[0], selector = _a[1], _rules = _a[2];
                        var rules = (_rules.match(r2) || [])
                            .map(function (r) {
                            if (!r.match(r2))
                                return null;
                            var _a = r2.exec(r), _ = _a[0], property = _a[1], value = _a[2];
                            return { property: property, value: value };
                        })
                            .filter(function (r) {
                            return r !== null;
                        });
                        return { selector: selector, rules: rules };
                    })
                        .filter(function (b) {
                        return b !== null;
                    });
                    return blocks;
                };
                return Styler;
            })();
            styler.instance = new Styler();
        })(styler = components.styler || (components.styler = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="./main"/>
/// <reference path="./registry"/>
/// <reference path="./htmlprovider.ts"/>
/// <reference path="./renderer.ts"/>
/// <reference path="./attribute.ts"/>
/// <reference path="./styler.ts"/>
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
                this.html = '';
                this.style = '';
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
                Registry.initElement(this.element)
                    .then(function () {
                    this.initChildren();
                    this.initStyle();
                    this.initAttributes();
                    this.update();
                }.bind(this));
            };
            ;
            Component.prototype.initStyle = function () {
                if (typeof this.style === 'undefined')
                    return;
                if (this.style === null)
                    return;
                if (typeof this.style === 'string' && this.style.length === 0)
                    return;
                components_1.styler.instance.applyStyle(this);
            };
            /**
            *  Assure that this instance has an valid html attribute and if not load and set it.
            */
            Component.prototype.initHTML = function () {
                var p = new Promise();
                var self = this;
                if (typeof this.html === 'undefined') {
                    this.html = '';
                    p.resolve();
                }
                else {
                    if (this.html.indexOf(".html", this.html.length - ".html".length) !== -1) {
                        HtmlProvider.getHTML(this.name)
                            .then(function (html) {
                            self.html = html;
                            p.resolve();
                        })
                            .catch(p.reject);
                    }
                    else {
                        p.resolve();
                    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHNwcm92aWRlci50cyIsImF0dHJpYnV0ZS50cyIsImF0dHJpYnV0ZXByb3ZpZGVyLnRzIiwicmVnaXN0cnkudHMiLCJtYWluLnRzIiwiaHRtbHByb3ZpZGVyLnRzIiwidGVtcC50cyIsInJlbmRlcmVyLnRzIiwic3R5bGVyLnRzIiwiY29tcG9uZW50cy50cyJdLCJuYW1lcyI6WyJobyIsImhvLmNvbXBvbmVudHMiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5Db21wb25lbnRQcm92aWRlciIsImhvLmNvbXBvbmVudHMuY29tcG9uZW50cHJvdmlkZXIuQ29tcG9uZW50UHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLkNvbXBvbmVudFByb3ZpZGVyLnJlc29sdmUiLCJoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLkNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuY29tcG9uZW50cHJvdmlkZXIuQ29tcG9uZW50UHJvdmlkZXIuZ2V0IiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlLmluaXQiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS5uYW1lIiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUudXBkYXRlIiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUuZ2V0TmFtZSIsImhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5XYXRjaEF0dHJpYnV0ZS53YXRjaCIsImhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUuZXZhbCIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIiLCJoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLkF0dHJpYnV0ZVByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5hdHRyaWJ1dGVwcm92aWRlci5BdHRyaWJ1dGVQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIuQXR0cmlidXRlUHJvdmlkZXIucmVzb2x2ZSIsImhvLmNvbXBvbmVudHMuYXR0cmlidXRlcHJvdmlkZXIuQXR0cmlidXRlUHJvdmlkZXIuZ2V0QXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeSIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5yZWdpc3RlciIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkucnVuIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5pbml0Q29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5pbml0RWxlbWVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaGFzQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5oYXNBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmdldEF0dHJpYnV0ZSIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkubG9hZENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkubG9hZEF0dHJpYnV0ZSIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuZ2V0UGFyZW50T2ZDb21wb25lbnQiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmdldFBhcmVudE9mQXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5nZXRQYXJlbnRPZkNsYXNzIiwiaG8uY29tcG9uZW50cy5ydW4iLCJoby5jb21wb25lbnRzLnJlZ2lzdGVyIiwiaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIiLCJoby5jb21wb25lbnRzLmh0bWxwcm92aWRlci5IdG1sUHJvdmlkZXIiLCJoby5jb21wb25lbnRzLmh0bWxwcm92aWRlci5IdG1sUHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLmh0bWxwcm92aWRlci5IdG1sUHJvdmlkZXIucmVzb2x2ZSIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5nZXRIVE1MIiwiaG8uY29tcG9uZW50cy50ZW1wIiwiaG8uY29tcG9uZW50cy50ZW1wLnNldCIsImhvLmNvbXBvbmVudHMudGVtcC5nZXQiLCJoby5jb21wb25lbnRzLnRlbXAuY2FsbCIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLk5vZGUiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLk5vZGUuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIucmVuZGVyIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5wYXJzZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIucmVuZGVyUmVwZWF0IiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5kb21Ub1N0cmluZyIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIucmVwbCIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGUiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmV2YWx1YXRlVmFsdWUiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmV2YWx1YXRlVmFsdWVBbmRNb2RlbCIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVFeHByZXNzaW9uIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZUZ1bmN0aW9uIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5jb3B5Tm9kZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuaXNWb2lkIiwiaG8uY29tcG9uZW50cy5zdHlsZXIiLCJoby5jb21wb25lbnRzLnN0eWxlci5TdHlsZXIiLCJoby5jb21wb25lbnRzLnN0eWxlci5TdHlsZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLnN0eWxlci5TdHlsZXIuYXBwbHlTdHlsZSIsImhvLmNvbXBvbmVudHMuc3R5bGVyLlN0eWxlci5hcHBseVN0eWxlQmxvY2siLCJoby5jb21wb25lbnRzLnN0eWxlci5TdHlsZXIuYXBwbHlSdWxlIiwiaG8uY29tcG9uZW50cy5zdHlsZXIuU3R5bGVyLnBhcnNlU3R5bGUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQubmFtZSIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldE5hbWUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXRQYXJlbnQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5faW5pdCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC51cGRhdGUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5yZW5kZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0U3R5bGUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0SFRNTCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRQcm9wZXJ0aWVzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdENoaWxkcmVuIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdEF0dHJpYnV0ZXMiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5sb2FkUmVxdWlyZW1lbnRzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0Q29tcG9uZW50Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEVBQUUsQ0FrRFI7QUFsREQsV0FBTyxFQUFFO0lBQUNBLElBQUFBLFVBQVVBLENBa0RuQkE7SUFsRFNBLFdBQUFBLFVBQVVBO1FBQUNDLElBQUFBLGlCQUFpQkEsQ0FrRHJDQTtRQWxEb0JBLFdBQUFBLGlCQUFpQkEsRUFBQ0EsQ0FBQ0E7WUFDcENDLElBQU9BLE9BQU9BLEdBQUdBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBO1lBRXpCQSx5QkFBT0EsR0FBMkJBLEVBQUVBLENBQUNBO1lBRWhEQTtnQkFBQUM7b0JBRUlDLFdBQU1BLEdBQVlBLEtBQUtBLENBQUNBO2dCQXVDNUJBLENBQUNBO2dCQXJDR0QsbUNBQU9BLEdBQVBBLFVBQVFBLElBQVlBO29CQUNoQkUsRUFBRUEsQ0FBQUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ25CQSxJQUFJQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtvQkFDeENBLENBQUNBO29CQUVEQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFFakNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BO3dCQUNkQSxnQkFBY0EsSUFBSUEsWUFBU0E7d0JBQzNCQSxnQkFBY0EsSUFBSUEsUUFBS0EsQ0FBQ0E7Z0JBQ2hDQSxDQUFDQTtnQkFFREYsd0NBQVlBLEdB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Q0E7NEJBQ2xDQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQTs0QkFDQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7NEJBQzlCQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQTs0QkFDbkJBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO3dCQUNoQkEsQ0FBQ0E7d0JBQUNBLElBQUlBLENBQUNBLENBQUNBOzRCQUNQQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTs0QkFDbEJBLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUNBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUN2Q0EsT0FBT0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0E7NEJBQ1ZBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBOzRCQUMxQ0EsV0FBV0EsR0FBR0EsTUFBTUEsSUFBSUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0E7NEJBQ2xEQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTs0QkFFcENBLEVBQUVBLENBQUFBLENBQUNBLFdBQVdBLElBQUlBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dDQUMvQ0EsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0NBQ3BCQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtnQ0FFeENBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBOzRCQUNoQkEsQ0FBQ0E7d0JBQ0ZBLENBQUNBO3dCQUVEQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTt3QkFFM0RBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBOzRCQUNaQSxLQUFLQSxDQUFDQTt3QkFDUEEsQ0FBQ0E7d0JBQUNBLElBQUlBLENBQUNBLENBQUNBOzRCQUNQQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxXQUFXQSxFQUFFQSxXQUFXQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxFQUFFQSxFQUFFQSxFQUFDQSxDQUFDQSxDQUFDQTs0QkFFbElBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLE9BQU9BLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dDQUM3QkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQ3JFQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtnQ0FDbkJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO2dDQUNwQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FB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QUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1lBQ3BDQSxDQUFDQTs7WUFFRWQ7Ozs7Y0FJRUE7WUFFRkE7Ozs7O2NBS0VBO1lBRUtBLHNCQUFZQSxHQUFuQkEsVUFBb0JBLE9BQXlCQTtnQkFDekNlLE9BQU1BLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBO29CQUM3QkEsT0FBT0EsR0FBcUJBLE9BQU9BLENBQUNBLFVBQVVBLENBQUNBO2dCQUNoREEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDdkJBLENBQUNBO1lBSU1mLGlCQUFPQSxHQUFkQSxVQUFlQSxLQUF1Q0E7Z0JBQ2xERyxFQUFFQSxDQUFBQSxDQUFDQSxLQUFLQSxZQUFZQSxTQUFTQSxDQUFDQTtvQkFDMUJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN6REEsSUFBSUE7b0JBQ0FBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxDQUFDQTtZQUdMSCxnQkFBQ0E7UUFBREEsQ0EvTUF4RSxBQStNQ3dFLElBQUF4RTtRQS9NWUEsc0JBQVNBLFlBK01yQkEsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUFyT1NELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBcU9uQkE7QUFBREEsQ0FBQ0EsRUFyT00sRUFBRSxLQUFGLEVBQUUsUUFxT1IiLCJmaWxlIjoiY29tcG9uZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyIHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBsZXQgbWFwcGluZzoge1tuYW1lOnN0cmluZ106c3RyaW5nfSA9IHt9O1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHVzZU1pbjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGlmKGhvLmNvbXBvbmVudHMuZGlyKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lICs9ICcuJyArIG5hbWUuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3BsaXQoJy4nKS5qb2luKCcvJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VNaW4gP1xyXG4gICAgICAgICAgICAgICAgYGNvbXBvbmVudHMvJHtuYW1lfS5taW4uanNgIDpcclxuICAgICAgICAgICAgICAgIGBjb21wb25lbnRzLyR7bmFtZX0uanNgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8dHlwZW9mIENvbXBvbmVudCwgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx0eXBlb2YgQ29tcG9uZW50LCBhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzcmMgPSBtYXBwaW5nW25hbWVdIHx8IHRoaXMucmVzb2x2ZShuYW1lKTtcclxuICAgICAgICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0NvbXBvbmVudC5yZWdpc3Rlcih3aW5kb3dbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmdldChuYW1lKSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmdldChuYW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoYEVycm9yIHdoaWxlIGxvYWRpbmcgQ29tcG9uZW50ICR7bmFtZX1gKVxyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZXQobmFtZTogc3RyaW5nKTogdHlwZW9mIENvbXBvbmVudCB7XHJcbiAgICAgICAgICAgIGxldCBjOiBhbnkgPSB3aW5kb3c7XHJcbiAgICAgICAgICAgIG5hbWUuc3BsaXQoJy4nKS5mb3JFYWNoKChwYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjID0gY1twYXJ0XTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiA8dHlwZW9mIENvbXBvbmVudD5jO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnRQcm92aWRlcigpO1xyXG5cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby13YXRjaC9kaXN0L2QudHMvd2F0Y2guZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9wcm9taXNlLmQudHNcIi8+XG5cbm1vZHVsZSBoby5jb21wb25lbnRzIHtcblxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXHQvKipcblx0XHRCYXNlY2xhc3MgZm9yIEF0dHJpYnV0ZXMuXG5cdFx0VXNlZCBBdHRyaWJ1dGVzIG5lZWRzIHRvIGJlIHNwZWNpZmllZCBieSBDb21wb25lbnQjYXR0cmlidXRlcyBwcm9wZXJ0eSB0byBnZXQgbG9hZGVkIHByb3Blcmx5LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQXR0cmlidXRlIHtcblxuXHRcdHByb3RlY3RlZCBlbGVtZW50OiBIVE1MRWxlbWVudDtcblx0XHRwcm90ZWN0ZWQgY29tcG9uZW50OiBDb21wb25lbnQ7XG5cdFx0cHJvdGVjdGVkIHZhbHVlOiBzdHJpbmc7XG5cblx0XHRjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgdmFsdWU/OiBzdHJpbmcpIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cdFx0XHR0aGlzLmNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRDb21wb25lbnQoZWxlbWVudCk7XG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cblx0XHRcdHRoaXMuaW5pdCgpO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBpbml0KCk6IHZvaWQge31cblxuXHRcdGdldCBuYW1lKCkge1xuXHRcdFx0cmV0dXJuIEF0dHJpYnV0ZS5nZXROYW1lKHRoaXMpO1xuXHRcdH1cblxuXG5cdFx0cHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcblxuXHRcdH1cblxuXG5cdFx0c3RhdGljIGdldE5hbWUoY2xheno6IHR5cGVvZiBBdHRyaWJ1dGUgfCBBdHRyaWJ1dGUpOiBzdHJpbmcge1xuICAgICAgICAgICAgaWYoY2xhenogaW5zdGFuY2VvZiBBdHRyaWJ1dGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgICAgIH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBXYXRjaEF0dHJpYnV0ZSBleHRlbmRzIEF0dHJpYnV0ZSB7XG5cblx0XHRwcm90ZWN0ZWQgcjogUmVnRXhwID0gLyMoLis/KSMvZztcblxuXHRcdGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB2YWx1ZT86IHN0cmluZykge1xuXHRcdFx0c3VwZXIoZWxlbWVudCwgdmFsdWUpO1xuXG5cdFx0XHRsZXQgbTogYW55W10gPSB0aGlzLnZhbHVlLm1hdGNoKHRoaXMucikgfHwgW107XG5cdFx0XHRtLm1hcChmdW5jdGlvbih3KSB7XG5cdFx0XHRcdHcgPSB3LnN1YnN0cigxLCB3Lmxlbmd0aC0yKTtcblx0XHRcdFx0dGhpcy53YXRjaCh3KTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZS5yZXBsYWNlKC8jL2csICcnKTtcblx0XHR9XG5cblxuXHRcdHByb3RlY3RlZCB3YXRjaChwYXRoOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdGxldCBwYXRoQXJyID0gcGF0aC5zcGxpdCgnLicpO1xuXHRcdFx0bGV0IHByb3AgPSBwYXRoQXJyLnBvcCgpO1xuXHRcdFx0bGV0IG9iaiA9IHRoaXMuY29tcG9uZW50O1xuXG5cdFx0XHRwYXRoQXJyLm1hcCgocGFydCkgPT4ge1xuXHRcdFx0XHRvYmogPSBvYmpbcGFydF07XG5cdFx0XHR9KTtcblxuXHRcdFx0aG8ud2F0Y2gud2F0Y2gob2JqLCBwcm9wLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgZXZhbChwYXRoOiBzdHJpbmcpOiBhbnkge1xuXHRcdFx0bGV0IG1vZGVsID0gdGhpcy5jb21wb25lbnQ7XG5cdFx0XHRtb2RlbCA9IG5ldyBGdW5jdGlvbihPYmplY3Qua2V5cyhtb2RlbCkudG9TdHJpbmcoKSwgXCJyZXR1cm4gXCIgKyBwYXRoKVxuXHRcdFx0XHQuYXBwbHkobnVsbCwgT2JqZWN0LmtleXMobW9kZWwpLm1hcCgoaykgPT4ge3JldHVybiBtb2RlbFtrXX0pICk7XG5cdFx0XHRyZXR1cm4gbW9kZWw7XG5cdFx0fVxuXG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2F0dHJpYnV0ZS50c1wiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyIHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHVzZU1pbjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGlmKGhvLmNvbXBvbmVudHMuZGlyKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lICs9ICcuJyArIG5hbWUuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3BsaXQoJy4nKS5qb2luKCcvJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VNaW4gP1xyXG4gICAgICAgICAgICAgICAgYGF0dHJpYnV0ZXMvJHtuYW1lfS5taW4uanNgIDpcclxuICAgICAgICAgICAgICAgIGBhdHRyaWJ1dGVzLyR7bmFtZX0uanNgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0QXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IFByb21pc2U8dHlwZW9mIEF0dHJpYnV0ZSwgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx0eXBlb2YgQXR0cmlidXRlLCBhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzcmMgPSB0aGlzLnJlc29sdmUobmFtZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9Db21wb25lbnQucmVnaXN0ZXIod2luZG93W25hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2Ygd2luZG93W25hbWVdID09PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHdpbmRvd1tuYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoYEVycm9yIHdoaWxlIGxvYWRpbmcgQXR0cmlidXRlICR7bmFtZX1gKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgQXR0cmlidXRlUHJvdmlkZXIoKTtcclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vY29tcG9uZW50c3Byb3ZpZGVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9hdHRyaWJ1dGVwcm92aWRlci50c1wiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzLnJlZ2lzdHJ5IHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZWdpc3RyeSB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50czogQXJyYXk8dHlwZW9mIENvbXBvbmVudD4gPSBbXTtcclxuICAgICAgICBwcml2YXRlIGF0dHJpYnV0ZXM6IEFycmF5PHR5cGVvZiBBdHRyaWJ1dGU+ID0gW107XHJcblxyXG5cclxuICAgICAgICBwdWJsaWMgcmVnaXN0ZXIoY2E6IHR5cGVvZiBDb21wb25lbnQgfCB0eXBlb2YgQXR0cmlidXRlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmKGNhLnByb3RvdHlwZSBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goPHR5cGVvZiBDb21wb25lbnQ+Y2EpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChDb21wb25lbnQuZ2V0TmFtZSg8dHlwZW9mIENvbXBvbmVudD5jYSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoY2EucHJvdG90eXBlIGluc3RhbmNlb2YgQXR0cmlidXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXMucHVzaCg8dHlwZW9mIEF0dHJpYnV0ZT5jYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBydW4oKTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG4gICAgICAgICAgICBsZXQgaW5pdENvbXBvbmVudDogKGM6IHR5cGVvZiBDb21wb25lbnQpPT5Qcm9taXNlPGFueSwgYW55PiA9IHRoaXMuaW5pdENvbXBvbmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICBsZXQgcHJvbWlzZXM6IEFycmF5PFByb21pc2U8YW55LCBhbnk+PiA9IHRoaXMuY29tcG9uZW50cy5tYXAoKGMpPT57XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5pdENvbXBvbmVudChjKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluaXRDb21wb25lbnQoY29tcG9uZW50OiB0eXBlb2YgQ29tcG9uZW50LCBlbGVtZW50OkhUTUxFbGVtZW50fERvY3VtZW50PWRvY3VtZW50KTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG4gICAgICAgICAgICBsZXQgcHJvbWlzZXM6IEFycmF5PFByb21pc2U8YW55LCBhbnk+PiA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChDb21wb25lbnQuZ2V0TmFtZShjb21wb25lbnQpKSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGUpOiBQcm9taXNlPGFueSwgYW55PiB7XHJcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY29tcG9uZW50KGUpLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblx0XHRcdCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluaXRFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG4gICAgICAgICAgICBsZXQgaW5pdENvbXBvbmVudDogKGM6IHR5cGVvZiBDb21wb25lbnQsIGVsZW1lbnQ6IEhUTUxFbGVtZW50KT0+UHJvbWlzZTxhbnksIGFueT4gPSB0aGlzLmluaXRDb21wb25lbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgbGV0IHByb21pc2VzOiBBcnJheTxQcm9taXNlPGFueSwgYW55Pj4gPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMsXHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbml0Q29tcG9uZW50KGNvbXBvbmVudCwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5nZXROYW1lKGNvbXBvbmVudCkgPT09IG5hbWU7XHJcbiAgICAgICAgICAgICAgICB9KS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0F0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEF0dHJpYnV0ZS5nZXROYW1lKGF0dHJpYnV0ZSkgPT09IG5hbWU7XHJcbiAgICAgICAgICAgICAgICB9KS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB0eXBlb2YgQXR0cmlidXRlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBdHRyaWJ1dGUuZ2V0TmFtZShhdHRyaWJ1dGUpID09PSBuYW1lO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8dHlwZW9mIENvbXBvbmVudCwgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFBhcmVudE9mQ29tcG9uZW50KG5hbWUpXHJcbiAgICAgICAgICAgIC50aGVuKChwYXJlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHNlbGYuaGFzQ29tcG9uZW50KHBhcmVudCkgfHwgcGFyZW50ID09PSAnaG8uY29tcG9uZW50cy5Db21wb25lbnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gc2VsZi5sb2FkQ29tcG9uZW50KHBhcmVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChwYXJlbnRUeXBlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaG8uY29tcG9uZW50cy5jb21wb25lbnRwcm92aWRlci5pbnN0YW5jZS5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5yZWdpc3Rlcihjb21wb25lbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IFByb21pc2U8dHlwZW9mIEF0dHJpYnV0ZSwgc3RyaW5nPiB7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFBhcmVudE9mQXR0cmlidXRlKG5hbWUpXHJcbiAgICAgICAgICAgIC50aGVuKChwYXJlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHNlbGYuaGFzQXR0cmlidXRlKHBhcmVudCkgfHwgcGFyZW50ID09PSAnaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUnIHx8IHBhcmVudCA9PT0gJ2hvLmNvbXBvbmVudC5XYXRjaEF0dHJpYnV0ZScpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBzZWxmLmxvYWRBdHRyaWJ1dGUocGFyZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHBhcmVudFR5cGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLmluc3RhbmNlLmdldEF0dHJpYnV0ZShuYW1lKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHR5cGVvZiBBdHRyaWJ1dGUsIHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaG8uY29tcG9uZW50cy5hdHRyaWJ1dGVwcm92aWRlci5pbnN0YW5jZS5nZXRBdHRyaWJ1dGUobmFtZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShhdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAqL1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldFBhcmVudE9mQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nLCBhbnk+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50T2ZDbGFzcyhoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLmluc3RhbmNlLnJlc29sdmUobmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldFBhcmVudE9mQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nLCBhbnk+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50T2ZDbGFzcyhoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLmluc3RhbmNlLnJlc29sdmUobmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldFBhcmVudE9mQ2xhc3MocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcsIGFueT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICB4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZih4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih4bWxodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtID0gcmVzcC5tYXRjaCgvfVxcKVxcKCguKilcXCk7Lyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB4bWxodHRwLm9wZW4oJ0dFVCcsIHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgeG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVnaXN0cnkoKTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWdpc3RyeS50c1wiLz5cblxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xuXHRleHBvcnQgZnVuY3Rpb24gcnVuKCk6IGhvLnByb21pc2UuUHJvbWlzZTxhbnksIGFueT4ge1xuXHRcdHJldHVybiBoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLnJ1bigpO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyKGM6IHR5cGVvZiBDb21wb25lbnQgfCB0eXBlb2YgQXR0cmlidXRlKTogdm9pZCB7XG5cdFx0aG8uY29tcG9uZW50cy5yZWdpc3RyeS5pbnN0YW5jZS5yZWdpc3RlcihjKTtcblx0fVxuXG5cdGV4cG9ydCBsZXQgZGlyOiBib29sZWFuID0gZmFsc2U7XG59XG4iLCJtb2R1bGUgaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIge1xyXG4gICAgaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEh0bWxQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2FjaGU6IHtba2F5OnN0cmluZ106c3RyaW5nfSA9IHt9O1xyXG5cclxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGlmKGhvLmNvbXBvbmVudHMuZGlyKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lICs9ICcuJyArIG5hbWUuc3BsaXQoJy4nKS5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3BsaXQoJy4nKS5qb2luKCcvJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYGNvbXBvbmVudHMvJHtuYW1lfS5odG1sYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldEhUTUwobmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcsIHN0cmluZz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmNhY2hlW25hbWVdID09PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0aGlzLmNhY2hlW25hbWVdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5yZXNvbHZlKG5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICBcdFx0XHR4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXHRcdFx0XHRpZih4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCkge1xyXG4gICAgXHRcdFx0XHRcdGxldCByZXNwID0geG1saHR0cC5yZXNwb25zZVRleHQ7XHJcbiAgICBcdFx0XHRcdFx0aWYoeG1saHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3ApO1xyXG4gICAgXHRcdFx0XHRcdH0gZWxzZSB7XHJcbiAgICBcdFx0XHRcdFx0XHRyZWplY3QoYEVycm9yIHdoaWxlIGxvYWRpbmcgaHRtbCBmb3IgQ29tcG9uZW50ICR7bmFtZX1gKTtcclxuICAgIFx0XHRcdFx0XHR9XHJcbiAgICBcdFx0XHRcdH1cclxuICAgIFx0XHRcdH07XHJcblxyXG4gICAgXHRcdFx0eG1saHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZSA9IG5ldyBIdG1sUHJvdmlkZXIoKTtcclxuXHJcbn1cclxuIiwiXG5tb2R1bGUgaG8uY29tcG9uZW50cy50ZW1wIHtcblx0XHR2YXIgYzogbnVtYmVyID0gLTE7XG5cdFx0dmFyIGRhdGE6IGFueVtdID0gW107XG5cblx0XHRleHBvcnQgZnVuY3Rpb24gc2V0KGQ6IGFueSk6IG51bWJlciB7XG5cdFx0XHRjKys7XG5cdFx0XHRkYXRhW2NdID0gZDtcblx0XHRcdHJldHVybiBjO1xuXHRcdH1cblxuXHRcdGV4cG9ydCBmdW5jdGlvbiBnZXQoaTogbnVtYmVyKTogYW55IHtcblx0XHRcdHJldHVybiBkYXRhW2ldO1xuXHRcdH1cblxuXHRcdGV4cG9ydCBmdW5jdGlvbiBjYWxsKGk6IG51bWJlciwgLi4uYXJncyk6IHZvaWQge1xuXHRcdFx0ZGF0YVtpXSguLi5hcmdzKTtcblx0XHR9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWdpc3RyeS50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdGVtcFwiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzLnJlbmRlcmVyIHtcclxuICAgIGltcG9ydCBSZWdpc3RyeSA9IGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2U7XHJcblxyXG4gICAgaW50ZXJmYWNlIE5vZGVIdG1sIHtcclxuICAgICAgICByb290OiBOb2RlO1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBOb2RlIHtcclxuICAgICAgICBodG1sOiBzdHJpbmc7XHJcbiAgICAgICAgcGFyZW50OiBOb2RlO1xyXG4gICAgICAgIGNoaWxkcmVuOiBBcnJheTxOb2RlPiA9IFtdO1xyXG4gICAgICAgIHR5cGU6IHN0cmluZztcclxuICAgICAgICBzZWxmQ2xvc2luZzogYm9vbGVhbjtcclxuICAgICAgICBpc1ZvaWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcmVwZWF0OiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgcjogYW55ID0ge1xyXG5cdFx0XHR0YWc6IC88KFtePl0qPyg/Oig/OignfFwiKVteJ1wiXSo/XFwyKVtePl0qPykqKT4vLFxyXG5cdFx0XHRyZXBlYXQ6IC9yZXBlYXQ9W1wifCddLitbXCJ8J10vLFxyXG5cdFx0XHR0eXBlOiAvW1xcc3wvXSooLio/KVtcXHN8XFwvfD5dLyxcclxuXHRcdFx0dGV4dDogLyg/Oi58W1xcclxcbl0pKj9bXlwiJ1xcXFxdPC9tLFxyXG5cdFx0fTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkcyA9IFtcImFyZWFcIiwgXCJiYXNlXCIsIFwiYnJcIiwgXCJjb2xcIiwgXCJjb21tYW5kXCIsIFwiZW1iZWRcIiwgXCJoclwiLCBcImltZ1wiLCBcImlucHV0XCIsIFwia2V5Z2VuXCIsIFwibGlua1wiLCBcIm1ldGFcIiwgXCJwYXJhbVwiLCBcInNvdXJjZVwiLCBcInRyYWNrXCIsIFwid2JyXCJdO1xyXG5cclxuICAgICAgICBwcml2YXRlIGNhY2hlOiB7W2tleTpzdHJpbmddOk5vZGV9ID0ge307XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYodHlwZW9mIGNvbXBvbmVudC5odG1sID09PSAnYm9vbGVhbicgJiYgIWNvbXBvbmVudC5odG1sKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWUgPSBjb21wb25lbnQubmFtZTtcclxuICAgICAgICAgICAgbGV0IHJvb3QgPSB0aGlzLmNhY2hlW25hbWVdID0gdGhpcy5jYWNoZVtuYW1lXSB8fCB0aGlzLnBhcnNlKGNvbXBvbmVudC5odG1sKS5yb290O1xyXG4gICAgICAgICAgICByb290ID0gdGhpcy5yZW5kZXJSZXBlYXQodGhpcy5jb3B5Tm9kZShyb290KSwgY29tcG9uZW50KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBodG1sID0gdGhpcy5kb21Ub1N0cmluZyhyb290LCAtMSk7XHJcblxyXG4gICAgICAgICAgICBjb21wb25lbnQuZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuXHRcdHByaXZhdGUgcGFyc2UoaHRtbDogc3RyaW5nLCByb290PSBuZXcgTm9kZSgpKTogTm9kZUh0bWwge1xyXG5cclxuXHRcdFx0dmFyIG07XHJcblx0XHRcdHdoaWxlKChtID0gdGhpcy5yLnRhZy5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdHZhciB0YWcsIHR5cGUsIGNsb3NpbmcsIGlzVm9pZCwgc2VsZkNsb3NpbmcsIHJlcGVhdCwgdW5DbG9zZTtcclxuXHRcdFx0XHQvLy0tLS0tLS0gZm91bmQgc29tZSB0ZXh0IGJlZm9yZSBuZXh0IHRhZ1xyXG5cdFx0XHRcdGlmKG0uaW5kZXggIT09IDApIHtcclxuXHRcdFx0XHRcdHRhZyA9IGh0bWwubWF0Y2godGhpcy5yLnRleHQpWzBdO1xyXG5cdFx0XHRcdFx0dGFnID0gdGFnLnN1YnN0cigwLCB0YWcubGVuZ3RoLTEpO1xyXG5cdFx0XHRcdFx0dHlwZSA9ICdURVhUJztcclxuICAgICAgICAgICAgICAgICAgICBpc1ZvaWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHRcdHJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0YWcgPSBtWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdHR5cGUgPSAodGFnKyc+JykubWF0Y2godGhpcy5yLnR5cGUpWzFdO1xyXG5cdFx0XHRcdFx0Y2xvc2luZyA9IHRhZ1swXSA9PT0gJy8nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzVm9pZCA9IHRoaXMuaXNWb2lkKHR5cGUpO1xyXG5cdFx0XHRcdFx0c2VsZkNsb3NpbmcgPSBpc1ZvaWQgfHwgdGFnW3RhZy5sZW5ndGgtMV0gPT09ICcvJztcclxuXHRcdFx0XHRcdHJlcGVhdCA9ICEhdGFnLm1hdGNoKHRoaXMuci5yZXBlYXQpO1xyXG5cclxuXHRcdFx0XHRcdGlmKHNlbGZDbG9zaW5nICYmIFJlZ2lzdHJ5Lmhhc0NvbXBvbmVudCh0eXBlKSkge1xyXG5cdFx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR0YWcgPSB0YWcuc3Vic3RyKDAsIHRhZy5sZW5ndGgtMSkgKyBcIiBcIjtcclxuXHJcblx0XHRcdFx0XHRcdHVuQ2xvc2UgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aHRtbCA9IGh0bWwuc2xpY2UodGFnLmxlbmd0aCArICh0eXBlID09PSAnVEVYVCcgPyAwIDogMikgKTtcclxuXHJcblx0XHRcdFx0aWYoY2xvc2luZykge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucHVzaCh7cGFyZW50OiByb290LCBodG1sOiB0YWcsIHR5cGU6IHR5cGUsIGlzVm9pZDogaXNWb2lkLCBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsIHJlcGVhdDogcmVwZWF0LCBjaGlsZHJlbjogW119KTtcclxuXHJcblx0XHRcdFx0XHRpZighdW5DbG9zZSAmJiAhc2VsZkNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2UoaHRtbCwgcm9vdC5jaGlsZHJlbltyb290LmNoaWxkcmVuLmxlbmd0aC0xXSk7XHJcblx0XHRcdFx0XHRcdGh0bWwgPSByZXN1bHQuaHRtbDtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wb3AoKTtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHJlc3VsdC5yb290KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG0gPSBodG1sLm1hdGNoKHRoaXMuci50YWcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge3Jvb3Q6IHJvb3QsIGh0bWw6IGh0bWx9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgcmVuZGVyUmVwZWF0KHJvb3QsIG1vZGVscyk6IE5vZGUge1xyXG5cdFx0XHRtb2RlbHMgPSBbXS5jb25jYXQobW9kZWxzKTtcclxuXHJcblx0XHRcdGZvcih2YXIgYyA9IDA7IGMgPCByb290LmNoaWxkcmVuLmxlbmd0aDsgYysrKSB7XHJcblx0XHRcdFx0dmFyIGNoaWxkID0gcm9vdC5jaGlsZHJlbltjXTtcclxuXHRcdFx0XHRpZihjaGlsZC5yZXBlYXQpIHtcclxuXHRcdFx0XHRcdHZhciByZWdleCA9IC9yZXBlYXQ9W1wifCddXFxzKihcXFMrKVxccythc1xccysoXFxTKz8pW1wifCddLztcclxuXHRcdFx0XHRcdHZhciBtID0gY2hpbGQuaHRtbC5tYXRjaChyZWdleCkuc2xpY2UoMSk7XHJcblx0XHRcdFx0XHR2YXIgbmFtZSA9IG1bMV07XHJcblx0XHRcdFx0XHR2YXIgaW5kZXhOYW1lO1xyXG5cdFx0XHRcdFx0aWYobmFtZS5pbmRleE9mKCcsJykgPiAtMSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KCcsJyk7XHJcblx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lc1swXS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGluZGV4TmFtZSA9IG5hbWVzWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR2YXIgbW9kZWwgPSB0aGlzLmV2YWx1YXRlKG1vZGVscywgbVswXSk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGhvbGRlciA9IFtdO1xyXG5cdFx0XHRcdFx0bW9kZWwuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG1vZGVsMiA9IHt9O1xyXG5cdFx0XHRcdFx0XHRtb2RlbDJbbmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0bW9kZWwyW2luZGV4TmFtZV0gPSBpbmRleDtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBtb2RlbHMyID0gW10uY29uY2F0KG1vZGVscyk7XHJcblx0XHRcdFx0XHRcdG1vZGVsczIudW5zaGlmdChtb2RlbDIpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLmNvcHlOb2RlKGNoaWxkKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0bm9kZS5odG1sID0gbm9kZS5odG1sLnJlcGxhY2UodGhpcy5yLnJlcGVhdCwgJycpO1xyXG5cdFx0XHRcdFx0XHRub2RlLmh0bWwgPSB0aGlzLnJlcGwobm9kZS5odG1sLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdG5vZGUgPSB0aGlzLnJlbmRlclJlcGVhdChub2RlLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vcm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMCwgbm9kZSk7XHJcblx0XHRcdFx0XHRcdGhvbGRlci5wdXNoKG5vZGUpO1xyXG5cdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRcdFx0XHRob2xkZXIuZm9yRWFjaChmdW5jdGlvbihuKSB7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDAsIG4pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAxKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2hpbGQuaHRtbCA9IHRoaXMucmVwbChjaGlsZC5odG1sLCBtb2RlbHMpO1xyXG5cdFx0XHRcdFx0Y2hpbGQgPSB0aGlzLnJlbmRlclJlcGVhdChjaGlsZCwgbW9kZWxzKTtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW5bY10gPSBjaGlsZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByb290O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZG9tVG9TdHJpbmcocm9vdDogTm9kZSwgaW5kZW50OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0XHRpbmRlbnQgPSBpbmRlbnQgfHwgMDtcclxuXHRcdFx0dmFyIGh0bWwgPSAnJztcclxuICAgICAgICAgICAgY29uc3QgdGFiOiBhbnkgPSAnXFx0JztcclxuXHJcblx0XHRcdGlmKHJvb3QuaHRtbCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gbmV3IEFycmF5KGluZGVudCkuam9pbih0YWIpOyAvL3RhYi5yZXBlYXQoaW5kZW50KTs7XHJcblx0XHRcdFx0aWYocm9vdC50eXBlICE9PSAnVEVYVCcpIHtcclxuXHRcdFx0XHRcdC8vaWYocm9vdC5zZWxmQ2xvc2luZyAmJiAhcm9vdC5pc1ZvaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgaHRtbCArPSAnPCcgKyByb290Lmh0bWwgKyAnLz4nO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8JyArIHJvb3QuaHRtbCArICc+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0XHRlbHNlIGh0bWwgKz0gcm9vdC5odG1sO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihodG1sKVxyXG5cdFx0XHRcdGh0bWwgKz0gJ1xcbic7XHJcblxyXG5cdFx0XHRpZihyb290LmNoaWxkcmVuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gcm9vdC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9tVG9TdHJpbmcoYywgaW5kZW50Kyhyb290LnR5cGUgPyAxIDogMikpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzKSkuam9pbignXFxuJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHJvb3QudHlwZSAmJiByb290LnR5cGUgIT09ICdURVhUJyAmJiAhcm9vdC5zZWxmQ2xvc2luZykge1xyXG5cdFx0XHRcdGh0bWwgKz0gbmV3IEFycmF5KGluZGVudCkuam9pbih0YWIpOyAvL3RhYi5yZXBlYXQoaW5kZW50KTtcclxuXHRcdFx0XHRodG1sICs9ICc8Lycrcm9vdC50eXBlKyc+XFxuJztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGh0bWw7XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVwbChzdHI6IHN0cmluZywgbW9kZWxzOiBhbnlbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHZhciByZWdleEcgPSAveyguKz8pfX0/L2c7XHJcblxyXG4gICAgICAgICAgICB2YXIgbSA9IHN0ci5tYXRjaChyZWdleEcpO1xyXG4gICAgICAgICAgICBpZighbSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblxyXG4gICAgICAgICAgICB3aGlsZShtLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBtWzBdO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKDEsIHBhdGgubGVuZ3RoLTIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZXZhbHVhdGUobW9kZWxzLCBwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gXCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXRDb21wb25lbnQodGhpcykuXCIrcGF0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobVswXSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG0gPSBtLnNsaWNlKDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZShtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgICAgICBpZihwYXRoWzBdID09PSAneycgJiYgcGF0aFstLXBhdGgubGVuZ3RoXSA9PT0gJ30nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVscywgcGF0aC5zdWJzdHIoMSwgcGF0aC5sZW5ndGgtMikpXHJcbiAgICAgICAgICAgIGVsc2UgaWYocGF0aFswXSA9PT0gJyMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVGdW5jdGlvbihtb2RlbHMsIHBhdGguc3Vic3RyKDEpKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVWYWx1ZShtb2RlbHMsIHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZVZhbHVlKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHMsIHBhdGgpLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcblx0XHRwcml2YXRlIGV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiB7dmFsdWU6IGFueSwgbW9kZWw6IGFueX0ge1xyXG5cdFx0XHRpZihtb2RlbHMuaW5kZXhPZih3aW5kb3cpID09IC0xKVxyXG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2god2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKFwibW9kZWxcIiwgXCJyZXR1cm4gbW9kZWxbJ1wiICsgcGF0aC5zcGxpdChcIi5cIikuam9pbihcIiddWydcIikgKyBcIiddXCIpKG1vZGVsKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcInZhbHVlXCI6IG1vZGVsLCBcIm1vZGVsXCI6IG1vZGVsc1stLW1pXX07XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcblx0XHRcdGlmKG1vZGVscy5pbmRleE9mKHdpbmRvdykgPT0gLTEpXHJcbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaCh3aW5kb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1pID0gMDtcclxuXHRcdFx0dmFyIG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHR3aGlsZShtaSA8IG1vZGVscy5sZW5ndGggJiYgbW9kZWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG1vZGVsID0gbW9kZWxzW21pXTtcclxuXHRcdFx0XHR0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aChtb2RlbCkgbW9kZWwgPSBldmFsKHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsID0gbmV3IEZ1bmN0aW9uKE9iamVjdC5rZXlzKG1vZGVsKS50b1N0cmluZygpLCBcInJldHVybiBcIiArIHBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBseShudWxsLCBPYmplY3Qua2V5cyhtb2RlbCkubWFwKChrKSA9PiB7cmV0dXJuIG1vZGVsW2tdfSkgKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1vZGVsO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlRnVuY3Rpb24obW9kZWxzOiBhbnlbXSwgcGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICAgICAgbGV0IGV4cCA9IHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uLmJpbmQodGhpcywgbW9kZWxzKTtcclxuXHRcdFx0dmFyIFtuYW1lLCBhcmdzXSA9IHBhdGguc3BsaXQoJygnKTtcclxuICAgICAgICAgICAgYXJncyA9IGFyZ3Muc3Vic3RyKDAsIC0tYXJncy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHt2YWx1ZSwgbW9kZWx9ID0gdGhpcy5ldmFsdWF0ZVZhbHVlQW5kTW9kZWwobW9kZWxzLCBuYW1lKTtcclxuICAgICAgICAgICAgbGV0IGZ1bmM6IEZ1bmN0aW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGxldCBhcmdBcnI6IHN0cmluZ1tdID0gYXJncy5zcGxpdCgnLicpLm1hcCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnLmluZGV4T2YoJyMnKSA9PT0gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnLnN1YnN0cigxKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwKGFyZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuYyA9IGZ1bmMuYmluZChtb2RlbCwgLi4uYXJnQXJyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhvLmNvbXBvbmVudHMudGVtcC5zZXQoZnVuYyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RyID0gYGhvLmNvbXBvbmVudHMudGVtcC5jYWxsKCR7aW5kZXh9KWA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBjb3B5Tm9kZShub2RlOiBOb2RlKTogTm9kZSB7XHJcblx0XHRcdHZhciBjb3B5Tm9kZSA9IHRoaXMuY29weU5vZGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBuID0gPE5vZGU+e1xyXG5cdFx0XHRcdHBhcmVudDogbm9kZS5wYXJlbnQsXHJcblx0XHRcdFx0aHRtbDogbm9kZS5odG1sLFxyXG5cdFx0XHRcdHR5cGU6IG5vZGUudHlwZSxcclxuXHRcdFx0XHRzZWxmQ2xvc2luZzogbm9kZS5zZWxmQ2xvc2luZyxcclxuXHRcdFx0XHRyZXBlYXQ6IG5vZGUucmVwZWF0LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBub2RlLmNoaWxkcmVuLm1hcChjb3B5Tm9kZSlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHJldHVybiBuO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGlzVm9pZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudm9pZHMuaW5kZXhPZihuYW1lLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVuZGVyZXIoKTtcclxuXHJcbn1cclxuIiwibW9kdWxlIGhvLmNvbXBvbmVudHMuc3R5bGVyIHtcblxuXHRleHBvcnQgaW50ZXJmYWNlIElTdHlsZXIge1xuXHRcdGFwcGx5U3R5bGUoY29tcG9uZW50OiBDb21wb25lbnQsIGNzcz86IHN0cmluZyk6IHZvaWRcblx0fVxuXG5cdGludGVyZmFjZSBTdHlsZUJsb2NrIHtcblx0XHRzZWxlY3Rvcjogc3RyaW5nO1xuXHRcdHJ1bGVzOiBBcnJheTxTdHlsZVJ1bGU+O1xuXHR9XG5cblx0aW50ZXJmYWNlIFN0eWxlUnVsZSB7XG5cdFx0cHJvcGVydHk6IHN0cmluZztcblx0XHR2YWx1ZTogc3RyaW5nO1xuXHR9XG5cblx0Y2xhc3MgU3R5bGVyIGltcGxlbWVudHMgSVN0eWxlciB7XG5cdFx0cHVibGljIGFwcGx5U3R5bGUoY29tcG9uZW50OiBDb21wb25lbnQsIGNzcyA9IGNvbXBvbmVudC5zdHlsZSk6IHZvaWQge1xuXHRcdFx0bGV0IHN0eWxlID0gdGhpcy5wYXJzZVN0eWxlKGNvbXBvbmVudC5zdHlsZSk7XG5cdFx0XHRzdHlsZS5mb3JFYWNoKHMgPT4ge1xuXHRcdFx0XHR0aGlzLmFwcGx5U3R5bGVCbG9jayhjb21wb25lbnQsIHMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGFwcGx5U3R5bGVCbG9jayhjb21wb25lbnQ6IENvbXBvbmVudCwgc3R5bGU6IFN0eWxlQmxvY2spOiB2b2lkIHtcblx0XHRcdGlmKHN0eWxlLnNlbGVjdG9yLnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSAndGhpcycpIHtcblx0XHRcdFx0c3R5bGUucnVsZXMuZm9yRWFjaChyID0+IHtcblx0XHRcdFx0XHR0aGlzLmFwcGx5UnVsZShjb21wb25lbnQuZWxlbWVudCwgcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoY29tcG9uZW50LmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzdHlsZS5zZWxlY3RvciksIGVsID0+IHtcblx0XHRcdFx0XHRzdHlsZS5ydWxlcy5mb3JFYWNoKHIgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5hcHBseVJ1bGUoZWwsIHIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgYXBwbHlSdWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBydWxlOiBTdHlsZVJ1bGUpOiB2b2lkIHtcblx0XHRcdGxldCBwcm9wID0gcnVsZS5wcm9wZXJ0eS5yZXBsYWNlKC8tKFxcdykvZywgKF8sIGxldHRlcjogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcblx0XHRcdH0pLnRyaW0oKTtcblx0XHRcdGVsZW1lbnQuc3R5bGVbcHJvcF0gPSBydWxlLnZhbHVlO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBwYXJzZVN0eWxlKGNzczogc3RyaW5nKTogQXJyYXk8U3R5bGVCbG9jaz4ge1xuXHRcdFx0bGV0IHIgPSAvKC4rPylcXHMqeyguKj8pfS9nbTtcblx0XHRcdGxldCByMiA9IC8oLis/KVxccz86KC4rPyk7L2dtO1xuXHRcdFx0Y3NzID0gY3NzLnJlcGxhY2UoL1xcbi9nLCAnJyk7XG5cdFx0XHRsZXQgYmxvY2tzOiBTdHlsZUJsb2NrW10gPSAoPHN0cmluZ1tdPmNzcy5tYXRjaChyKSB8fCBbXSlcblx0XHRcdFx0Lm1hcChiID0+IHtcblx0XHRcdFx0XHRpZighYi5tYXRjaChyKSlcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0XHRcdFx0bGV0IFtfLCBzZWxlY3RvciwgX3J1bGVzXSA9IHIuZXhlYyhiKTtcblx0XHRcdFx0XHRsZXQgcnVsZXM6IFN0eWxlUnVsZVtdID0gKDxzdHJpbmdbXT5fcnVsZXMubWF0Y2gocjIpIHx8IFtdKVxuXHRcdFx0XHRcdFx0Lm1hcChyID0+IHtcblx0XHRcdFx0XHRcdFx0aWYoIXIubWF0Y2gocjIpKVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBbXywgcHJvcGVydHksIHZhbHVlXSA9IHIyLmV4ZWMocik7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7cHJvcGVydHksIHZhbHVlfTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuZmlsdGVyKHIgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gciAhPT0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiB7c2VsZWN0b3IsIHJ1bGVzfTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbHRlcihiID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gYiAhPT0gbnVsbDtcblx0XHRcdFx0fSk7XG5cblxuXHRcdFx0cmV0dXJuIGJsb2Nrcztcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgbGV0IGluc3RhbmNlOiBJU3R5bGVyID0gbmV3IFN0eWxlcigpO1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbWFpblwiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVnaXN0cnlcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2h0bWxwcm92aWRlci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVuZGVyZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2F0dHJpYnV0ZS50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3R5bGVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby1wcm9taXNlL2Rpc3QvcHJvbWlzZS5kLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xyXG5cclxuICAgIGltcG9ydCBSZWdpc3RyeSA9IGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2U7XHJcbiAgICBpbXBvcnQgSHRtbFByb3ZpZGVyID0gaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIuaW5zdGFuY2U7XHJcbiAgICBpbXBvcnQgUmVuZGVyZXIgPSBoby5jb21wb25lbnRzLnJlbmRlcmVyLmluc3RhbmNlO1xyXG4gICAgaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGNvbXBvbmVudD86IENvbXBvbmVudDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElQcm9wcmV0eSB7XHJcbiAgICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcclxuICAgICAgICBkZWZhdWx0PzogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAgIEJhc2VjbGFzcyBmb3IgQ29tcG9uZW50c1xyXG4gICAgICAgIGltcG9ydGFudDogZG8gaW5pdGlhbGl6YXRpb24gd29yayBpbiBDb21wb25lbnQjaW5pdFxyXG4gICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBlbGVtZW50OiBDb21wb25lbnRFbGVtZW50O1xyXG4gICAgICAgIHB1YmxpYyBvcmlnaW5hbF9pbm5lckhUTUw6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgaHRtbDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgcHVibGljIHN0eWxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICBwdWJsaWMgcHJvcGVydGllczogQXJyYXk8c3RyaW5nfElQcm9wcmV0eT4gPSBbXTtcclxuICAgICAgICBwdWJsaWMgYXR0cmlidXRlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIHB1YmxpYyByZXF1aXJlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIHB1YmxpYyBjaGlsZHJlbjoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8tLS0tLS0tIGluaXQgRWxlbWVuZXQgYW5kIEVsZW1lbnRzJyBvcmlnaW5hbCBpbm5lckhUTUxcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNvbXBvbmVudCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxfaW5uZXJIVE1MID0gZWxlbWVudC5pbm5lckhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IG5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5nZXROYW1lKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQYXJlbnQoKTogQ29tcG9uZW50IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5nZXRDb21wb25lbnQoPENvbXBvbmVudEVsZW1lbnQ+dGhpcy5lbGVtZW50LnBhcmVudE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIF9pbml0KCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuICAgICAgICAgICAgbGV0IHJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLS0gaW5pdCBQcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vLS0tLS0tLSBjYWxsIGluaXQoKSAmIGxvYWRSZXF1aXJlbWVudHMoKSAtPiB0aGVuIHJlbmRlclxyXG4gICAgICAgICAgICBsZXQgcmVhZHkgPSBbdGhpcy5pbml0SFRNTCgpLCBQcm9taXNlLmNyZWF0ZSh0aGlzLmluaXQoKSksIHRoaXMubG9hZFJlcXVpcmVtZW50cygpXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwID0gbmV3IFByb21pc2U8YW55LCBhbnk+KCk7XHJcblxyXG4gICAgICAgICAgICBQcm9taXNlLmFsbChyZWFkeSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHAucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgICAgTWV0aG9kIHRoYXQgZ2V0IGNhbGxlZCBhZnRlciBpbml0aWFsaXphdGlvbiBvZiBhIG5ldyBpbnN0YW5jZS5cclxuICAgICAgICAgICAgRG8gaW5pdC13b3JrIGhlcmUuXHJcbiAgICAgICAgICAgIE1heSByZXR1cm4gYSBQcm9taXNlLlxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGluaXQoKTogYW55IHt9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7cmV0dXJuIHZvaWQgMDt9XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XHJcbiAgICBcdFx0UmVuZGVyZXIucmVuZGVyKHRoaXMpO1xyXG5cclxuICAgIFx0XHRSZWdpc3RyeS5pbml0RWxlbWVudCh0aGlzLmVsZW1lbnQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENoaWxkcmVuKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0U3R5bGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRBdHRyaWJ1dGVzKCk7XHJcblxyXG4gICAgXHRcdFx0dGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdFN0eWxlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5zdHlsZSA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3R5bGUgPT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLnN0eWxlID09PSAnc3RyaW5nJyAmJiB0aGlzLnN0eWxlLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHN0eWxlci5pbnN0YW5jZS5hcHBseVN0eWxlKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiAgQXNzdXJlIHRoYXQgdGhpcyBpbnN0YW5jZSBoYXMgYW4gdmFsaWQgaHRtbCBhdHRyaWJ1dGUgYW5kIGlmIG5vdCBsb2FkIGFuZCBzZXQgaXQuXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGluaXRIVE1MKCk6IFByb21pc2U8YW55LGFueT4ge1xyXG4gICAgICAgICAgICBsZXQgcCA9IG5ldyBQcm9taXNlKCk7XHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmh0bWwgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgIHAucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5odG1sLmluZGV4T2YoXCIuaHRtbFwiLCB0aGlzLmh0bWwubGVuZ3RoIC0gXCIuaHRtbFwiLmxlbmd0aCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgSHRtbFByb3ZpZGVyLmdldEhUTUwodGhpcy5uYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaHRtbCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHAucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKHAucmVqZWN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0UHJvcGVydGllcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHByb3AgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3AubmFtZV0gPSB0aGlzLmVsZW1lbnRbcHJvcC5uYW1lXSB8fCB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKHByb3AubmFtZSkgfHwgcHJvcC5kZWZhdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMucHJvcGVydGllc1twcm9wLm5hbWVdID09PSB1bmRlZmluZWQgJiYgcHJvcC5yZXF1aXJlZCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYFByb3BlcnR5ICR7cHJvcC5uYW1lfSBpcyByZXF1aXJlZCBidXQgbm90IHByb3ZpZGVkYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcGVydGllc1twcm9wXSA9IHRoaXMuZWxlbWVudFtwcm9wXSB8fCB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKHByb3ApO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0Q2hpbGRyZW4oKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnKicpO1xyXG4gICAgXHRcdGZvcihsZXQgYyA9IDA7IGMgPCBjaGlsZHMubGVuZ3RoOyBjKyspIHtcclxuICAgIFx0XHRcdGxldCBjaGlsZCA9IGNoaWxkc1tjXTtcclxuICAgIFx0XHRcdGlmKGNoaWxkLmlkKSB7XHJcbiAgICBcdFx0XHRcdHRoaXMuY2hpbGRyZW5bY2hpbGQuaWRdID0gY2hpbGQ7XHJcbiAgICBcdFx0XHR9XHJcbiAgICBcdFx0XHRpZihjaGlsZC50YWdOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5bY2hpbGQudGFnTmFtZV0gPSB0aGlzLmNoaWxkcmVuW2NoaWxkLnRhZ05hbWVdIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgKDxFbGVtZW50W10+dGhpcy5jaGlsZHJlbltjaGlsZC50YWdOYW1lXSkucHVzaChjaGlsZCk7XHJcbiAgICBcdFx0fVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0QXR0cmlidXRlcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXR0ciA9IFJlZ2lzdHJ5LmdldEF0dHJpYnV0ZShhKTtcclxuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYCpbJHthfV1gKSwgKGU6IEhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbCA9IGUuaGFzT3duUHJvcGVydHkoYSkgPyBlW2FdIDogZS5nZXRBdHRyaWJ1dGUoYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiYgdmFsID09PSAnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBhdHRyKGUsIHZhbCkudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGxvYWRSZXF1aXJlbWVudHMoKSB7XHJcbiAgICBcdFx0bGV0IGNvbXBvbmVudHM6IGFueVtdID0gdGhpcy5yZXF1aXJlc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhUmVnaXN0cnkuaGFzQ29tcG9uZW50KHJlcSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5tYXAoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZ2lzdHJ5LmxvYWRDb21wb25lbnQocmVxKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgbGV0IGF0dHJpYnV0ZXM6IGFueVtdID0gdGhpcy5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICFSZWdpc3RyeS5oYXNBdHRyaWJ1dGUocmVxKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm1hcCgocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVnaXN0cnkubG9hZEF0dHJpYnV0ZShyZXEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICBsZXQgcHJvbWlzZXMgPSBjb21wb25lbnRzLmNvbmNhdChhdHRyaWJ1dGVzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgc3RhdGljIHJlZ2lzdGVyKGM6IHR5cGVvZiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVnaXN0cnkucmVnaXN0ZXIoYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICovXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgc3RhdGljIHJ1bihvcHQ/OiBhbnkpIHtcclxuICAgICAgICAgICAgUmVnaXN0cnkuc2V0T3B0aW9ucyhvcHQpO1xyXG4gICAgICAgICAgICBSZWdpc3RyeS5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgc3RhdGljIGdldENvbXBvbmVudChlbGVtZW50OiBDb21wb25lbnRFbGVtZW50KTogQ29tcG9uZW50IHtcclxuICAgICAgICAgICAgd2hpbGUoIWVsZW1lbnQuY29tcG9uZW50KVxyXG4gICAgXHRcdFx0ZWxlbWVudCA9IDxDb21wb25lbnRFbGVtZW50PmVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgIFx0XHRyZXR1cm4gZWxlbWVudC5jb21wb25lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgZ2V0TmFtZShjbGF6ejogdHlwZW9mIENvbXBvbmVudCk6IHN0cmluZztcclxuICAgICAgICBzdGF0aWMgZ2V0TmFtZShjbGF6ejogQ29tcG9uZW50KTogc3RyaW5nO1xyXG4gICAgICAgIHN0YXRpYyBnZXROYW1lKGNsYXp6OiAodHlwZW9mIENvbXBvbmVudCkgfCAoQ29tcG9uZW50KSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGlmKGNsYXp6IGluc3RhbmNlb2YgQ29tcG9uZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBjbGF6ei50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==