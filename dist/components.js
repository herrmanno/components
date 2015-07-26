var ho;
(function (ho) {
    var components;
    (function (components) {
        var HtmlProvider = (function () {
            function HtmlProvider() {
            }
            HtmlProvider.prototype.getHTML = function (name) {
                return new Promise(function (resolve, reject) {
                    var url = "components/" + name + ".html";
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            var resp = xmlhttp.responseText;
                            if (xmlhttp.status == 200) {
                                resolve(resp);
                            }
                            else {
                                reject(resp);
                            }
                        }
                    };
                    xmlhttp.open('GET', url, true);
                    xmlhttp.send();
                });
            };
            return HtmlProvider;
        })();
        components.HtmlProvider = HtmlProvider;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
var ho;
(function (ho) {
    var components;
    (function (components) {
        var ComponentProvider = (function () {
            function ComponentProvider() {
            }
            ComponentProvider.prototype.getComponent = function (name) {
                return new Promise(function (resolve, reject) {
                    var url = "components/" + name + ".js";
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            var resp = xmlhttp.responseText;
                            if (xmlhttp.status == 200) {
                                var func = resp + "\nreturn  " + name + "\n//#sourceURL=" + location.origin + '/' + 'url;';
                                var component = new Function("", func)();
                                components.Component.register(component);
                                resolve(resp);
                            }
                            else {
                                reject(resp);
                            }
                        }
                    };
                    xmlhttp.open('GET', url, true);
                    xmlhttp.send();
                });
            };
            return ComponentProvider;
        })();
        components.ComponentProvider = ComponentProvider;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Renderer = (function () {
            function Renderer() {
                this.r = {
                    tag: /<([^>]*?(?:(?:('|")[^'"]*?\2)[^>]*?)*)>/,
                    repeat: /repeat=["|'].+["|']/,
                    type: /[\s|/]*(.*?)[\s|\/|>]/,
                    text: /(?:.|[\r\n])*?[^"'\\]</m
                };
            }
            //private cache: {[key:string]:INode};
            Renderer.prototype.render = function (component) {
                if (typeof component.html === 'undefined')
                    return;
                var root = this.parse(component.html);
                root = this.renderRepeat(root, component);
                var html = this.domToString(root, -1);
                component.element.innerHTML = html;
            };
            Renderer.prototype.parse = function (html, root) {
                if (root === void 0) { root = {}; }
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
                        if (selfClosing && components.Component.registry.hasComponent(type)) {
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
                            root.children.push(result);
                        }
                    }
                    m = html.match(this.r.tag);
                }
                return root;
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
                        });
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
                if (root.html) {
                    html += ("\t");
                    as;
                    any;
                    repeat(indent);
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
                    }).join('\n');
                }
                if (root.type && root.type !== 'TEXT' && !root.selfClosing) {
                    html += ('\t');
                    as;
                    any;
                    repeat(indent);
                    html += '</' + root.type + '>\n';
                }
                return html;
            };
            Renderer.prototype.evaluate = function (models, path) {
                var mi = 0;
                var model = void 0;
                while (mi < models.length && model === undefined) {
                    model = models[mi];
                    try {
                        model = new Function("model", "return model." + path)(model);
                    }
                    catch (e) {
                        model = void 0;
                        mi++;
                    }
                }
                return model;
            };
            Renderer.prototype.copyNode = function (node) {
                var n = {
                    parent: node.parent,
                    html: node.html,
                    type: node.type,
                    selfClosing: node.selfClosing,
                    repeat: node.repeat,
                    children: node.children.map(this.copyNode)
                };
                return n;
            };
            Renderer.prototype.repl = function (str, models) {
                var regex = /{([^{}|]+)}/;
                var regexG = /{([^{}|]+)}/g;
                var m = str.match(regexG);
                if (!m)
                    return str;
                while (m.length) {
                    var path = m[0];
                    path = path.startsWith('{') ? path.substr(1) : path;
                    path = path.endsWith('}') ? path.substr(0, path.length - 1) : path;
                    var value = this.evaluate(models, path);
                    /*
                    var value = undefined;
                    try {
                        with(model)
                            value = eval(path);
                    } catch(e) {}
                    */
                    if (value !== undefined) {
                        if (typeof value === 'function') {
                            value = "Component.getComponent(this)." + path;
                        }
                        str = str.replace(m[0], value);
                    }
                    m = m.slice(1);
                }
                return str;
            };
            return Renderer;
        })();
        components.Renderer = Renderer;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="htmlprovider"/>
/// <reference path="componentsprovider"/>
/// <reference path="renderer"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var RegistryOptions = (function () {
            function RegistryOptions(opt) {
                var _this = this;
                if (opt) {
                    var properties = ['htmlProvider', 'componentProvider', 'renderer'];
                    properties.forEach(function (name) {
                        if (opt.hasOwnAttribute(name))
                            _this[name] = opt[name];
                    });
                }
            }
            return RegistryOptions;
        })();
        components.RegistryOptions = RegistryOptions;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="options"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Registry = (function () {
            function Registry(options) {
                this.components = [];
                this.options = new components.RegistryOptions(options);
            }
            Registry.prototype.register = function (c) {
                this.components.push(c);
                document.createElement(c.name);
            };
            Registry.prototype.run = function () {
                var _this = this;
                this.components.forEach(function (c) {
                    _this.initComponent(c);
                });
            };
            Registry.prototype.initComponent = function (component, element) {
                if (element === void 0) { element = document; }
                Array.prototype.forEach.call(element.querySelectorAll(component.name), function (e) {
                    new component(e);
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
                    return component.name === name;
                }).length > 0;
            };
            Registry.prototype.loadComponent = function (name) {
                return this.options.componentProvider.getComponent(name);
            };
            Registry.prototype.render = function (component) {
                this.options.renderer.render(component);
            };
            return Registry;
        })();
        components.Registry = Registry;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
/// <reference path="./registry"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var Promise = ho.promise.Promise;
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Component = (function () {
            function Component(element) {
                var _this = this;
                this.original_innerHTML = undefined;
                this.properties = [];
                this.requires = [];
                //------- init Elemenet and Elements' originla innerHTML
                this.element = element;
                this.element.component = this;
                this.original_innerHTML = element.innerHTML;
                //-------- init Properties
                this.initProperties();
                //------- call init() & loadRequirements() -> then render
                var ready = [this.init(), this.loadRequirements()];
                Promise.all(ready)
                    .then(function () {
                    _this.render();
                })
                    .catch(function (err) {
                    throw err;
                });
            }
            Component.prototype.init = function () { return new Promise(function (resolve) { resolve(); }); };
            Component.prototype.update = function () { return void 0; };
            Component.prototype.render = function () {
                Component.registry.render(this);
                this.update();
                //this.initChildren();
                Component.registry.initElement(this.element);
            };
            ;
            Component.prototype.initProperties = function () {
                var _this = this;
                this.properties = this.properties.map(function (prop) {
                    return _this.element[prop] || _this.element.getAttribute(prop);
                });
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
                Component.registry = new components.Registry(opt);
                Component.registry.run();
            };
            return Component;
        })();
        components.Component = Component;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
