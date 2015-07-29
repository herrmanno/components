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
                    var src = "components/" + name + ".js";
                    var script = document.createElement('script');
                    script.onload = function () {
                        components.Component.register(window[name]);
                        resolve();
                    };
                    script.src = src;
                    document.getElementsByTagName('head')[0].appendChild(script);
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
/// <reference path="./temp"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
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
                var name = components.Component.getName(component);
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
                    html += tab.repeat(indent);
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
                    html += tab.repeat(indent);
                    html += '</' + root.type + '>\n';
                }
                return html;
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
                this.htmlProvider = new components.HtmlProvider();
                this.componentProvider = new components.ComponentProvider();
                this.renderer = new components.Renderer();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxwcm92aWRlci50cyIsImNvbXBvbmVudHNwcm92aWRlci50cyIsInRlbXAudHMiLCJyZW5kZXJlci50cyIsIm9wdGlvbnMudHMiLCJyZWdpc3RyeS50cyIsImNvbXBvbmVudHMudHMiXSwibmFtZXMiOlsiaG8iLCJoby5jb21wb25lbnRzIiwiaG8uY29tcG9uZW50cy5IdG1sUHJvdmlkZXIiLCJoby5jb21wb25lbnRzLkh0bWxQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuSHRtbFByb3ZpZGVyLmdldEhUTUwiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudFByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnRQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50UHJvdmlkZXIuZ2V0Q29tcG9uZW50IiwiaG8uY29tcG9uZW50cy50ZW1wIiwiaG8uY29tcG9uZW50cy50ZW1wLnNldCIsImhvLmNvbXBvbmVudHMudGVtcC5nZXQiLCJoby5jb21wb25lbnRzLnRlbXAuY2FsbCIsImhvLmNvbXBvbmVudHMuTm9kZSIsImhvLmNvbXBvbmVudHMuTm9kZS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5yZW5kZXIiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLnBhcnNlIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5yZW5kZXJSZXBlYXQiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmRvbVRvU3RyaW5nIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5ldmFsdWF0ZSIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZSIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIuZXZhbHVhdGVWYWx1ZUFuZE1vZGVsIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5ldmFsdWF0ZUV4cHJlc3Npb24iLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmV2YWx1YXRlRnVuY3Rpb24iLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmNvcHlOb2RlIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5yZXBsIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeU9wdGlvbnMiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5T3B0aW9ucy5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5zZXRPcHRpb25zIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5yZWdpc3RlciIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkucnVuIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5pbml0Q29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5pbml0RWxlbWVudCIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkuaGFzQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5sb2FkQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5nZXRIdG1sIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5yZW5kZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0UGFyZW50IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuX2luaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQudXBkYXRlIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucmVuZGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdEhUTUwiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0UHJvcGVydGllcyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRDaGlsZHJlbiIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmxvYWRSZXF1aXJlbWVudHMiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5yZWdpc3RlciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LnJ1biIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldE5hbWUiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sRUFBRSxDQTZCUjtBQTdCRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0E2Qm5CQTtJQTdCU0EsV0FBQUEsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFFbEJDO1lBQUFDO1lBeUJBQyxDQUFDQTtZQXZCR0QsOEJBQU9BLEdBQVBBLFVBQVFBLElBQVlBO2dCQUNoQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7b0JBRS9CQSxJQUFJQSxHQUFHQSxHQUFHQSxnQkFBY0EsSUFBSUEsVUFBT0EsQ0FBQ0E7b0JBRXBDQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtvQkFDNUNBLE9BQU9BLENBQUNBLGtCQUFrQkEsR0FBR0E7d0JBQzVCLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDNUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQzs0QkFDaEMsRUFBRSxDQUFBLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDakMsQ0FBQzs0QkFBQyxJQUFJLENBQUMsQ0FBQztnQ0FDUCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2QsQ0FBQzt3QkFDRixDQUFDO29CQUNGLENBQUMsQ0FBQ0E7b0JBRUZBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVB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QUdBLE1BQU1BLENBQUNBO3dCQUNkQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQTt3QkFDbkJBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO29CQUNoQkEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUNQQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTt3QkFDbEJBLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUNBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUN2Q0EsT0FBT0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0E7d0JBQ3pCQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQTt3QkFDeENBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO3dCQUVwQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsV0FBV0EsSUFBSUEsb0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUN6REEsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0E7NEJBQ3BCQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTs0QkFFeENBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO3dCQUNoQkEsQ0FBQ0E7b0JBQ0ZBLENBQUNBO29CQUVEQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtvQkFFM0RBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO3dCQUNaQSxLQUFLQSxDQUFDQTtvQkFDUEEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUNQQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxXQUFXQSxFQUFFQSxXQUFXQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxFQUFFQSxFQUFFQSxFQUFDQSxDQUFDQSxDQUFDQTt3QkFFbEhBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLE9BQU9BLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBOzRCQUM3QkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ3JFQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTs0QkFDbkJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBOzRCQUNwQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQ2pDQSxDQUFDQTtvQkFDRkEsQ0FBQ0E7b0JBRURBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENB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Q0F4SUF2QyxBQXdJQ3VDLElBQUF2QztRQXhJWUEsb0JBQVNBLFlBd0lyQkEsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUFySlNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBcUpuQkE7QUFBREEsQ0FBQ0EsRUFySk0sRUFBRSxLQUFGLEVBQUUsUUFxSlIiLCJmaWxlIjoiY29tcG9uZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgSHRtbFByb3ZpZGVyIHtcclxuXHJcbiAgICAgICAgZ2V0SFRNTChuYW1lOiBzdHJpbmcpOiBQcm9taXNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gYGNvbXBvbmVudHMvJHtuYW1lfS5odG1sYDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIFx0XHRcdFx0aWYoeG1saHR0cC5yZWFkeVN0YXRlID09IDQpIHtcclxuICAgIFx0XHRcdFx0XHRsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xyXG4gICAgXHRcdFx0XHRcdGlmKHhtbGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwKTtcclxuICAgIFx0XHRcdFx0XHR9IGVsc2Uge1xyXG4gICAgXHRcdFx0XHRcdFx0cmVqZWN0KHJlc3ApO1xyXG4gICAgXHRcdFx0XHRcdH1cclxuICAgIFx0XHRcdFx0fVxyXG4gICAgXHRcdFx0fTtcclxuXHJcbiAgICBcdFx0XHR4bWxodHRwLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICBcdFx0XHR4bWxodHRwLnNlbmQoKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59XHJcbiIsIm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50UHJvdmlkZXIge1xyXG5cclxuICAgICAgICBnZXRDb21wb25lbnQobmFtZTogc3RyaW5nKTogUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gYGNvbXBvbmVudHMvJHtuYW1lfS5qc2A7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdGVyKHdpbmRvd1tuYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJcbm1vZHVsZSBoby5jb21wb25lbnRzLnRlbXAge1xuXHRcdHZhciBjOiBudW1iZXIgPSAtMTtcblx0XHR2YXIgZGF0YTogYW55W10gPSBbXTtcblxuXHRcdGV4cG9ydCBmdW5jdGlvbiBzZXQoZDogYW55KTogbnVtYmVyIHtcblx0XHRcdGMrKztcblx0XHRcdGRhdGFbY10gPSBkO1xuXHRcdFx0cmV0dXJuIGM7XG5cdFx0fVxuXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGdldChpOiBudW1iZXIpOiBhbnkge1xuXHRcdFx0cmV0dXJuIGRhdGFbaV07XG5cdFx0fVxuXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGNhbGwoaTogbnVtYmVyLCAuLi5hcmdzKTogdm9pZCB7XG5cdFx0XHRkYXRhW2ldKC4uLmFyZ3MpO1xuXHRcdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3RlbXBcIi8+XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgaW50ZXJmYWNlIE5vZGVIdG1sIHtcclxuICAgICAgICByb290OiBOb2RlO1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBOb2RlIHtcclxuICAgICAgICBodG1sOiBzdHJpbmc7XHJcbiAgICAgICAgcGFyZW50OiBOb2RlO1xyXG4gICAgICAgIGNoaWxkcmVuOiBBcnJheTxOb2RlPiA9IFtdO1xyXG4gICAgICAgIHR5cGU6IHN0cmluZztcclxuICAgICAgICBzZWxmQ2xvc2luZzogYm9vbGVhbjtcclxuICAgICAgICByZXBlYXQ6IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByOiBhbnkgPSB7XHJcblx0XHRcdHRhZzogLzwoW14+XSo/KD86KD86KCd8XCIpW14nXCJdKj9cXDIpW14+XSo/KSopPi8sXHJcblx0XHRcdHJlcGVhdDogL3JlcGVhdD1bXCJ8J10uK1tcInwnXS8sXHJcblx0XHRcdHR5cGU6IC9bXFxzfC9dKiguKj8pW1xcc3xcXC98Pl0vLFxyXG5cdFx0XHR0ZXh0OiAvKD86LnxbXFxyXFxuXSkqP1teXCInXFxcXF08L20sXHJcblx0XHR9O1xyXG5cclxuICAgICAgICBwcml2YXRlIGNhY2hlOiB7W2tleTpzdHJpbmddOk5vZGV9ID0ge307XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYodHlwZW9mIGNvbXBvbmVudC5odG1sID09PSAnYm9vbGVhbicgJiYgIWNvbXBvbmVudC5odG1sKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWUgPSBDb21wb25lbnQuZ2V0TmFtZShjb21wb25lbnQpO1xyXG4gICAgICAgICAgICBsZXQgcm9vdCA9IHRoaXMuY2FjaGVbbmFtZV0gPSB0aGlzLmNhY2hlW25hbWVdIHx8IHRoaXMucGFyc2UoY29tcG9uZW50Lmh0bWwpLnJvb3Q7XHJcbiAgICAgICAgICAgIHJvb3QgPSB0aGlzLnJlbmRlclJlcGVhdCh0aGlzLmNvcHlOb2RlKHJvb3QpLCBjb21wb25lbnQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSB0aGlzLmRvbVRvU3RyaW5nKHJvb3QsIC0xKTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5lbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblx0XHRwcml2YXRlIHBhcnNlKGh0bWw6IHN0cmluZywgcm9vdD0gbmV3IE5vZGUoKSk6IE5vZGVIdG1sIHtcclxuXHJcblx0XHRcdHZhciBtO1xyXG5cdFx0XHR3aGlsZSgobSA9IHRoaXMuci50YWcuZXhlYyhodG1sKSkgIT09IG51bGwpIHtcclxuXHRcdFx0XHR2YXIgdGFnLCB0eXBlLCBjbG9zaW5nLCBzZWxmQ2xvc2luZywgcmVwZWF0LCB1bkNsb3NlO1xyXG5cdFx0XHRcdC8vLS0tLS0tLSBmb3VuZCBzb21lIHRleHQgYmVmb3JlIG5leHQgdGFnXHJcblx0XHRcdFx0aWYobS5pbmRleCAhPT0gMCkge1xyXG5cdFx0XHRcdFx0dGFnID0gaHRtbC5tYXRjaCh0aGlzLnIudGV4dClbMF07XHJcblx0XHRcdFx0XHR0YWcgPSB0YWcuc3Vic3RyKDAsIHRhZy5sZW5ndGgtMSk7XHJcblx0XHRcdFx0XHR0eXBlID0gJ1RFWFQnO1xyXG5cdFx0XHRcdFx0c2VsZkNsb3NpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdFx0cmVwZWF0ID0gZmFsc2U7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRhZyA9IG1bMV0udHJpbSgpO1xyXG5cdFx0XHRcdFx0dHlwZSA9ICh0YWcrJz4nKS5tYXRjaCh0aGlzLnIudHlwZSlbMV07XHJcblx0XHRcdFx0XHRjbG9zaW5nID0gdGFnWzBdID09PSAnLyc7XHJcblx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IHRhZ1t0YWcubGVuZ3RoLTFdID09PSAnLyc7XHJcblx0XHRcdFx0XHRyZXBlYXQgPSAhIXRhZy5tYXRjaCh0aGlzLnIucmVwZWF0KTtcclxuXHJcblx0XHRcdFx0XHRpZihzZWxmQ2xvc2luZyAmJiBDb21wb25lbnQucmVnaXN0cnkuaGFzQ29tcG9uZW50KHR5cGUpKSB7XHJcblx0XHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHRhZyA9IHRhZy5zdWJzdHIoMCwgdGFnLmxlbmd0aC0xKSArIFwiIFwiO1xyXG5cclxuXHRcdFx0XHRcdFx0dW5DbG9zZSA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRodG1sID0gaHRtbC5zbGljZSh0YWcubGVuZ3RoICsgKHR5cGUgPT09ICdURVhUJyA/IDAgOiAyKSApO1xyXG5cclxuXHRcdFx0XHRpZihjbG9zaW5nKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHtwYXJlbnQ6IHJvb3QsIGh0bWw6IHRhZywgdHlwZTogdHlwZSwgc2VsZkNsb3Npbmc6IHNlbGZDbG9zaW5nLCByZXBlYXQ6IHJlcGVhdCwgY2hpbGRyZW46IFtdfSk7XHJcblxyXG5cdFx0XHRcdFx0aWYoIXVuQ2xvc2UgJiYgIXNlbGZDbG9zaW5nKSB7XHJcblx0XHRcdFx0XHRcdHZhciByZXN1bHQgPSB0aGlzLnBhcnNlKGh0bWwsIHJvb3QuY2hpbGRyZW5bcm9vdC5jaGlsZHJlbi5sZW5ndGgtMV0pO1xyXG5cdFx0XHRcdFx0XHRodG1sID0gcmVzdWx0Lmh0bWw7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucG9wKCk7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4ucHVzaChyZXN1bHQucm9vdCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRtID0gaHRtbC5tYXRjaCh0aGlzLnIudGFnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtyb290OiByb290LCBodG1sOiBodG1sfTtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIHJlbmRlclJlcGVhdChyb290LCBtb2RlbHMpOiBOb2RlIHtcclxuXHRcdFx0bW9kZWxzID0gW10uY29uY2F0KG1vZGVscyk7XHJcblxyXG5cdFx0XHRmb3IodmFyIGMgPSAwOyBjIDwgcm9vdC5jaGlsZHJlbi5sZW5ndGg7IGMrKykge1xyXG5cdFx0XHRcdHZhciBjaGlsZCA9IHJvb3QuY2hpbGRyZW5bY107XHJcblx0XHRcdFx0aWYoY2hpbGQucmVwZWF0KSB7XHJcblx0XHRcdFx0XHR2YXIgcmVnZXggPSAvcmVwZWF0PVtcInwnXVxccyooXFxTKylcXHMrYXNcXHMrKFxcUys/KVtcInwnXS87XHJcblx0XHRcdFx0XHR2YXIgbSA9IGNoaWxkLmh0bWwubWF0Y2gocmVnZXgpLnNsaWNlKDEpO1xyXG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBtWzFdO1xyXG5cdFx0XHRcdFx0dmFyIGluZGV4TmFtZTtcclxuXHRcdFx0XHRcdGlmKG5hbWUuaW5kZXhPZignLCcpID4gLTEpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG5hbWVzID0gbmFtZS5zcGxpdCgnLCcpO1xyXG5cdFx0XHRcdFx0XHRuYW1lID0gbmFtZXNbMF0udHJpbSgpO1xyXG5cdFx0XHRcdFx0XHRpbmRleE5hbWUgPSBuYW1lc1sxXS50cmltKCk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dmFyIG1vZGVsID0gdGhpcy5ldmFsdWF0ZShtb2RlbHMsIG1bMF0pO1xyXG5cclxuXHRcdFx0XHRcdHZhciBob2xkZXIgPSBbXTtcclxuXHRcdFx0XHRcdG1vZGVsLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcblx0XHRcdFx0XHRcdHZhciBtb2RlbDIgPSB7fTtcclxuXHRcdFx0XHRcdFx0bW9kZWwyW25hbWVdID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdG1vZGVsMltpbmRleE5hbWVdID0gaW5kZXg7XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgbW9kZWxzMiA9IFtdLmNvbmNhdChtb2RlbHMpO1xyXG5cdFx0XHRcdFx0XHRtb2RlbHMyLnVuc2hpZnQobW9kZWwyKTtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBub2RlID0gdGhpcy5jb3B5Tm9kZShjaGlsZCk7XHJcblx0XHRcdFx0XHRcdG5vZGUucmVwZWF0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdG5vZGUuaHRtbCA9IG5vZGUuaHRtbC5yZXBsYWNlKHRoaXMuci5yZXBlYXQsICcnKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5odG1sID0gdGhpcy5yZXBsKG5vZGUuaHRtbCwgbW9kZWxzMik7XHJcblxyXG5cdFx0XHRcdFx0XHRub2RlID0gdGhpcy5yZW5kZXJSZXBlYXQobm9kZSwgbW9kZWxzMik7XHJcblxyXG5cdFx0XHRcdFx0XHQvL3Jvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDAsIG5vZGUpO1xyXG5cdFx0XHRcdFx0XHRob2xkZXIucHVzaChub2RlKTtcclxuXHRcdFx0XHRcdH0uYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0XHRcdFx0aG9sZGVyLmZvckVhY2goZnVuY3Rpb24obikge1xyXG5cdFx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAwLCBuKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNoaWxkLmh0bWwgPSB0aGlzLnJlcGwoY2hpbGQuaHRtbCwgbW9kZWxzKTtcclxuXHRcdFx0XHRcdGNoaWxkID0gdGhpcy5yZW5kZXJSZXBlYXQoY2hpbGQsIG1vZGVscyk7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuW2NdID0gY2hpbGQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcm9vdDtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIGRvbVRvU3RyaW5nKHJvb3QsIGluZGVudCk6IHN0cmluZyB7XHJcblx0XHRcdGluZGVudCA9IGluZGVudCB8fCAwO1xyXG5cdFx0XHR2YXIgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCB0YWI6IGFueSA9ICdcXHQnO1xyXG5cclxuXHRcdFx0aWYocm9vdC5odG1sKSB7XHJcblx0XHRcdFx0aHRtbCArPSB0YWIucmVwZWF0KGluZGVudCk7XHJcblx0XHRcdFx0aWYocm9vdC50eXBlICE9PSAnVEVYVCcpXHJcblx0XHRcdFx0XHRodG1sICs9ICc8JyArIHJvb3QuaHRtbCArICc+JztcclxuXHRcdFx0XHRlbHNlIGh0bWwgKz0gcm9vdC5odG1sO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihodG1sKVxyXG5cdFx0XHRcdGh0bWwgKz0gJ1xcbic7XHJcblxyXG5cdFx0XHRpZihyb290LmNoaWxkcmVuLmxlbmd0aCkge1xyXG5cdFx0XHRcdGh0bWwgKz0gcm9vdC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9tVG9TdHJpbmcoYywgaW5kZW50Kyhyb290LnR5cGUgPyAxIDogMikpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzKSkuam9pbignXFxuJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHJvb3QudHlwZSAmJiByb290LnR5cGUgIT09ICdURVhUJyAmJiAhcm9vdC5zZWxmQ2xvc2luZykge1xyXG5cdFx0XHRcdGh0bWwgKz0gdGFiLnJlcGVhdChpbmRlbnQpO1xyXG5cdFx0XHRcdGh0bWwgKz0gJzwvJytyb290LnR5cGUrJz5cXG4nO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gaHRtbDtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZShtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgICAgICBpZihwYXRoWzBdID09PSAneycgJiYgcGF0aFstLXBhdGgubGVuZ3RoXSA9PT0gJ30nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVscywgcGF0aC5zdWJzdHIoMSwgcGF0aC5sZW5ndGgtMikpXHJcbiAgICAgICAgICAgIGVsc2UgaWYocGF0aFswXSA9PT0gJyMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVGdW5jdGlvbihtb2RlbHMsIHBhdGguc3Vic3RyKDEpKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVWYWx1ZShtb2RlbHMsIHBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBldmFsdWF0ZVZhbHVlKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHMsIHBhdGgpLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcblx0XHRwcml2YXRlIGV2YWx1YXRlVmFsdWVBbmRNb2RlbChtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiB7dmFsdWU6IGFueSwgbW9kZWw6IGFueX0ge1xyXG5cdFx0XHRpZihtb2RlbHMuaW5kZXhPZih3aW5kb3cpID09IC0xKVxyXG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2god2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKFwibW9kZWxcIiwgXCJyZXR1cm4gbW9kZWxbJ1wiICsgcGF0aC5zcGxpdChcIi5cIikuam9pbihcIiddWydcIikgKyBcIiddXCIpKG1vZGVsKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcInZhbHVlXCI6IG1vZGVsLCBcIm1vZGVsXCI6IG1vZGVsc1stLW1pXX07XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZXZhbHVhdGVFeHByZXNzaW9uKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcblx0XHRcdGlmKG1vZGVscy5pbmRleE9mKHdpbmRvdykgPT0gLTEpXHJcbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaCh3aW5kb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1pID0gMDtcclxuXHRcdFx0dmFyIG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHR3aGlsZShtaSA8IG1vZGVscy5sZW5ndGggJiYgbW9kZWwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG1vZGVsID0gbW9kZWxzW21pXTtcclxuXHRcdFx0XHR0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aChtb2RlbCkgbW9kZWwgPSBldmFsKHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsID0gbmV3IEZ1bmN0aW9uKE9iamVjdC5rZXlzKG1vZGVsKS50b1N0cmluZygpLCBcInJldHVybiBcIiArIHBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBseShudWxsLCBPYmplY3Qua2V5cyhtb2RlbCkubWFwKChrKSA9PiB7cmV0dXJuIG1vZGVsW2tdfSkgKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1vZGVsO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlRnVuY3Rpb24obW9kZWxzOiBhbnlbXSwgcGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICAgICAgbGV0IGV4cCA9IHRoaXMuZXZhbHVhdGVFeHByZXNzaW9uLmJpbmQodGhpcywgbW9kZWxzKTtcclxuXHRcdFx0dmFyIFtuYW1lLCBhcmdzXSA9IHBhdGguc3BsaXQoJygnKTtcclxuICAgICAgICAgICAgYXJncyA9IGFyZ3Muc3Vic3RyKDAsIC0tYXJncy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHt2YWx1ZSwgbW9kZWx9ID0gdGhpcy5ldmFsdWF0ZVZhbHVlQW5kTW9kZWwobW9kZWxzLCBuYW1lKTtcclxuICAgICAgICAgICAgbGV0IGZ1bmM6IEZ1bmN0aW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGxldCBhcmdBcnI6IHN0cmluZ1tdID0gYXJncy5zcGxpdCgnLicpLm1hcCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnLmluZGV4T2YoJyMnKSA9PT0gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnLnN1YnN0cigxKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwKGFyZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuYyA9IGZ1bmMuYmluZChtb2RlbCwgLi4uYXJnQXJyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhvLmNvbXBvbmVudHMudGVtcC5zZXQoZnVuYyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RyID0gYGhvLmNvbXBvbmVudHMudGVtcC5jYWxsKCR7aW5kZXh9KWA7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBjb3B5Tm9kZShub2RlOiBOb2RlKTogTm9kZSB7XHJcblx0XHRcdHZhciBjb3B5Tm9kZSA9IHRoaXMuY29weU5vZGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBuID0gPE5vZGU+e1xyXG5cdFx0XHRcdHBhcmVudDogbm9kZS5wYXJlbnQsXHJcblx0XHRcdFx0aHRtbDogbm9kZS5odG1sLFxyXG5cdFx0XHRcdHR5cGU6IG5vZGUudHlwZSxcclxuXHRcdFx0XHRzZWxmQ2xvc2luZzogbm9kZS5zZWxmQ2xvc2luZyxcclxuXHRcdFx0XHRyZXBlYXQ6IG5vZGUucmVwZWF0LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBub2RlLmNoaWxkcmVuLm1hcChjb3B5Tm9kZSlcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHJldHVybiBuO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRwcml2YXRlIHJlcGwoc3RyOiBzdHJpbmcsIG1vZGVsczogYW55W10pOiBzdHJpbmcge1xyXG5cdFx0XHR2YXIgcmVnZXhHID0gL3soLis/KX19Py9nO1xyXG5cclxuXHRcdFx0dmFyIG0gPSBzdHIubWF0Y2gocmVnZXhHKTtcclxuXHRcdFx0aWYoIW0pXHJcblx0XHRcdFx0cmV0dXJuIHN0cjtcclxuXHJcblx0XHRcdHdoaWxlKG0ubGVuZ3RoKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSBtWzBdO1xyXG5cdFx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cigxLCBwYXRoLmxlbmd0aC0yKTtcclxuXHJcblx0XHRcdFx0dmFyIHZhbHVlID0gdGhpcy5ldmFsdWF0ZShtb2RlbHMsIHBhdGgpO1xyXG5cclxuXHRcdFx0XHRpZih2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRpZih0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBcImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmdldENvbXBvbmVudCh0aGlzKS5cIitwYXRoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UobVswXSwgdmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bSA9IG0uc2xpY2UoMSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBzdHI7XHJcblx0XHR9XHJcbiAgICB9XHJcblxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJodG1scHJvdmlkZXJcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjb21wb25lbnRzcHJvdmlkZXJcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZW5kZXJlclwiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVnaXN0cnlPcHRpb25zIHtcclxuICAgICAgICBodG1sUHJvdmlkZXI6IEh0bWxQcm92aWRlciA9IG5ldyBIdG1sUHJvdmlkZXIoKTtcclxuICAgICAgICBjb21wb25lbnRQcm92aWRlcjogQ29tcG9uZW50UHJvdmlkZXIgPSBuZXcgQ29tcG9uZW50UHJvdmlkZXIoKTtcclxuICAgICAgICByZW5kZXJlcjogUmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3Iob3B0PzogYW55KSB7XHJcbiAgICAgICAgICAgIGlmIChvcHQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0aWVzID0gWydodG1sUHJvdmlkZXInLCAnY29tcG9uZW50UHJvdmlkZXInLCAncmVuZGVyZXInXTtcclxuXHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0Lmhhc093bkF0dHJpYnV0ZShuYW1lKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tuYW1lXSA9IG9wdFtuYW1lXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJvcHRpb25zXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZWdpc3RyeSB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgb3B0aW9uczogUmVnaXN0cnlPcHRpb25zO1xyXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50czogQXJyYXk8dHlwZW9mIENvbXBvbmVudD4gPSBbXTtcclxuICAgICAgICBwcml2YXRlIGh0bWxNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XHJcblxyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBSZWdpc3RyeU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0T3B0aW9ucyhvcHRpb25zPzogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBSZWdpc3RyeU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChDb21wb25lbnQuZ2V0TmFtZShjKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcnVuKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMuZm9yRWFjaCgoYyk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENvbXBvbmVudChjKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdENvbXBvbmVudChjb21wb25lbnQ6IHR5cGVvZiBDb21wb25lbnQsIGVsZW1lbnQ6SFRNTEVsZW1lbnR8RG9jdW1lbnQ9ZG9jdW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoQ29tcG9uZW50LmdldE5hbWUoY29tcG9uZW50KSksIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRuZXcgY29tcG9uZW50KGUpLl9pbml0KCk7XHJcblx0XHRcdH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluaXRFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENvbXBvbmVudChjb21wb25lbnQsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBoYXNDb21wb25lbnQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChjb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50LmdldE5hbWUoY29tcG9uZW50KSA9PT0gbmFtZTtcclxuICAgICAgICAgICAgICAgIH0pLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9hZENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBQcm9taXNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQobmFtZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRIdG1sKG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICBsZXQgcCA9IG5ldyBQcm9taXNlKCk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmh0bWxNYXBbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKHRoaXMuaHRtbE1hcFtuYW1lXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5odG1sUHJvdmlkZXIuZ2V0SFRNTChuYW1lKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBwLnJlc29sdmUoaHRtbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVuZGVyKGNvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlci5yZW5kZXIoY29tcG9uZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JlZ2lzdHJ5XCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby1wcm9taXNlL2Rpc3QvZC50cy9wcm9taXNlLmQudHNcIi8+XHJcbmltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgICAgICBjb21wb25lbnQ/OiBDb21wb25lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJUHJvcHJldHkge1xyXG4gICAgICAgIG5hbWU6IHN0cmluZztcclxuICAgICAgICByZXF1aXJlZD86IGJvb2xlYW47XHJcbiAgICAgICAgZGVmYXVsdD86IGFueTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcclxuICAgICAgICBlbGVtZW50OiBDb21wb25lbnRFbGVtZW50O1xyXG4gICAgICAgIG9yaWdpbmFsX2lubmVySFRNTDogc3RyaW5nO1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgICAgICBwcm9wZXJ0aWVzOiBBcnJheTxzdHJpbmd8SVByb3ByZXR5PiA9IFtdO1xyXG4gICAgICAgIHByb3BlcnR5OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xyXG4gICAgICAgIHJlcXVpcmVzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICAgICAgY2hpbGRyZW46IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XHJcblxyXG4gICAgICAgIHN0YXRpYyByZWdpc3RyeTogUmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTtcclxuICAgICAgICAvL3N0YXRpYyBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLSBpbml0IEVsZW1lbmV0IGFuZCBFbGVtZW50cycgb3JpZ2luYWwgaW5uZXJIVE1MXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jb21wb25lbnQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsX2lubmVySFRNTCA9IGVsZW1lbnQuaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBhcmVudCgpOiBDb21wb25lbnQge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50LmdldENvbXBvbmVudCg8Q29tcG9uZW50RWxlbWVudD50aGlzLmVsZW1lbnQucGFyZW50Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgX2luaXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0tIGluaXQgUHJvcGVydGllc1xyXG4gICAgICAgICAgICB0aGlzLmluaXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICAvLy0tLS0tLS0gY2FsbCBpbml0KCkgJiBsb2FkUmVxdWlyZW1lbnRzKCkgLT4gdGhlbiByZW5kZXJcclxuICAgICAgICAgICAgbGV0IHJlYWR5ID0gW3RoaXMuaW5pdEhUTUwoKSwgUHJvbWlzZS5jcmVhdGUodGhpcy5pbml0KCkpLCB0aGlzLmxvYWRSZXF1aXJlbWVudHMoKV07XHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHJlYWR5KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdCgpOiBhbnkge31cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtyZXR1cm4gdm9pZCAwO31cclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgIFx0XHRDb21wb25lbnQucmVnaXN0cnkucmVuZGVyKHRoaXMpO1xyXG5cclxuXHRcdFx0dGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICBcdFx0dGhpcy5pbml0Q2hpbGRyZW4oKTtcclxuXHJcbiAgICBcdFx0Q29tcG9uZW50LnJlZ2lzdHJ5LmluaXRFbGVtZW50KHRoaXMuZWxlbWVudCk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogIEFzc3VyZSB0aGF0IHRoaXMgaW5zdGFuY2UgaGFzIGFuIHZhbGlkIGh0bWwgYXR0cmlidXRlIGFuZCBpZiBub3QgbG9hZCBpdC5cclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaW5pdEhUTUwoKTogUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gbmV3IFByb21pc2UoKTtcclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ2Jvb2xlYW4nKVxyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmh0bWwgPT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgcC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmh0bWwgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IENvbXBvbmVudC5nZXROYW1lKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdHJ5LmdldEh0bWwobmFtZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5odG1sID0gaHRtbDtcclxuICAgICAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2gocC5yZWplY3QpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdFByb3BlcnRpZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcGVydGllc1twcm9wLm5hbWVdID0gdGhpcy5lbGVtZW50W3Byb3AubmFtZV0gfHwgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShwcm9wLm5hbWUpIHx8IHByb3AuZGVmYXVsdDtcclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnByb3BlcnRpZXNbcHJvcC5uYW1lXSA9PT0gdW5kZWZpbmVkICYmIHByb3AucmVxdWlyZWQgPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGBQcm9wZXJ0eSAke3Byb3AubmFtZX0gaXMgcmVxdWlyZWQgYnV0IG5vdCBwcm92aWRlZGA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BlcnRpZXNbcHJvcF0gPSB0aGlzLmVsZW1lbnRbcHJvcF0gfHwgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShwcm9wKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdENoaWxkcmVuKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGRzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcclxuICAgIFx0XHRmb3IobGV0IGMgPSAwOyBjIDwgY2hpbGRzLmxlbmd0aDsgYysrKSB7XHJcbiAgICBcdFx0XHRsZXQgY2hpbGQgPSBjaGlsZHNbY107XHJcbiAgICBcdFx0XHRpZihjaGlsZC5pZCkge1xyXG4gICAgXHRcdFx0XHR0aGlzLmNoaWxkcmVuW2NoaWxkLmlkXSA9IGNoaWxkO1xyXG4gICAgXHRcdFx0fVxyXG4gICAgXHRcdFx0dGhpcy5jaGlsZHJlbltjaGlsZC50YWdOYW1lXSA9IHRoaXMuY2hpbGRyZW5bY2hpbGQudGFnTmFtZV0gfHwgW107XHJcbiAgICAgICAgICAgICAgICAoPEVsZW1lbnRbXT50aGlzLmNoaWxkcmVuW2NoaWxkLnRhZ05hbWVdKS5wdXNoKGNoaWxkKTtcclxuICAgIFx0XHR9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGxvYWRSZXF1aXJlbWVudHMoKSB7XHJcbiAgICBcdFx0bGV0IHByb21pc2VzID0gdGhpcy5yZXF1aXJlc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhQ29tcG9uZW50LnJlZ2lzdHJ5Lmhhc0NvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAubWFwKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQucmVnaXN0cnkubG9hZENvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIHN0YXRpYyByZWdpc3RlcihjOiB0eXBlb2YgQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3RyeS5yZWdpc3RlcihjKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBydW4ob3B0PzogYW55KSB7XHJcbiAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3RyeS5zZXRPcHRpb25zKG9wdCk7XHJcbiAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3RyeS5ydW4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBnZXRDb21wb25lbnQoZWxlbWVudDogQ29tcG9uZW50RWxlbWVudCk6IENvbXBvbmVudCB7XHJcbiAgICAgICAgICAgIHdoaWxlKCFlbGVtZW50LmNvbXBvbmVudClcclxuICAgIFx0XHRcdGVsZW1lbnQgPSA8Q29tcG9uZW50RWxlbWVudD5lbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICBcdFx0cmV0dXJuIGVsZW1lbnQuY29tcG9uZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGdldE5hbWUoY2xheno6IHR5cGVvZiBDb21wb25lbnQgfCBDb21wb25lbnQpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBpZihjbGF6eiBpbnN0YW5jZW9mIENvbXBvbmVudClcclxuICAgICAgICAgICAgICAgIHJldHVybiBjbGF6ei5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xhenoudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=