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

var ho;
(function (ho) {
    var components;
    (function (components) {
        var renderer;
        (function (renderer) {
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
                            if (selfClosing && ho.components.registry.instance.hasComponent(type)) {
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
                            if (root.selfClosing && !root.isVoid) {
                                html += '<' + root.html.substr(0, --root.html.length) + '>';
                                html += '</' + root.type + '>\n';
                            }
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

var ho;
(function (ho) {
    var components;
    (function (components_1) {
        var Promise = ho.promise.Promise;
        var HtmlProvider = ho.components.htmlprovider.instance;
        var Renderer = ho.components.renderer.instance;
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
                ho.components.registry.instance.initElement(this.element)
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
                    var attr = ho.components.registry.instance.getAttribute(a);
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
                    return !ho.components.registry.instance.hasComponent(req);
                })
                    .map(function (req) {
                    return ho.components.registry.instance.loadComponent(req);
                });
                var attributes = this.attributes
                    .filter(function (req) {
                    return !ho.components.registry.instance.hasAttribute(req);
                })
                    .map(function (req) {
                    return ho.components.registry.instance.loadAttribute(req);
                });
                var promises = components.concat(attributes);
                return Promise.all(promises);
            };
            ;
            /*
            static register(c: typeof Component): void {
                ho.components.registry.instance.register(c);
            }
            */
            /*
            static run(opt?: any) {
                ho.components.registry.instance.setOptions(opt);
                ho.components.registry.instance.run();
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
                    this.componentLoader = new ho.classloader.ClassLoader({
                        urlTemplate: 'components/${name}.js',
                        useDir: true
                    });
                    this.attributeLoader = new ho.classloader.ClassLoader({
                        urlTemplate: 'attributes/${name}.js',
                        useDir: true
                    });
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
                    return this.componentLoader.load({
                        name: name,
                        super: ["ho.components.Component"]
                    })
                        .then(function (classes) {
                        classes.map(function (c) {
                            self.register(c);
                        });
                        return classes.pop();
                    });
                    /*
                    let self = this;
        
                    return this.getParentOfComponent(name)
                    .then((parent) => {
                        if(self.hasComponent(parent) || parent === 'ho.components.Component')
                            return true;
                        else return self.loadComponent(parent);
                    })
                    .then((parentType) => {
                        return ho.components.componentprovider.instance.getComponent(name)
                    })
                    .then((component) => {
                        self.register(component);
                        return component;
                    });
                    //return this.options.componentProvider.getComponent(name)
                    */
                };
                Registry.prototype.loadAttribute = function (name) {
                    var self = this;
                    return this.attributeLoader.load({
                        name: name,
                        super: ["ho.components.Attribute", "ho.components.WatchAttribute"]
                    })
                        .then(function (classes) {
                        classes.map(function (c) {
                            self.register(c);
                        });
                        return classes.pop();
                    });
                    /*
                    let self = this;
        
                    return this.getParentOfAttribute(name)
                    .then((parent) => {
                        if(self.hasAttribute(parent) || parent === 'ho.components.Attribute' || parent === 'ho.components.WatchAttribute')
                            return true;
                        else return self.loadAttribute(parent);
                    })
                    .then((parentType) => {
                        return ho.components.attributeprovider.instance.getAttribute(name)
                    })
                    .then((attribute) => {
                        self.register(attribute);
                        return attribute;
                    });
                    */
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
                return Registry;
            })();
            registry.Registry = Registry;
            registry.instance = new Registry();
        })(registry = components.registry || (components.registry = {}));
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));

/// <reference path="../../../bower_components/ho-promise/dist/promise.d.ts"/>
/// <reference path="../../../bower_components/ho-classloader/dist/classloader.d.ts"/>
/// <reference path="../../../bower_components/ho-watch/dist/watch.d.ts"/>
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9oby9jb21wb25lbnRzL3RlbXAvdGVtcC50cyIsInNyYy9oby9jb21wb25lbnRzL3N0eWxlci9zdHlsZXIudHMiLCJzcmMvaG8vY29tcG9uZW50cy9yZW5kZXJlci9yZW5kZXJlci50cyIsInNyYy9oby9jb21wb25lbnRzL2h0bWxwcm92aWRlci9odG1scHJvdmlkZXIudHMiLCJzcmMvaG8vY29tcG9uZW50cy9hdHRyaWJ1dGUudHMiLCJzcmMvaG8vY29tcG9uZW50cy9jb21wb25lbnQudHMiLCJzcmMvaG8vY29tcG9uZW50cy9yZWdpc3RyeS9yZWdpc3RyeS50cyIsInNyYy9oby9jb21wb25lbnRzL2NvbXBvbmVudHMudHMiXSwibmFtZXMiOlsiaG8iLCJoby5jb21wb25lbnRzIiwiaG8uY29tcG9uZW50cy50ZW1wIiwiaG8uY29tcG9uZW50cy50ZW1wLnNldCIsImhvLmNvbXBvbmVudHMudGVtcC5nZXQiLCJoby5jb21wb25lbnRzLnRlbXAuY2FsbCIsImhvLmNvbXBvbmVudHMuc3R5bGVyIiwiaG8uY29tcG9uZW50cy5zdHlsZXIuU3R5bGVyIiwiaG8uY29tcG9uZW50cy5zdHlsZXIuU3R5bGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5zdHlsZXIuU3R5bGVyLmFwcGx5U3R5bGUiLCJoby5jb21wb25lbnRzLnN0eWxlci5TdHlsZXIuYXBwbHlTdHlsZUJsb2NrIiwiaG8uY29tcG9uZW50cy5zdHlsZXIuU3R5bGVyLmFwcGx5UnVsZSIsImhvLmNvbXBvbmVudHMuc3R5bGVyLlN0eWxlci5wYXJzZVN0eWxlIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuTm9kZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuTm9kZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZW5kZXIiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLnBhcnNlIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZW5kZXJSZXBlYXQiLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmRvbVRvU3RyaW5nIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5yZXBsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZSIsImhvLmNvbXBvbmVudHMucmVuZGVyZXIuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZUFuZE1vZGVsIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5ldmFsdWF0ZUV4cHJlc3Npb24iLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmV2YWx1YXRlRnVuY3Rpb24iLCJoby5jb21wb25lbnRzLnJlbmRlcmVyLlJlbmRlcmVyLmNvcHlOb2RlIiwiaG8uY29tcG9uZW50cy5yZW5kZXJlci5SZW5kZXJlci5pc1ZvaWQiLCJoby5jb21wb25lbnRzLmh0bWxwcm92aWRlciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyLkh0bWxQcm92aWRlci5yZXNvbHZlIiwiaG8uY29tcG9uZW50cy5odG1scHJvdmlkZXIuSHRtbFByb3ZpZGVyLmdldEhUTUwiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZSIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGUuaW5pdCIsImhvLmNvbXBvbmVudHMuQXR0cmlidXRlLm5hbWUiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS51cGRhdGUiLCJoby5jb21wb25lbnRzLkF0dHJpYnV0ZS5nZXROYW1lIiwiaG8uY29tcG9uZW50cy5XYXRjaEF0dHJpYnV0ZSIsImhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlLndhdGNoIiwiaG8uY29tcG9uZW50cy5XYXRjaEF0dHJpYnV0ZS5ldmFsIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50Lm5hbWUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXROYW1lIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0UGFyZW50IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuX2luaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQudXBkYXRlIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucmVuZGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdFN0eWxlIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdEhUTUwiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0UHJvcGVydGllcyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRDaGlsZHJlbiIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRBdHRyaWJ1dGVzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQubG9hZFJlcXVpcmVtZW50cyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5IiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkucmVnaXN0ZXIiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LnJ1biIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaW5pdENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaW5pdEVsZW1lbnQiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5Lmhhc0NvbXBvbmVudCIsImhvLmNvbXBvbmVudHMucmVnaXN0cnkuUmVnaXN0cnkuaGFzQXR0cmlidXRlIiwiaG8uY29tcG9uZW50cy5yZWdpc3RyeS5SZWdpc3RyeS5nZXRBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRDb21wb25lbnQiLCJoby5jb21wb25lbnRzLnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRBdHRyaWJ1dGUiLCJoby5jb21wb25lbnRzLnJ1biIsImhvLmNvbXBvbmVudHMucmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sRUFBRSxDQWlCUjtBQWpCRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0FpQm5CQTtJQWpCU0EsV0FBQUEsVUFBVUE7UUFBQ0MsSUFBQUEsSUFBSUEsQ0FpQnhCQTtRQWpCb0JBLFdBQUFBLElBQUlBLEVBQUNBLENBQUNBO1lBQ3pCQyxJQUFJQSxDQUFDQSxHQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsSUFBSUEsSUFBSUEsR0FBVUEsRUFBRUEsQ0FBQ0E7WUFFckJBLGFBQW9CQSxDQUFNQTtnQkFDekJDLENBQUNBLEVBQUVBLENBQUNBO2dCQUNKQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDWkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDVkEsQ0FBQ0E7WUFKZUQsUUFBR0EsTUFJbEJBLENBQUFBO1lBRURBLGFBQW9CQSxDQUFTQTtnQkFDNUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNB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QUNBOzRCQUM5QkEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0E7NEJBQ25CQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQTt3QkFDaEJBLENBQUNBO3dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDUEEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7NEJBQ2xCQSxJQUFJQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDdkNBLE9BQU9BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBOzRCQUNWQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDMUNBLFdBQVdBLEdBQUdBLE1BQU1BLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBOzRCQUNsREEsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7NEJBRXBDQSxFQUFFQSxDQUFBQSxDQUFDQSxXQUFXQSxJQUFJQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDdEVBLFdBQVdBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUNwQkEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7Z0NBRXhDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTs0QkFDaEJBLENBQUNBO3dCQUNGQSxDQUFDQTt3QkFFREEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7d0JBRTNEQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDWkEsS0FBS0EsQ0FBQ0E7d0JBQ1BBLENBQUNBO3dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDUEEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsV0FBV0EsRUFBRUEsV0FBV0EsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsUUFBUUEsRUFBRUEsRUFBRUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBRWxJQSxFQUFFQSxDQUFBQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDN0JBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dDQUNyRUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0NBQ25CQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQ0FDcEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNB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QUdBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBO29CQUNyQkEsSUFBSUEsSUFBSUEsR0FBR0EsRUFBRUEsQ0FBQ0E7b0JBQ0xBLElBQU1BLEdBQUdBLEdBQVFBLElBQUlBLENBQUNBO29CQUUvQkEsRUFBRUEsQ0FBQUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ2RBLElBQUlBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLHNCQUFzQkE7d0JBQzNEQSxFQUFFQSxDQUFBQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDekJBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dDQUNuQkEsSUFBSUEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7Z0NBQzVEQSxJQUFJQSxJQUFJQSxJQUFJQSxHQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFDQSxLQUFLQSxDQUFDQTs0QkFDakNBLENBQUNBOzRCQUNEQSxJQUFJQTtnQ0FDQUEsSUFBSUEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0E7d0JBQ3RDQSxDQUFDQTt3QkFDYkEsSUFBSUE7NEJBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO29CQUN4QkEsQ0FBQ0E7b0JBRURBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBO3dCQUNQQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQTtvQkFFZEEsRUFBRUEsQ0FBQUEsQ0FB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Q0EsRUEvTW9CNUQsUUFBUUEsR0FBUkEsbUJBQVFBLEtBQVJBLG1CQUFRQSxRQStNNUJBO0lBQURBLENBQUNBLEVBL01TRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQStNbkJBO0FBQURBLENBQUNBLEVBL01NLEVBQUUsS0FBRixFQUFFLFFBK01SOztBQy9NRCw4RUFBOEU7QUFDOUUsc0ZBQXNGO0FBQ3RGLDBFQUEwRTtBQUUxRSxJQUFPLEVBQUUsQ0FVUjtBQVZELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQVVuQkE7SUFWU0EsV0FBQUEsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFDckJDO1lBQ0N3RSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUM5Q0EsQ0FBQ0E7UUFGZXhFLGNBQUdBLE1BRWxCQSxDQUFBQTtRQUVEQSxrQkFBeUJBLENBQXNDQTtZQUM5RHlFLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzdDQSxDQUFDQTtRQUZlekUsbUJBQVFBLFdBRXZCQSxDQUFBQTtRQUVVQSxjQUFHQSxHQUFZQSxLQUFLQSxDQUFDQTtJQUNqQ0EsQ0FBQ0EsRUFWU0QsVUFBVUEsR0FBVkEsYUFBVUEsS0FBVkEsYUFBVUEsUUFVbkJBO0FBQURBLENBQUNBLEVBVk0sRUFBRSxLQUFGLEVBQUUsUUFVUiIsImZpbGUiOiJjb21wb25lbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIGhvLmNvbXBvbmVudHMudGVtcCB7XG5cdFx0dmFyIGM6IG51bWJlciA9IC0xO1xuXHRcdHZhciBkYXRhOiBhbnlbXSA9IFtdO1xuXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHNldChkOiBhbnkpOiBudW1iZXIge1xuXHRcdFx0YysrO1xuXHRcdFx0ZGF0YVtjXSA9IGQ7XG5cdFx0XHRyZXR1cm4gYztcblx0XHR9XG5cblx0XHRleHBvcnQgZnVuY3Rpb24gZ2V0KGk6IG51bWJlcik6IGFueSB7XG5cdFx0XHRyZXR1cm4gZGF0YVtpXTtcblx0XHR9XG5cblx0XHRleHBvcnQgZnVuY3Rpb24gY2FsbChpOiBudW1iZXIsIC4uLmFyZ3MpOiB2b2lkIHtcblx0XHRcdGRhdGFbaV0oLi4uYXJncyk7XG5cdFx0fVxufVxuIiwibW9kdWxlIGhvLmNvbXBvbmVudHMuc3R5bGVyIHtcblxuXHRleHBvcnQgaW50ZXJmYWNlIElTdHlsZXIge1xuXHRcdGFwcGx5U3R5bGUoY29tcG9uZW50OiBDb21wb25lbnQsIGNzcz86IHN0cmluZyk6IHZvaWRcblx0fVxuXG5cdGludGVyZmFjZSBTdHlsZUJsb2NrIHtcblx0XHRzZWxlY3Rvcjogc3RyaW5nO1xuXHRcdHJ1bGVzOiBBcnJheTxTdHlsZVJ1bGU+O1xuXHR9XG5cblx0aW50ZXJmYWNlIFN0eWxlUnVsZSB7XG5cdFx0cHJvcGVydHk6IHN0cmluZztcblx0XHR2YWx1ZTogc3RyaW5nO1xuXHR9XG5cblx0Y2xhc3MgU3R5bGVyIGltcGxlbWVudHMgSVN0eWxlciB7XG5cdFx0cHVibGljIGFwcGx5U3R5bGUoY29tcG9uZW50OiBDb21wb25lbnQsIGNzcyA9IGNvbXBvbmVudC5zdHlsZSk6IHZvaWQge1xuXHRcdFx0bGV0IHN0eWxlID0gdGhpcy5wYXJzZVN0eWxlKGNvbXBvbmVudC5zdHlsZSk7XG5cdFx0XHRzdHlsZS5mb3JFYWNoKHMgPT4ge1xuXHRcdFx0XHR0aGlzLmFwcGx5U3R5bGVCbG9jayhjb21wb25lbnQsIHMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGFwcGx5U3R5bGVCbG9jayhjb21wb25lbnQ6IENvbXBvbmVudCwgc3R5bGU6IFN0eWxlQmxvY2spOiB2b2lkIHtcblx0XHRcdGlmKHN0eWxlLnNlbGVjdG9yLnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSAndGhpcycpIHtcblx0XHRcdFx0c3R5bGUucnVsZXMuZm9yRWFjaChyID0+IHtcblx0XHRcdFx0XHR0aGlzLmFwcGx5UnVsZShjb21wb25lbnQuZWxlbWVudCwgcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoY29tcG9uZW50LmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzdHlsZS5zZWxlY3RvciksIGVsID0+IHtcblx0XHRcdFx0XHRzdHlsZS5ydWxlcy5mb3JFYWNoKHIgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5hcHBseVJ1bGUoZWwsIHIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgYXBwbHlSdWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBydWxlOiBTdHlsZVJ1bGUpOiB2b2lkIHtcblx0XHRcdGxldCBwcm9wID0gcnVsZS5wcm9wZXJ0eS5yZXBsYWNlKC8tKFxcdykvZywgKF8sIGxldHRlcjogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcblx0XHRcdH0pLnRyaW0oKTtcblx0XHRcdGVsZW1lbnQuc3R5bGVbcHJvcF0gPSBydWxlLnZhbHVlO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBwYXJzZVN0eWxlKGNzczogc3RyaW5nKTogQXJyYXk8U3R5bGVCbG9jaz4ge1xuXHRcdFx0bGV0IHIgPSAvKC4rPylcXHMqeyguKj8pfS9nbTtcblx0XHRcdGxldCByMiA9IC8oLis/KVxccz86KC4rPyk7L2dtO1xuXHRcdFx0Y3NzID0gY3NzLnJlcGxhY2UoL1xcbi9nLCAnJyk7XG5cdFx0XHRsZXQgYmxvY2tzOiBTdHlsZUJsb2NrW10gPSAoPHN0cmluZ1tdPmNzcy5tYXRjaChyKSB8fCBbXSlcblx0XHRcdFx0Lm1hcChiID0+IHtcblx0XHRcdFx0XHRpZighYi5tYXRjaChyKSlcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0XHRcdFx0bGV0IFtfLCBzZWxlY3RvciwgX3J1bGVzXSA9IHIuZXhlYyhiKTtcblx0XHRcdFx0XHRsZXQgcnVsZXM6IFN0eWxlUnVsZVtdID0gKDxzdHJpbmdbXT5fcnVsZXMubWF0Y2gocjIpIHx8IFtdKVxuXHRcdFx0XHRcdFx0Lm1hcChyID0+IHtcblx0XHRcdFx0XHRcdFx0aWYoIXIubWF0Y2gocjIpKVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBbXywgcHJvcGVydHksIHZhbHVlXSA9IHIyLmV4ZWMocik7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7cHJvcGVydHksIHZhbHVlfTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuZmlsdGVyKHIgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gciAhPT0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiB7c2VsZWN0b3IsIHJ1bGVzfTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbHRlcihiID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gYiAhPT0gbnVsbDtcblx0XHRcdFx0fSk7XG5cblxuXHRcdFx0cmV0dXJuIGJsb2Nrcztcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgbGV0IGluc3RhbmNlOiBJU3R5bGVyID0gbmV3IFN0eWxlcigpO1xufVxuIiwibW9kdWxlIGhvLmNvbXBvbmVudHMucmVuZGVyZXIge1xyXG5cclxuICAgIGludGVyZmFjZSBOb2RlSHRtbCB7XHJcbiAgICAgICAgcm9vdDogTm9kZTtcclxuICAgICAgICBodG1sOiBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTm9kZSB7XHJcbiAgICAgICAgaHRtbDogc3RyaW5nO1xyXG4gICAgICAgIHBhcmVudDogTm9kZTtcclxuICAgICAgICBjaGlsZHJlbjogQXJyYXk8Tm9kZT4gPSBbXTtcclxuICAgICAgICB0eXBlOiBzdHJpbmc7XHJcbiAgICAgICAgc2VsZkNsb3Npbmc6IGJvb2xlYW47XHJcbiAgICAgICAgaXNWb2lkOiBib29sZWFuO1xyXG4gICAgICAgIHJlcGVhdDogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVuZGVyZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIHI6IGFueSA9IHtcclxuXHRcdFx0dGFnOiAvPChbXj5dKj8oPzooPzooJ3xcIilbXidcIl0qP1xcMilbXj5dKj8pKik+LyxcclxuXHRcdFx0cmVwZWF0OiAvcmVwZWF0PVtcInwnXS4rW1wifCddLyxcclxuXHRcdFx0dHlwZTogL1tcXHN8L10qKC4qPylbXFxzfFxcL3w+XS8sXHJcblx0XHRcdHRleHQ6IC8oPzoufFtcXHJcXG5dKSo/W15cIidcXFxcXTwvbSxcclxuXHRcdH07XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZHMgPSBbXCJhcmVhXCIsIFwiYmFzZVwiLCBcImJyXCIsIFwiY29sXCIsIFwiY29tbWFuZFwiLCBcImVtYmVkXCIsIFwiaHJcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLCBcImtleWdlblwiLCBcImxpbmtcIiwgXCJtZXRhXCIsIFwicGFyYW1cIiwgXCJzb3VyY2VcIiwgXCJ0cmFja1wiLCBcIndiclwiXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjYWNoZToge1trZXk6c3RyaW5nXTpOb2RlfSA9IHt9O1xyXG5cclxuICAgICAgICBwdWJsaWMgcmVuZGVyKGNvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBjb21wb25lbnQuaHRtbCA9PT0gJ2Jvb2xlYW4nICYmICFjb21wb25lbnQuaHRtbClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gY29tcG9uZW50Lm5hbWU7XHJcbiAgICAgICAgICAgIGxldCByb290ID0gdGhpcy5jYWNoZVtuYW1lXSA9IHRoaXMuY2FjaGVbbmFtZV0gfHwgdGhpcy5wYXJzZShjb21wb25lbnQuaHRtbCkucm9vdDtcclxuICAgICAgICAgICAgcm9vdCA9IHRoaXMucmVuZGVyUmVwZWF0KHRoaXMuY29weU5vZGUocm9vdCksIGNvbXBvbmVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9IHRoaXMuZG9tVG9TdHJpbmcocm9vdCwgLTEpO1xyXG5cclxuICAgICAgICAgICAgY29tcG9uZW50LmVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcblx0XHRwcml2YXRlIHBhcnNlKGh0bWw6IHN0cmluZywgcm9vdD0gbmV3IE5vZGUoKSk6IE5vZGVIdG1sIHtcclxuXHJcblx0XHRcdHZhciBtO1xyXG5cdFx0XHR3aGlsZSgobSA9IHRoaXMuci50YWcuZXhlYyhodG1sKSkgIT09IG51bGwpIHtcclxuXHRcdFx0XHR2YXIgdGFnLCB0eXBlLCBjbG9zaW5nLCBpc1ZvaWQsIHNlbGZDbG9zaW5nLCByZXBlYXQsIHVuQ2xvc2U7XHJcblx0XHRcdFx0Ly8tLS0tLS0tIGZvdW5kIHNvbWUgdGV4dCBiZWZvcmUgbmV4dCB0YWdcclxuXHRcdFx0XHRpZihtLmluZGV4ICE9PSAwKSB7XHJcblx0XHRcdFx0XHR0YWcgPSBodG1sLm1hdGNoKHRoaXMuci50ZXh0KVswXTtcclxuXHRcdFx0XHRcdHRhZyA9IHRhZy5zdWJzdHIoMCwgdGFnLmxlbmd0aC0xKTtcclxuXHRcdFx0XHRcdHR5cGUgPSAnVEVYVCc7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNWb2lkID0gZmFsc2U7XHJcblx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IHRydWU7XHJcblx0XHRcdFx0XHRyZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGFnID0gbVsxXS50cmltKCk7XHJcblx0XHRcdFx0XHR0eXBlID0gKHRhZysnPicpLm1hdGNoKHRoaXMuci50eXBlKVsxXTtcclxuXHRcdFx0XHRcdGNsb3NpbmcgPSB0YWdbMF0gPT09ICcvJztcclxuICAgICAgICAgICAgICAgICAgICBpc1ZvaWQgPSB0aGlzLmlzVm9pZCh0eXBlKTtcclxuXHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gaXNWb2lkIHx8IHRhZ1t0YWcubGVuZ3RoLTFdID09PSAnLyc7XHJcblx0XHRcdFx0XHRyZXBlYXQgPSAhIXRhZy5tYXRjaCh0aGlzLnIucmVwZWF0KTtcclxuXHJcblx0XHRcdFx0XHRpZihzZWxmQ2xvc2luZyAmJiBoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLmhhc0NvbXBvbmVudCh0eXBlKSkge1xyXG5cdFx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR0YWcgPSB0YWcuc3Vic3RyKDAsIHRhZy5sZW5ndGgtMSkgKyBcIiBcIjtcclxuXHJcblx0XHRcdFx0XHRcdHVuQ2xvc2UgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aHRtbCA9IGh0bWwuc2xpY2UodGFnLmxlbmd0aCArICh0eXBlID09PSAnVEVYVCcgPyAwIDogMikgKTtcclxuXHJcblx0XHRcdFx0aWYoY2xvc2luZykge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucHVzaCh7cGFyZW50OiByb290LCBodG1sOiB0YWcsIHR5cGU6IHR5cGUsIGlzVm9pZDogaXNWb2lkLCBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsIHJlcGVhdDogcmVwZWF0LCBjaGlsZHJlbjogW119KTtcclxuXHJcblx0XHRcdFx0XHRpZighdW5DbG9zZSAmJiAhc2VsZkNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2UoaHRtbCwgcm9vdC5jaGlsZHJlbltyb290LmNoaWxkcmVuLmxlbmd0aC0xXSk7XHJcblx0XHRcdFx0XHRcdGh0bWwgPSByZXN1bHQuaHRtbDtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wb3AoKTtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHJlc3VsdC5yb290KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG0gPSBodG1sLm1hdGNoKHRoaXMuci50YWcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge3Jvb3Q6IHJvb3QsIGh0bWw6IGh0bWx9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgcmVuZGVyUmVwZWF0KHJvb3QsIG1vZGVscyk6IE5vZGUge1xyXG5cdFx0XHRtb2RlbHMgPSBbXS5jb25jYXQobW9kZWxzKTtcclxuXHJcblx0XHRcdGZvcih2YXIgYyA9IDA7IGMgPCByb290LmNoaWxkcmVuLmxlbmd0aDsgYysrKSB7XHJcblx0XHRcdFx0dmFyIGNoaWxkID0gcm9vdC5jaGlsZHJlbltjXTtcclxuXHRcdFx0XHRpZihjaGlsZC5yZXBlYXQpIHtcclxuXHRcdFx0XHRcdHZhciByZWdleCA9IC9yZXBlYXQ9W1wifCddXFxzKihcXFMrKVxccythc1xccysoXFxTKz8pW1wifCddLztcclxuXHRcdFx0XHRcdHZhciBtID0gY2hpbGQuaHRtbC5tYXRjaChyZWdleCkuc2xpY2UoMSk7XHJcblx0XHRcdFx0XHR2YXIgbmFtZSA9IG1bMV07XHJcblx0XHRcdFx0XHR2YXIgaW5kZXhOYW1lO1xyXG5cdFx0XHRcdFx0aWYobmFtZS5pbmRleE9mKCcsJykgPiAtMSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KCcsJyk7XHJcblx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lc1swXS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGluZGV4TmFtZSA9IG5hbWVzWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR2YXIgbW9kZWwgPSB0aGlzLmV2YWx1YXRlKG1vZGVscywgbVswXSk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGhvbGRlciA9IFtdO1xyXG5cdFx0XHRcdFx0bW9kZWwuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG1vZGVsMiA9IHt9O1xyXG5cdFx0XHRcdFx0XHRtb2RlbDJbbmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0bW9kZWwyW2luZGV4TmFtZV0gPSBpbmRleDtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBtb2RlbHMyID0gW10uY29uY2F0KG1vZGVscyk7XHJcblx0XHRcdFx0XHRcdG1vZGVsczIudW5zaGlmdChtb2RlbDIpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLmNvcHlOb2RlKGNoaWxkKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0bm9kZS5odG1sID0gbm9kZS5odG1sLnJlcGxhY2UodGhpcy5yLnJlcGVhdCwgJycpO1xyXG5cdFx0XHRcdFx0XHRub2RlLmh0bWwgPSB0aGlzLnJlcGwobm9kZS5odG1sLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdG5vZGUgPSB0aGlzLnJlbmRlclJlcGVhdChub2RlLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vcm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMCwgbm9kZSk7XHJcblx0XHRcdFx0XHRcdGhvbGRlci5wdXNoKG5vZGUpO1xyXG5cdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRcdFx0XHRob2xkZXIuZm9yRWFjaChmdW5jdGlvbihuKSB7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDAsIG4pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAxKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2hpbGQuaHRtbCA9IHRoaXMucmVwbChjaGlsZC5odG1sLCBtb2RlbHMpO1xyXG5cdFx0XHRcdFx0Y2hpbGQgPSB0aGlzLnJlbmRlclJlcGVhdChjaGlsZCwgbW9kZWxzKTtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW5bY10gPSBjaGlsZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByb290O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZG9tVG9TdHJpbmcocm9vdDogTm9kZSwgaW5kZW50OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0XHRpbmRlbnQgPSBpbmRlbnQgfHwgMDtcclxuXHRcdFx0dmFyIGh0bWwgPSAnJztcclxuICAgICAgICAgICAgY29uc3QgdGFiOiBhbnkgPSAnXFx0JztcclxuXHJcblx0XHRcdGlmKHJvb3QuaHRtbCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gbmV3IEFycmF5KGluZGVudCkuam9pbih0YWIpOyAvL3RhYi5yZXBlYXQoaW5kZW50KTs7XHJcblx0XHRcdFx0aWYocm9vdC50eXBlICE9PSAnVEVYVCcpIHtcclxuXHRcdFx0XHRcdGlmKHJvb3Quc2VsZkNsb3NpbmcgJiYgIXJvb3QuaXNWb2lkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwnICsgcm9vdC5odG1sLnN1YnN0cigwLCAtLXJvb3QuaHRtbC5sZW5ndGgpICsgJz4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8Lycrcm9vdC50eXBlKyc+XFxuJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8JyArIHJvb3QuaHRtbCArICc+JztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0XHRlbHNlIGh0bWwgKz0gcm9vdC5odG1sO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihodG1sKVxyXG5cdFx0XHRcdGh0bWwgKz0gJ1xcbic7XHJcblxyXG5cdFx0XHRpZihyb290LmNoaWxkcmVuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gcm9vdC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9tVG9TdHJpbmcoYywgaW5kZW50Kyhyb290LnR5cGUgPyAxIDogMikpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzKSkuam9pbignXFxuJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHJvb3QudHlwZSAmJiByb290LnR5cGUgIT09ICdURVhUJyAmJiAhcm9vdC5zZWxmQ2xvc2luZykge1xyXG5cdFx0XHRcdGh0bWwgKz0gbmV3IEFycmF5KGluZGVudCkuam9pbih0YWIpOyAvL3RhYi5yZXBlYXQoaW5kZW50KTtcclxuXHRcdFx0XHRodG1sICs9ICc8Lycrcm9vdC50eXBlKyc+XFxuJztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGh0bWw7XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVwbChzdHI6IHN0cmluZywgbW9kZWxzOiBhbnlbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHZhciByZWdleEcgPSAveyguKz8pfX0/L2c7XHJcblxyXG4gICAgICAgICAgICB2YXIgbSA9IHN0ci5tYXRjaChyZWdleEcpO1xyXG4gICAgICAgICAgICBpZighbSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblxyXG4gICAgICAgICAgICB3aGlsZShtLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBtWzBdO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKDEsIHBhdGgubGVuZ3RoLTIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZXZhbHVhdGUobW9kZWxzLCBwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gXCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXRDb21wb25lbnQodGhpcykuXCIrcGF0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobVswXSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG0gPSBtLnNsaWNlKDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZShtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgICAgICBpZihwYXRoWzBdID09PSAneycgJiYgcGF0aFstLXBhdGgubGVuZ3RoXSA9PT0gJ30nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVscywgcGF0aC5zdWJzdHIoMSwgcGF0aC5sZW5ndGgtMikpXHJcbiAgICAgICAgICAgIGVsc2UgaWYocGF0aFswXSA9PT0gJyMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVGdW5jdGlvbihtb2RlbHMsIHBhdGguc3Vic3RyKDEpKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVWYWx1ZShtb2RlbHMsIHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZVZhbHVlKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHMsIHBhdGgpLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcblx0XHRwcml2YXRlIGV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiB7dmFsdWU6IGFueSwgbW9kZWw6IGFueX0ge1xyXG5cdFx0XHRpZihtb2RlbHMuaW5kZXhPZih3aW5kb3cpID09IC0xKVxyXG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2god2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKFwibW9kZWxcIiwgXCJyZXR1cm4gbW9kZWxbJ1wiICsgcGF0aC5zcGxpdChcIi5cIikuam9pbihcIiddWydcIikgKyBcIiddXCIpKG1vZGVsKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcInZhbHVlXCI6IG1vZGVsLCBcIm1vZGVsXCI6IG1vZGVsc1stLW1pXX07XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcblx0XHRcdGlmKG1vZGVscy5pbmRleE9mKHdpbmRvdykgPT0gLTEpXHJcbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaCh3aW5kb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1pID0gMDtcclxuXHRcdFx0dmFyIG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHR3aGlsZShtaSA8IG1vZGVscy5sZW5ndGggJiYgbW9kZWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG1vZGVsID0gbW9kZWxzW21pXTtcclxuXHRcdFx0XHR0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aChtb2RlbCkgbW9kZWwgPSBldmFsKHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsID0gbmV3IEZ1bmN0aW9uKE9iamVjdC5rZXlzKG1vZGVsKS50b1N0cmluZygpLCBcInJldHVybiBcIiArIHBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBseShudWxsLCBPYmplY3Qua2V5cyhtb2RlbCkubWFwKChrKSA9PiB7cmV0dXJuIG1vZGVsW2tdfSkgKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1vZGVsO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlRnVuY3Rpb24obW9kZWxzOiBhbnlbXSwgcGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICAgICAgbGV0IGV4cCA9IHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uLmJpbmQodGhpcywgbW9kZWxzKTtcclxuXHRcdFx0dmFyIFtuYW1lLCBhcmdzXSA9IHBhdGguc3BsaXQoJygnKTtcclxuICAgICAgICAgICAgYXJncyA9IGFyZ3Muc3Vic3RyKDAsIC0tYXJncy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHt2YWx1ZSwgbW9kZWx9ID0gdGhpcy5ldmFsdWF0ZVZhbHVlQW5kTW9kZWwobW9kZWxzLCBuYW1lKTtcclxuICAgICAgICAgICAgbGV0IGZ1bmM6IEZ1bmN0aW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGxldCBhcmdBcnI6IHN0cmluZ1tdID0gYXJncy5zcGxpdCgnLicpLm1hcCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnLmluZGV4T2YoJyMnKSA9PT0gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnLnN1YnN0cigxKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwKGFyZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuYyA9IGZ1bmMuYmluZChtb2RlbCwgLi4uYXJnQXJyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhvLmNvbXBvbmVudHMudGVtcC5zZXQoZnVuYyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RyID0gYGhvLmNvbXBvbmVudHMudGVtcC5jYWxsKCR7aW5kZXh9KWA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBjb3B5Tm9kZShub2RlOiBOb2RlKTogTm9kZSB7XHJcblx0XHRcdHZhciBjb3B5Tm9kZSA9IHRoaXMuY29weU5vZGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBuID0gPE5vZGU+e1xyXG5cdFx0XHRcdHBhcmVudDogbm9kZS5wYXJlbnQsXHJcblx0XHRcdFx0aHRtbDogbm9kZS5odG1sLFxyXG5cdFx0XHRcdHR5cGU6IG5vZGUudHlwZSxcclxuXHRcdFx0XHRzZWxmQ2xvc2luZzogbm9kZS5zZWxmQ2xvc2luZyxcclxuXHRcdFx0XHRyZXBlYXQ6IG5vZGUucmVwZWF0LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBub2RlLmNoaWxkcmVuLm1hcChjb3B5Tm9kZSlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHJldHVybiBuO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGlzVm9pZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudm9pZHMuaW5kZXhPZihuYW1lLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVuZGVyZXIoKTtcclxuXHJcbn1cclxuIiwibW9kdWxlIGhvLmNvbXBvbmVudHMuaHRtbHByb3ZpZGVyIHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBIdG1sUHJvdmlkZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIGNhY2hlOiB7W2theTpzdHJpbmddOnN0cmluZ30gPSB7fTtcclxuXHJcbiAgICAgICAgcmVzb2x2ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBpZihoby5jb21wb25lbnRzLmRpcikge1xyXG4gICAgICAgICAgICAgICAgbmFtZSArPSAnLicgKyBuYW1lLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNwbGl0KCcuJykuam9pbignLycpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGBjb21wb25lbnRzLyR7bmFtZX0uaHRtbGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRIVE1MKG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nLCBzdHJpbmc+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5jYWNoZVtuYW1lXSA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodGhpcy5jYWNoZVtuYW1lXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMucmVzb2x2ZShuYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIFx0XHRcdFx0aWYoeG1saHR0cC5yZWFkeVN0YXRlID09IDQpIHtcclxuICAgIFx0XHRcdFx0XHRsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xyXG4gICAgXHRcdFx0XHRcdGlmKHhtbGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwKTtcclxuICAgIFx0XHRcdFx0XHR9IGVsc2Uge1xyXG4gICAgXHRcdFx0XHRcdFx0cmVqZWN0KGBFcnJvciB3aGlsZSBsb2FkaW5nIGh0bWwgZm9yIENvbXBvbmVudCAke25hbWV9YCk7XHJcbiAgICBcdFx0XHRcdFx0fVxyXG4gICAgXHRcdFx0XHR9XHJcbiAgICBcdFx0XHR9O1xyXG5cclxuICAgIFx0XHRcdHhtbGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgIFx0XHRcdHhtbGh0dHAuc2VuZCgpO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgSHRtbFByb3ZpZGVyKCk7XHJcblxyXG59XHJcbiIsIm1vZHVsZSBoby5jb21wb25lbnRzIHtcblxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXHQvKipcblx0XHRCYXNlY2xhc3MgZm9yIEF0dHJpYnV0ZXMuXG5cdFx0VXNlZCBBdHRyaWJ1dGVzIG5lZWRzIHRvIGJlIHNwZWNpZmllZCBieSBDb21wb25lbnQjYXR0cmlidXRlcyBwcm9wZXJ0eSB0byBnZXQgbG9hZGVkIHByb3Blcmx5LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQXR0cmlidXRlIHtcblxuXHRcdHByb3RlY3RlZCBlbGVtZW50OiBIVE1MRWxlbWVudDtcblx0XHRwcm90ZWN0ZWQgY29tcG9uZW50OiBDb21wb25lbnQ7XG5cdFx0cHJvdGVjdGVkIHZhbHVlOiBzdHJpbmc7XG5cblx0XHRjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgdmFsdWU/OiBzdHJpbmcpIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cdFx0XHR0aGlzLmNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRDb21wb25lbnQoZWxlbWVudCk7XG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cblx0XHRcdHRoaXMuaW5pdCgpO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBpbml0KCk6IHZvaWQge31cblxuXHRcdGdldCBuYW1lKCkge1xuXHRcdFx0cmV0dXJuIEF0dHJpYnV0ZS5nZXROYW1lKHRoaXMpO1xuXHRcdH1cblxuXG5cdFx0cHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcblxuXHRcdH1cblxuXG5cdFx0c3RhdGljIGdldE5hbWUoY2xheno6IHR5cGVvZiBBdHRyaWJ1dGUgfCBBdHRyaWJ1dGUpOiBzdHJpbmcge1xuICAgICAgICAgICAgaWYoY2xhenogaW5zdGFuY2VvZiBBdHRyaWJ1dGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgICAgIH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBXYXRjaEF0dHJpYnV0ZSBleHRlbmRzIEF0dHJpYnV0ZSB7XG5cblx0XHRwcm90ZWN0ZWQgcjogUmVnRXhwID0gLyMoLis/KSMvZztcblxuXHRcdGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB2YWx1ZT86IHN0cmluZykge1xuXHRcdFx0c3VwZXIoZWxlbWVudCwgdmFsdWUpO1xuXG5cdFx0XHRsZXQgbTogYW55W10gPSB0aGlzLnZhbHVlLm1hdGNoKHRoaXMucikgfHwgW107XG5cdFx0XHRtLm1hcChmdW5jdGlvbih3KSB7XG5cdFx0XHRcdHcgPSB3LnN1YnN0cigxLCB3Lmxlbmd0aC0yKTtcblx0XHRcdFx0dGhpcy53YXRjaCh3KTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZS5yZXBsYWNlKC8jL2csICcnKTtcblx0XHR9XG5cblxuXHRcdHByb3RlY3RlZCB3YXRjaChwYXRoOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdGxldCBwYXRoQXJyID0gcGF0aC5zcGxpdCgnLicpO1xuXHRcdFx0bGV0IHByb3AgPSBwYXRoQXJyLnBvcCgpO1xuXHRcdFx0bGV0IG9iaiA9IHRoaXMuY29tcG9uZW50O1xuXG5cdFx0XHRwYXRoQXJyLm1hcCgocGFydCkgPT4ge1xuXHRcdFx0XHRvYmogPSBvYmpbcGFydF07XG5cdFx0XHR9KTtcblxuXHRcdFx0aG8ud2F0Y2gud2F0Y2gob2JqLCBwcm9wLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgZXZhbChwYXRoOiBzdHJpbmcpOiBhbnkge1xuXHRcdFx0bGV0IG1vZGVsID0gdGhpcy5jb21wb25lbnQ7XG5cdFx0XHRtb2RlbCA9IG5ldyBGdW5jdGlvbihPYmplY3Qua2V5cyhtb2RlbCkudG9TdHJpbmcoKSwgXCJyZXR1cm4gXCIgKyBwYXRoKVxuXHRcdFx0XHQuYXBwbHkobnVsbCwgT2JqZWN0LmtleXMobW9kZWwpLm1hcCgoaykgPT4ge3JldHVybiBtb2RlbFtrXX0pICk7XG5cdFx0XHRyZXR1cm4gbW9kZWw7XG5cdFx0fVxuXG5cdH1cbn1cbiIsIm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuICAgIGltcG9ydCBIdG1sUHJvdmlkZXIgPSBoby5jb21wb25lbnRzLmh0bWxwcm92aWRlci5pbnN0YW5jZTtcclxuICAgIGltcG9ydCBSZW5kZXJlciA9IGhvLmNvbXBvbmVudHMucmVuZGVyZXIuaW5zdGFuY2U7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGNvbXBvbmVudD86IENvbXBvbmVudDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElQcm9wcmV0eSB7XHJcbiAgICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcclxuICAgICAgICBkZWZhdWx0PzogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAgIEJhc2VjbGFzcyBmb3IgQ29tcG9uZW50c1xyXG4gICAgICAgIGltcG9ydGFudDogZG8gaW5pdGlhbGl6YXRpb24gd29yayBpbiBDb21wb25lbnQjaW5pdFxyXG4gICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBlbGVtZW50OiBDb21wb25lbnRFbGVtZW50O1xyXG4gICAgICAgIHB1YmxpYyBvcmlnaW5hbF9pbm5lckhUTUw6IHN0cmluZztcclxuICAgICAgICBwdWJsaWMgaHRtbDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgcHVibGljIHN0eWxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICBwdWJsaWMgcHJvcGVydGllczogQXJyYXk8c3RyaW5nfElQcm9wcmV0eT4gPSBbXTtcclxuICAgICAgICBwdWJsaWMgYXR0cmlidXRlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIHB1YmxpYyByZXF1aXJlczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIHB1YmxpYyBjaGlsZHJlbjoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8tLS0tLS0tIGluaXQgRWxlbWVuZXQgYW5kIEVsZW1lbnRzJyBvcmlnaW5hbCBpbm5lckhUTUxcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNvbXBvbmVudCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxfaW5uZXJIVE1MID0gZWxlbWVudC5pbm5lckhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IG5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5nZXROYW1lKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQYXJlbnQoKTogQ29tcG9uZW50IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5nZXRDb21wb25lbnQoPENvbXBvbmVudEVsZW1lbnQ+dGhpcy5lbGVtZW50LnBhcmVudE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIF9pbml0KCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuICAgICAgICAgICAgbGV0IHJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLS0gaW5pdCBQcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vLS0tLS0tLSBjYWxsIGluaXQoKSAmIGxvYWRSZXF1aXJlbWVudHMoKSAtPiB0aGVuIHJlbmRlclxyXG4gICAgICAgICAgICBsZXQgcmVhZHkgPSBbdGhpcy5pbml0SFRNTCgpLCBQcm9taXNlLmNyZWF0ZSh0aGlzLmluaXQoKSksIHRoaXMubG9hZFJlcXVpcmVtZW50cygpXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwID0gbmV3IFByb21pc2U8YW55LCBhbnk+KCk7XHJcblxyXG4gICAgICAgICAgICBQcm9taXNlLmFsbChyZWFkeSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHAucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgICAgTWV0aG9kIHRoYXQgZ2V0IGNhbGxlZCBhZnRlciBpbml0aWFsaXphdGlvbiBvZiBhIG5ldyBpbnN0YW5jZS5cclxuICAgICAgICAgICAgRG8gaW5pdC13b3JrIGhlcmUuXHJcbiAgICAgICAgICAgIE1heSByZXR1cm4gYSBQcm9taXNlLlxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGluaXQoKTogYW55IHt9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7cmV0dXJuIHZvaWQgMDt9XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XHJcbiAgICBcdFx0UmVuZGVyZXIucmVuZGVyKHRoaXMpO1xyXG5cclxuICAgIFx0XHRoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLmluaXRFbGVtZW50KHRoaXMuZWxlbWVudClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2hpbGRyZW4oKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRTdHlsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEF0dHJpYnV0ZXMoKTtcclxuXHJcbiAgICBcdFx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIFx0fTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0U3R5bGUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLnN0eWxlID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYodGhpcy5zdHlsZSA9PT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuc3R5bGUgPT09ICdzdHJpbmcnICYmIHRoaXMuc3R5bGUubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgc3R5bGVyLmluc3RhbmNlLmFwcGx5U3R5bGUodGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqICBBc3N1cmUgdGhhdCB0aGlzIGluc3RhbmNlIGhhcyBhbiB2YWxpZCBodG1sIGF0dHJpYnV0ZSBhbmQgaWYgbm90IGxvYWQgYW5kIHNldCBpdC5cclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaW5pdEhUTUwoKTogUHJvbWlzZTxhbnksYW55PiB7XHJcbiAgICAgICAgICAgIGxldCBwID0gbmV3IFByb21pc2UoKTtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmh0bWwuaW5kZXhPZihcIi5odG1sXCIsIHRoaXMuaHRtbC5sZW5ndGggLSBcIi5odG1sXCIubGVuZ3RoKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBIdG1sUHJvdmlkZXIuZ2V0SFRNTCh0aGlzLm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5odG1sID0gaHRtbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocC5yZWplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRQcm9wZXJ0aWVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgcHJvcCA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BlcnRpZXNbcHJvcC5uYW1lXSA9IHRoaXMuZWxlbWVudFtwcm9wLm5hbWVdIHx8IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUocHJvcC5uYW1lKSB8fCBwcm9wLmRlZmF1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5wcm9wZXJ0aWVzW3Byb3AubmFtZV0gPT09IHVuZGVmaW5lZCAmJiBwcm9wLnJlcXVpcmVkID09PSB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBgUHJvcGVydHkgJHtwcm9wLm5hbWV9IGlzIHJlcXVpcmVkIGJ1dCBub3QgcHJvdmlkZWRgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZih0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3BdID0gdGhpcy5lbGVtZW50W3Byb3BdIHx8IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUocHJvcCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRDaGlsZHJlbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkcyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgICBcdFx0Zm9yKGxldCBjID0gMDsgYyA8IGNoaWxkcy5sZW5ndGg7IGMrKykge1xyXG4gICAgXHRcdFx0bGV0IGNoaWxkOiBFbGVtZW50ID0gY2hpbGRzW2NdO1xyXG4gICAgXHRcdFx0aWYoY2hpbGQuaWQpIHtcclxuICAgIFx0XHRcdFx0dGhpcy5jaGlsZHJlbltjaGlsZC5pZF0gPSBjaGlsZDtcclxuICAgIFx0XHRcdH1cclxuICAgIFx0XHRcdGlmKGNoaWxkLnRhZ05hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltjaGlsZC50YWdOYW1lXSA9IHRoaXMuY2hpbGRyZW5bY2hpbGQudGFnTmFtZV0gfHwgW107XHJcbiAgICAgICAgICAgICAgICAoPEVsZW1lbnRbXT50aGlzLmNoaWxkcmVuW2NoaWxkLnRhZ05hbWVdKS5wdXNoKGNoaWxkKTtcclxuICAgIFx0XHR9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRBdHRyaWJ1dGVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyID0gaG8uY29tcG9uZW50cy5yZWdpc3RyeS5pbnN0YW5jZS5nZXRBdHRyaWJ1dGUoYSk7XHJcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGAqWyR7YX1dYCksIChlOiBIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWwgPSBlLmhhc093blByb3BlcnR5KGEpID8gZVthXSA6IGUuZ2V0QXR0cmlidXRlKGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmIHZhbCA9PT0gJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgYXR0cihlLCB2YWwpLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBsb2FkUmVxdWlyZW1lbnRzKCkge1xyXG4gICAgXHRcdGxldCBjb21wb25lbnRzOiBhbnlbXSA9IHRoaXMucmVxdWlyZXNcclxuICAgICAgICAgICAgLmZpbHRlcigocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2UuaGFzQ29tcG9uZW50KHJlcSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5tYXAoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2UubG9hZENvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICBsZXQgYXR0cmlidXRlczogYW55W10gPSB0aGlzLmF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgLmZpbHRlcigocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2UuaGFzQXR0cmlidXRlKHJlcSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5tYXAoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2UubG9hZEF0dHJpYnV0ZShyZXEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICBsZXQgcHJvbWlzZXMgPSBjb21wb25lbnRzLmNvbmNhdChhdHRyaWJ1dGVzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgc3RhdGljIHJlZ2lzdGVyKGM6IHR5cGVvZiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaG8uY29tcG9uZW50cy5yZWdpc3RyeS5pbnN0YW5jZS5yZWdpc3RlcihjKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICBzdGF0aWMgcnVuKG9wdD86IGFueSkge1xyXG4gICAgICAgICAgICBoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLnNldE9wdGlvbnMob3B0KTtcclxuICAgICAgICAgICAgaG8uY29tcG9uZW50cy5yZWdpc3RyeS5pbnN0YW5jZS5ydW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgc3RhdGljIGdldENvbXBvbmVudChlbGVtZW50OiBDb21wb25lbnRFbGVtZW50KTogQ29tcG9uZW50IHtcclxuICAgICAgICAgICAgd2hpbGUoIWVsZW1lbnQuY29tcG9uZW50KVxyXG4gICAgXHRcdFx0ZWxlbWVudCA9IDxDb21wb25lbnRFbGVtZW50PmVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgIFx0XHRyZXR1cm4gZWxlbWVudC5jb21wb25lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgZ2V0TmFtZShjbGF6ejogdHlwZW9mIENvbXBvbmVudCk6IHN0cmluZztcclxuICAgICAgICBzdGF0aWMgZ2V0TmFtZShjbGF6ejogQ29tcG9uZW50KTogc3RyaW5nO1xyXG4gICAgICAgIHN0YXRpYyBnZXROYW1lKGNsYXp6OiAodHlwZW9mIENvbXBvbmVudCkgfCAoQ29tcG9uZW50KSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGlmKGNsYXp6IGluc3RhbmNlb2YgQ29tcG9uZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBjbGF6ei50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59XHJcbiIsIm1vZHVsZSBoby5jb21wb25lbnRzLnJlZ2lzdHJ5IHtcclxuICAgIGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZWdpc3RyeSB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50czogQXJyYXk8dHlwZW9mIENvbXBvbmVudD4gPSBbXTtcclxuICAgICAgICBwcml2YXRlIGF0dHJpYnV0ZXM6IEFycmF5PHR5cGVvZiBBdHRyaWJ1dGU+ID0gW107XHJcblxyXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50TG9hZGVyID0gbmV3IGhvLmNsYXNzbG9hZGVyLkNsYXNzTG9hZGVyKHtcclxuICAgICAgICAgICAgdXJsVGVtcGxhdGU6ICdjb21wb25lbnRzLyR7bmFtZX0uanMnLFxyXG4gICAgICAgICAgICB1c2VEaXI6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhdHRyaWJ1dGVMb2FkZXIgPSBuZXcgaG8uY2xhc3Nsb2FkZXIuQ2xhc3NMb2FkZXIoe1xyXG4gICAgICAgICAgICB1cmxUZW1wbGF0ZTogJ2F0dHJpYnV0ZXMvJHtuYW1lfS5qcycsXHJcbiAgICAgICAgICAgIHVzZURpcjogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyByZWdpc3RlcihjYTogdHlwZW9mIENvbXBvbmVudCB8IHR5cGVvZiBBdHRyaWJ1dGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYoY2EucHJvdG90eXBlIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaCg8dHlwZW9mIENvbXBvbmVudD5jYSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KENvbXBvbmVudC5nZXROYW1lKDx0eXBlb2YgQ29tcG9uZW50PmNhKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihjYS5wcm90b3R5cGUgaW5zdGFuY2VvZiBBdHRyaWJ1dGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlcy5wdXNoKDx0eXBlb2YgQXR0cmlidXRlPmNhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJ1bigpOiBQcm9taXNlPGFueSwgYW55PiB7XHJcbiAgICAgICAgICAgIGxldCBpbml0Q29tcG9uZW50OiAoYzogdHlwZW9mIENvbXBvbmVudCk9PlByb21pc2U8YW55LCBhbnk+ID0gdGhpcy5pbml0Q29tcG9uZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxhbnksIGFueT4+ID0gdGhpcy5jb21wb25lbnRzLm1hcCgoYyk9PntcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbml0Q29tcG9uZW50KDxhbnk+Yyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0Q29tcG9uZW50KGNvbXBvbmVudDogdHlwZW9mIENvbXBvbmVudCwgZWxlbWVudDpIVE1MRWxlbWVudHxEb2N1bWVudD1kb2N1bWVudCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuICAgICAgICAgICAgbGV0IHByb21pc2VzOiBBcnJheTxQcm9taXNlPGFueSwgYW55Pj4gPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoQ29tcG9uZW50LmdldE5hbWUoY29tcG9uZW50KSksXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlKTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNvbXBvbmVudChlKS5faW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0RWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuICAgICAgICAgICAgbGV0IGluaXRDb21wb25lbnQ6IChjOiB0eXBlb2YgQ29tcG9uZW50LCBlbGVtZW50OiBIVE1MRWxlbWVudCk9PlByb21pc2U8YW55LCBhbnk+ID0gdGhpcy5pbml0Q29tcG9uZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxhbnksIGFueT4+ID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLFxyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5pdENvbXBvbmVudChjb21wb25lbnQsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBoYXNDb21wb25lbnQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQuZ2V0TmFtZShjb21wb25lbnQpID09PSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBoYXNBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBdHRyaWJ1dGUuZ2V0TmFtZShhdHRyaWJ1dGUpID09PSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogdHlwZW9mIEF0dHJpYnV0ZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgLmZpbHRlcigoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQXR0cmlidXRlLmdldE5hbWUoYXR0cmlidXRlKSA9PT0gbmFtZTtcclxuICAgICAgICAgICAgfSlbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9hZENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBDb21wb25lbnQsIHN0cmluZz4ge1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRMb2FkZXIubG9hZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgc3VwZXI6IFtcImhvLmNvbXBvbmVudHMuQ29tcG9uZW50XCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGNsYXNzZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5tYXAoYyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWdpc3Rlcig8dHlwZW9mIENvbXBvbmVudD5jKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXMucG9wKCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50T2ZDb21wb25lbnQobmFtZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBhcmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoc2VsZi5oYXNDb21wb25lbnQocGFyZW50KSB8fCBwYXJlbnQgPT09ICdoby5jb21wb25lbnRzLkNvbXBvbmVudCcpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBzZWxmLmxvYWRDb21wb25lbnQocGFyZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHBhcmVudFR5cGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLmluc3RhbmNlLmdldENvbXBvbmVudChuYW1lKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5vcHRpb25zLmNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudChuYW1lKVxyXG4gICAgICAgICAgICAqL1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGxvYWRBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogUHJvbWlzZTx0eXBlb2YgQXR0cmlidXRlLCBzdHJpbmc+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZUxvYWRlci5sb2FkKHtcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICBzdXBlcjogW1wiaG8uY29tcG9uZW50cy5BdHRyaWJ1dGVcIiwgXCJoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGNsYXNzZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5tYXAoYyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWdpc3Rlcig8dHlwZW9mIEF0dHJpYnV0ZT5jKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXMucG9wKCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50T2ZBdHRyaWJ1dGUobmFtZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBhcmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoc2VsZi5oYXNBdHRyaWJ1dGUocGFyZW50KSB8fCBwYXJlbnQgPT09ICdoby5jb21wb25lbnRzLkF0dHJpYnV0ZScgfHwgcGFyZW50ID09PSAnaG8uY29tcG9uZW50cy5XYXRjaEF0dHJpYnV0ZScpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBzZWxmLmxvYWRBdHRyaWJ1dGUocGFyZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHBhcmVudFR5cGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLmluc3RhbmNlLmdldEF0dHJpYnV0ZShuYW1lKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHR5cGVvZiBBdHRyaWJ1dGUsIHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaG8uY29tcG9uZW50cy5hdHRyaWJ1dGVwcm92aWRlci5pbnN0YW5jZS5nZXRBdHRyaWJ1dGUobmFtZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShhdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAqL1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldFBhcmVudE9mQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nLCBhbnk+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50T2ZDbGFzcyhoby5jb21wb25lbnRzLmNvbXBvbmVudHByb3ZpZGVyLmluc3RhbmNlLnJlc29sdmUobmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldFBhcmVudE9mQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nLCBhbnk+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50T2ZDbGFzcyhoby5jb21wb25lbnRzLmF0dHJpYnV0ZXByb3ZpZGVyLmluc3RhbmNlLnJlc29sdmUobmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGdldFBhcmVudE9mQ2xhc3MocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcsIGFueT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICB4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZih4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih4bWxodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtID0gcmVzcC5tYXRjaCgvfVxcKVxcKCguKilcXCk7Lyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB4bWxodHRwLm9wZW4oJ0dFVCcsIHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgeG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2UgPSBuZXcgUmVnaXN0cnkoKTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby1wcm9taXNlL2Rpc3QvcHJvbWlzZS5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tY2xhc3Nsb2FkZXIvZGlzdC9jbGFzc2xvYWRlci5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8td2F0Y2gvZGlzdC93YXRjaC5kLnRzXCIvPlxuXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XG5cdGV4cG9ydCBmdW5jdGlvbiBydW4oKTogaG8ucHJvbWlzZS5Qcm9taXNlPGFueSwgYW55PiB7XG5cdFx0cmV0dXJuIGhvLmNvbXBvbmVudHMucmVnaXN0cnkuaW5zdGFuY2UucnVuKCk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCB8IHR5cGVvZiBBdHRyaWJ1dGUpOiB2b2lkIHtcblx0XHRoby5jb21wb25lbnRzLnJlZ2lzdHJ5Lmluc3RhbmNlLnJlZ2lzdGVyKGMpO1xuXHR9XG5cblx0ZXhwb3J0IGxldCBkaXI6IGJvb2xlYW4gPSBmYWxzZTtcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==