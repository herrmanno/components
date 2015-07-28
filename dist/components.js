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
                /*
                return new Promise((resolve, reject) => {
    
                    let url = `components/${name}.js`;
    
                    let xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        if(xmlhttp.readyState == 4) {
                            let resp = xmlhttp.responseText;
                            if(xmlhttp.status == 200) {
                                let func = resp + "\nreturn  " + name +  "\n//#sourceURL=" + location.origin + '/' + 'url;'
                                let component = new Function("", func)();
                                Component.register(component);
                                resolve(resp);
                            } else {
                                reject(resp);
                            }
                        }
                    };
    
                    xmlhttp.open('GET', url, true);
                    xmlhttp.send();
    
                });
            */
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
        var Node = (function () {
            function Node() {
                this.children = [];
            }
            return Node;
        })();
        var Renderer = (function () {
            function Renderer() {
                this.tmpCount = 0;
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
                return model;
            };
            Renderer.prototype.evaluateExpression = function (models, path) {
                if (models.indexOf(window) == -1)
                    models.push(window);
                var mi = 0;
                var model = void 0;
                while (mi < models.length && model === undefined) {
                    model = models[mi];
                    try {
                        with (model)
                            model = eval(path);
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
                var _a = path.split('('), name = _a[0], args = _a[1];
                name = this.evaluateValue(models, name);
                args = args.substr(0, args.length - 2);
                args = args.split['.'] && args.split['.'].map(this.evaluateExpression.bind(this, models));
                window.F = window.F || {};
                window.F[this.tmpCount] = function () {
                    name.apply(this, args);
                };
                var str = "F[" + this.tmpCount + "]()";
                this.tmpCount++;
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
                //var regex = /{([^{}|]+)}/;
                //var regexG = /{([^{}|]+)}/g;
                var regexG = /{(.+?)}}?/g;
                var m = str.match(regexG);
                if (!m)
                    return str;
                while (m.length) {
                    var path = m[0];
                    path = path.substr(1, path.length - 2);
                    //path = path.indexOf('{') === 0 ? path.substr(1) : path;
                    //path = path.indexOf('}') === --path.length ? path.substr(0, path.length-1) : path;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxwcm92aWRlci50cyIsImNvbXBvbmVudHNwcm92aWRlci50cyIsInJlbmRlcmVyLnRzIiwib3B0aW9ucy50cyIsInJlZ2lzdHJ5LnRzIiwiY29tcG9uZW50cy50cyJdLCJuYW1lcyI6WyJobyIsImhvLmNvbXBvbmVudHMiLCJoby5jb21wb25lbnRzLkh0bWxQcm92aWRlciIsImhvLmNvbXBvbmVudHMuSHRtbFByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5IdG1sUHJvdmlkZXIuZ2V0SFRNTCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50UHJvdmlkZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudFByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQiLCJoby5jb21wb25lbnRzLk5vZGUiLCJoby5jb21wb25lbnRzLk5vZGUuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIucmVuZGVyIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5wYXJzZSIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIucmVuZGVyUmVwZWF0IiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5kb21Ub1N0cmluZyIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIuZXZhbHVhdGUiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmV2YWx1YXRlVmFsdWUiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmV2YWx1YXRlRXhwcmVzc2lvbiIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIuZXZhbHVhdGVGdW5jdGlvbiIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIuY29weU5vZGUiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLnJlcGwiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5T3B0aW9ucyIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnlPcHRpb25zLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeSIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LnNldE9wdGlvbnMiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LnJlZ2lzdGVyIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5ydW4iLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LmluaXRDb21wb25lbnQiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LmluaXRFbGVtZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5oYXNDb21wb25lbnQiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LmxvYWRDb21wb25lbnQiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LmdldEh0bWwiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LnJlbmRlciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5nZXRQYXJlbnQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5faW5pdCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC51cGRhdGUiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5yZW5kZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0SFRNTCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRQcm9wZXJ0aWVzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdENoaWxkcmVuIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQubG9hZFJlcXVpcmVtZW50cyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LnJlZ2lzdGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucnVuIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0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QSxHQUFHQSxJQUFJQSxDQUFDQTt3QkFDbkJBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO29CQUNoQkEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUNQQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTt3QkFDbEJBLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUNBLEdBQUdBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUN2Q0EsT0FBT0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0E7d0JBQ3pCQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQTt3QkFDeENBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO3dCQUVwQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsV0FBV0EsSUFBSUEsb0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUN6REEsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0E7NEJBQ3BCQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTs0QkFFeENBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO3dCQUNoQkEsQ0FBQ0E7b0JBQ0ZBLENBQUNBO29CQUVEQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQTtvQkFFM0RBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO3dCQUNaQSxLQUFLQSxDQUFDQTtvQkFDUEEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUNQQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxXQUFXQSxFQUFFQSxXQUFXQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxRQUFRQSxFQUFFQSxFQUFFQSxFQUFDQSxDQUFDQSxDQUFDQTt3QkFFbEhBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLE9BQU9BLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBOzRCQUM3QkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ3JFQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTs0QkFDbkJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBOzRCQUNwQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQ2pDQSxDQUFDQTtvQkFDRkEsQ0FBQ0E7b0JBRURBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO2dCQUM1QkEsQ0FBQ0E7Z0JB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S0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pEQSxJQUFJQTtvQkFDQUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLENBQUNBO1lBNUhNZCxrQkFBUUEsR0FBYUEsSUFBSUEsbUJBQVFBLEVBQUVBLENBQUNBO1lBK0gvQ0EsZ0JBQUNBO1FBQURBLENBeElBbEMsQUF3SUNrQyxJQUFBbEM7UUF4SVlBLG9CQUFTQSxZQXdJckJBLENBQUFBO0lBQ0xBLENBQUNBLEVBckpTRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQXFKbkJBO0FBQURBLENBQUNBLEVBckpNLEVBQUUsS0FBRixFQUFFLFFBcUpSIiwiZmlsZSI6ImNvbXBvbmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEh0bWxQcm92aWRlciB7XHJcblxyXG4gICAgICAgIGdldEhUTUwobmFtZTogc3RyaW5nKTogUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IGBjb21wb25lbnRzLyR7bmFtZX0uaHRtbGA7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIFx0XHRcdHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcdFx0XHRcdGlmKHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0KSB7XHJcbiAgICBcdFx0XHRcdFx0bGV0IHJlc3AgPSB4bWxodHRwLnJlc3BvbnNlVGV4dDtcclxuICAgIFx0XHRcdFx0XHRpZih4bWxodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcCk7XHJcbiAgICBcdFx0XHRcdFx0fSBlbHNlIHtcclxuICAgIFx0XHRcdFx0XHRcdHJlamVjdChyZXNwKTtcclxuICAgIFx0XHRcdFx0XHR9XHJcbiAgICBcdFx0XHRcdH1cclxuICAgIFx0XHRcdH07XHJcblxyXG4gICAgXHRcdFx0eG1saHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJtb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudFByb3ZpZGVyIHtcclxuXHJcbiAgICAgICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IGBjb21wb25lbnRzLyR7bmFtZX0uanNgO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3Rlcih3aW5kb3dbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IGBjb21wb25lbnRzLyR7bmFtZX0uanNgO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICBcdFx0XHR4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXHRcdFx0XHRpZih4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCkge1xyXG4gICAgXHRcdFx0XHRcdGxldCByZXNwID0geG1saHR0cC5yZXNwb25zZVRleHQ7XHJcbiAgICBcdFx0XHRcdFx0aWYoeG1saHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICBcdFx0XHRcdFx0XHRsZXQgZnVuYyA9IHJlc3AgKyBcIlxcbnJldHVybiAgXCIgKyBuYW1lICsgIFwiXFxuLy8jc291cmNlVVJMPVwiICsgbG9jYXRpb24ub3JpZ2luICsgJy8nICsgJ3VybDsnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29tcG9uZW50ID0gbmV3IEZ1bmN0aW9uKFwiXCIsIGZ1bmMpKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21wb25lbnQucmVnaXN0ZXIoY29tcG9uZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcCk7XHJcbiAgICBcdFx0XHRcdFx0fSBlbHNlIHtcclxuICAgIFx0XHRcdFx0XHRcdHJlamVjdChyZXNwKTtcclxuICAgIFx0XHRcdFx0XHR9XHJcbiAgICBcdFx0XHRcdH1cclxuICAgIFx0XHRcdH07XHJcblxyXG4gICAgXHRcdFx0eG1saHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAqL1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59XHJcbiIsIm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBpbnRlcmZhY2UgTm9kZUh0bWwge1xyXG4gICAgICAgIHJvb3Q6IE5vZGU7XHJcbiAgICAgICAgaHRtbDogc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIE5vZGUge1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgICAgICBwYXJlbnQ6IE5vZGU7XHJcbiAgICAgICAgY2hpbGRyZW46IEFycmF5PE5vZGU+ID0gW107XHJcbiAgICAgICAgdHlwZTogc3RyaW5nO1xyXG4gICAgICAgIHNlbGZDbG9zaW5nOiBib29sZWFuO1xyXG4gICAgICAgIHJlcGVhdDogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVuZGVyZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIHRtcENvdW50OiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBwcml2YXRlIHI6IGFueSA9IHtcclxuXHRcdFx0dGFnOiAvPChbXj5dKj8oPzooPzooJ3xcIilbXidcIl0qP1xcMilbXj5dKj8pKik+LyxcclxuXHRcdFx0cmVwZWF0OiAvcmVwZWF0PVtcInwnXS4rW1wifCddLyxcclxuXHRcdFx0dHlwZTogL1tcXHN8L10qKC4qPylbXFxzfFxcL3w+XS8sXHJcblx0XHRcdHRleHQ6IC8oPzoufFtcXHJcXG5dKSo/W15cIidcXFxcXTwvbSxcclxuXHRcdH07XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2FjaGU6IHtba2V5OnN0cmluZ106Tm9kZX0gPSB7fTtcclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcihjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgY29tcG9uZW50Lmh0bWwgPT09ICdib29sZWFuJyAmJiAhY29tcG9uZW50Lmh0bWwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IENvbXBvbmVudC5nZXROYW1lKGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIGxldCByb290ID0gdGhpcy5jYWNoZVtuYW1lXSA9IHRoaXMuY2FjaGVbbmFtZV0gfHwgdGhpcy5wYXJzZShjb21wb25lbnQuaHRtbCkucm9vdDtcclxuICAgICAgICAgICAgcm9vdCA9IHRoaXMucmVuZGVyUmVwZWF0KHRoaXMuY29weU5vZGUocm9vdCksIGNvbXBvbmVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaHRtbCA9IHRoaXMuZG9tVG9TdHJpbmcocm9vdCwgLTEpO1xyXG5cclxuICAgICAgICAgICAgY29tcG9uZW50LmVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHRcdHByaXZhdGUgcGFyc2UoaHRtbDogc3RyaW5nLCByb290PSBuZXcgTm9kZSgpKTogTm9kZUh0bWwge1xyXG5cclxuXHRcdFx0dmFyIG07XHJcblx0XHRcdHdoaWxlKChtID0gdGhpcy5yLnRhZy5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdHZhciB0YWcsIHR5cGUsIGNsb3NpbmcsIHNlbGZDbG9zaW5nLCByZXBlYXQsIHVuQ2xvc2U7XHJcblx0XHRcdFx0Ly8tLS0tLS0tIGZvdW5kIHNvbWUgdGV4dCBiZWZvcmUgbmV4dCB0YWdcclxuXHRcdFx0XHRpZihtLmluZGV4ICE9PSAwKSB7XHJcblx0XHRcdFx0XHR0YWcgPSBodG1sLm1hdGNoKHRoaXMuci50ZXh0KVswXTtcclxuXHRcdFx0XHRcdHRhZyA9IHRhZy5zdWJzdHIoMCwgdGFnLmxlbmd0aC0xKTtcclxuXHRcdFx0XHRcdHR5cGUgPSAnVEVYVCc7XHJcblx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IHRydWU7XHJcblx0XHRcdFx0XHRyZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGFnID0gbVsxXS50cmltKCk7XHJcblx0XHRcdFx0XHR0eXBlID0gKHRhZysnPicpLm1hdGNoKHRoaXMuci50eXBlKVsxXTtcclxuXHRcdFx0XHRcdGNsb3NpbmcgPSB0YWdbMF0gPT09ICcvJztcclxuXHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gdGFnW3RhZy5sZW5ndGgtMV0gPT09ICcvJztcclxuXHRcdFx0XHRcdHJlcGVhdCA9ICEhdGFnLm1hdGNoKHRoaXMuci5yZXBlYXQpO1xyXG5cclxuXHRcdFx0XHRcdGlmKHNlbGZDbG9zaW5nICYmIENvbXBvbmVudC5yZWdpc3RyeS5oYXNDb21wb25lbnQodHlwZSkpIHtcclxuXHRcdFx0XHRcdFx0c2VsZkNsb3NpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0dGFnID0gdGFnLnN1YnN0cigwLCB0YWcubGVuZ3RoLTEpICsgXCIgXCI7XHJcblxyXG5cdFx0XHRcdFx0XHR1bkNsb3NlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGh0bWwgPSBodG1sLnNsaWNlKHRhZy5sZW5ndGggKyAodHlwZSA9PT0gJ1RFWFQnID8gMCA6IDIpICk7XHJcblxyXG5cdFx0XHRcdGlmKGNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnB1c2goe3BhcmVudDogcm9vdCwgaHRtbDogdGFnLCB0eXBlOiB0eXBlLCBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsIHJlcGVhdDogcmVwZWF0LCBjaGlsZHJlbjogW119KTtcclxuXHJcblx0XHRcdFx0XHRpZighdW5DbG9zZSAmJiAhc2VsZkNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2UoaHRtbCwgcm9vdC5jaGlsZHJlbltyb290LmNoaWxkcmVuLmxlbmd0aC0xXSk7XHJcblx0XHRcdFx0XHRcdGh0bWwgPSByZXN1bHQuaHRtbDtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wb3AoKTtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHJlc3VsdC5yb290KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG0gPSBodG1sLm1hdGNoKHRoaXMuci50YWcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge3Jvb3Q6IHJvb3QsIGh0bWw6IGh0bWx9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgcmVuZGVyUmVwZWF0KHJvb3QsIG1vZGVscyk6IE5vZGUge1xyXG5cdFx0XHRtb2RlbHMgPSBbXS5jb25jYXQobW9kZWxzKTtcclxuXHJcblx0XHRcdGZvcih2YXIgYyA9IDA7IGMgPCByb290LmNoaWxkcmVuLmxlbmd0aDsgYysrKSB7XHJcblx0XHRcdFx0dmFyIGNoaWxkID0gcm9vdC5jaGlsZHJlbltjXTtcclxuXHRcdFx0XHRpZihjaGlsZC5yZXBlYXQpIHtcclxuXHRcdFx0XHRcdHZhciByZWdleCA9IC9yZXBlYXQ9W1wifCddXFxzKihcXFMrKVxccythc1xccysoXFxTKz8pW1wifCddLztcclxuXHRcdFx0XHRcdHZhciBtID0gY2hpbGQuaHRtbC5tYXRjaChyZWdleCkuc2xpY2UoMSk7XHJcblx0XHRcdFx0XHR2YXIgbmFtZSA9IG1bMV07XHJcblx0XHRcdFx0XHR2YXIgaW5kZXhOYW1lO1xyXG5cdFx0XHRcdFx0aWYobmFtZS5pbmRleE9mKCcsJykgPiAtMSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KCcsJyk7XHJcblx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lc1swXS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGluZGV4TmFtZSA9IG5hbWVzWzFdLnRyaW0oKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR2YXIgbW9kZWwgPSB0aGlzLmV2YWx1YXRlKG1vZGVscywgbVswXSk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGhvbGRlciA9IFtdO1xyXG5cdFx0XHRcdFx0bW9kZWwuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG1vZGVsMiA9IHt9O1xyXG5cdFx0XHRcdFx0XHRtb2RlbDJbbmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0bW9kZWwyW2luZGV4TmFtZV0gPSBpbmRleDtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBtb2RlbHMyID0gW10uY29uY2F0KG1vZGVscyk7XHJcblx0XHRcdFx0XHRcdG1vZGVsczIudW5zaGlmdChtb2RlbDIpO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLmNvcHlOb2RlKGNoaWxkKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0bm9kZS5odG1sID0gbm9kZS5odG1sLnJlcGxhY2UodGhpcy5yLnJlcGVhdCwgJycpO1xyXG5cdFx0XHRcdFx0XHRub2RlLmh0bWwgPSB0aGlzLnJlcGwobm9kZS5odG1sLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdG5vZGUgPSB0aGlzLnJlbmRlclJlcGVhdChub2RlLCBtb2RlbHMyKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vcm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMCwgbm9kZSk7XHJcblx0XHRcdFx0XHRcdGhvbGRlci5wdXNoKG5vZGUpO1xyXG5cdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRcdFx0XHRob2xkZXIuZm9yRWFjaChmdW5jdGlvbihuKSB7XHJcblx0XHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDAsIG4pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAxKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2hpbGQuaHRtbCA9IHRoaXMucmVwbChjaGlsZC5odG1sLCBtb2RlbHMpO1xyXG5cdFx0XHRcdFx0Y2hpbGQgPSB0aGlzLnJlbmRlclJlcGVhdChjaGlsZCwgbW9kZWxzKTtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW5bY10gPSBjaGlsZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByb290O1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZG9tVG9TdHJpbmcocm9vdCwgaW5kZW50KTogc3RyaW5nIHtcclxuXHRcdFx0aW5kZW50ID0gaW5kZW50IHx8IDA7XHJcblx0XHRcdHZhciBodG1sID0gJyc7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhYjogYW55ID0gJ1xcdCc7XHJcblxyXG5cdFx0XHRpZihyb290Lmh0bWwpIHtcclxuXHRcdFx0XHRodG1sICs9IHRhYi5yZXBlYXQoaW5kZW50KTtcclxuXHRcdFx0XHRpZihyb290LnR5cGUgIT09ICdURVhUJylcclxuXHRcdFx0XHRcdGh0bWwgKz0gJzwnICsgcm9vdC5odG1sICsgJz4nO1xyXG5cdFx0XHRcdGVsc2UgaHRtbCArPSByb290Lmh0bWw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGh0bWwpXHJcblx0XHRcdFx0aHRtbCArPSAnXFxuJztcclxuXHJcblx0XHRcdGlmKHJvb3QuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0aHRtbCArPSByb290LmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb21Ub1N0cmluZyhjLCBpbmRlbnQrKHJvb3QudHlwZSA/IDEgOiAyKSk7XHJcblx0XHRcdFx0fS5iaW5kKHRoaXMpKS5qb2luKCdcXG4nKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYocm9vdC50eXBlICYmIHJvb3QudHlwZSAhPT0gJ1RFWFQnICYmICFyb290LnNlbGZDbG9zaW5nKSB7XHJcblx0XHRcdFx0aHRtbCArPSB0YWIucmVwZWF0KGluZGVudCk7XHJcblx0XHRcdFx0aHRtbCArPSAnPC8nK3Jvb3QudHlwZSsnPlxcbic7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBodG1sO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlKG1vZGVsczogYW55W10sIHBhdGg6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgICAgIGlmKHBhdGhbMF0gPT09ICd7JyAmJiBwYXRoWy0tcGF0aC5sZW5ndGhdID09PSAnfScpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUV4cHJlc3Npb24obW9kZWxzLCBwYXRoLnN1YnN0cigxLCBwYXRoLmxlbmd0aC0yKSlcclxuICAgICAgICAgICAgZWxzZSBpZihwYXRoWzBdID09PSAnIycpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUZ1bmN0aW9uKG1vZGVscywgcGF0aC5zdWJzdHIoMSkpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZVZhbHVlKG1vZGVscywgcGF0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHRcdHByaXZhdGUgZXZhbHVhdGVWYWx1ZShtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0XHRpZihtb2RlbHMuaW5kZXhPZih3aW5kb3cpID09IC0xKVxyXG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2god2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKFwibW9kZWxcIiwgXCJyZXR1cm4gbW9kZWxbJ1wiICsgcGF0aC5zcGxpdChcIi5cIikuam9pbihcIiddWydcIikgKyBcIiddXCIpKG1vZGVsKTtcclxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcclxuXHRcdFx0XHRcdG1vZGVsID0gdm9pZCAwO1xyXG5cdFx0XHRcdH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1vZGVsO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICBwcml2YXRlIGV2YWx1YXRlRXhwcmVzc2lvbihtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0XHRpZihtb2RlbHMuaW5kZXhPZih3aW5kb3cpID09IC0xKVxyXG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2god2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB3aXRoKG1vZGVsKVxyXG5cdFx0ICAgICAgICAgICAgICAgbW9kZWwgPSBldmFsKHBhdGgpO1xyXG5cdFx0XHRcdH0gY2F0Y2goZSkge1xyXG5cdFx0XHRcdFx0bW9kZWwgPSB2b2lkIDA7XHJcblx0XHRcdFx0fSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBtaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gbW9kZWw7XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZXZhbHVhdGVGdW5jdGlvbihtb2RlbHM6IGFueVtdLCBwYXRoOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0XHR2YXIgW25hbWUsIGFyZ3NdID0gcGF0aC5zcGxpdCgnKCcpO1xyXG5cclxuICAgICAgICAgICAgbmFtZSA9IHRoaXMuZXZhbHVhdGVWYWx1ZShtb2RlbHMsIG5hbWUpO1xyXG4gICAgICAgICAgICBhcmdzID0gYXJncy5zdWJzdHIoMCwgYXJncy5sZW5ndGgtMik7XHJcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLnNwbGl0WycuJ10gJiYgYXJncy5zcGxpdFsnLiddLm1hcCh0aGlzLmV2YWx1YXRlRXhwcmVzc2lvbi5iaW5kKHRoaXMsIG1vZGVscykpO1xyXG5cclxuICAgICAgICAgICAgd2luZG93LkYgPSB3aW5kb3cuRiB8fCB7fTtcclxuICAgICAgICAgICAgd2luZG93LkZbdGhpcy50bXBDb3VudF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIG5hbWUuYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RyID0gYEZbJHt0aGlzLnRtcENvdW50fV0oKWA7XHJcbiAgICAgICAgICAgIHRoaXMudG1wQ291bnQrKztcclxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIGNvcHlOb2RlKG5vZGU6IE5vZGUpOiBOb2RlIHtcclxuXHRcdFx0dmFyIGNvcHlOb2RlID0gdGhpcy5jb3B5Tm9kZS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG4gPSA8Tm9kZT57XHJcblx0XHRcdFx0cGFyZW50OiBub2RlLnBhcmVudCxcclxuXHRcdFx0XHRodG1sOiBub2RlLmh0bWwsXHJcblx0XHRcdFx0dHlwZTogbm9kZS50eXBlLFxyXG5cdFx0XHRcdHNlbGZDbG9zaW5nOiBub2RlLnNlbGZDbG9zaW5nLFxyXG5cdFx0XHRcdHJlcGVhdDogbm9kZS5yZXBlYXQsXHJcblx0XHRcdFx0Y2hpbGRyZW46IG5vZGUuY2hpbGRyZW4ubWFwKGNvcHlOb2RlKVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0cmV0dXJuIG47XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdHByaXZhdGUgcmVwbChzdHI6IHN0cmluZywgbW9kZWxzOiBhbnlbXSk6IHN0cmluZyB7XHJcblx0XHRcdC8vdmFyIHJlZ2V4ID0gL3soW157fXxdKyl9LztcclxuXHRcdFx0Ly92YXIgcmVnZXhHID0gL3soW157fXxdKyl9L2c7XHJcblxyXG5cdFx0XHR2YXIgcmVnZXhHID0gL3soLis/KX19Py9nO1xyXG5cclxuXHRcdFx0dmFyIG0gPSBzdHIubWF0Y2gocmVnZXhHKTtcclxuXHRcdFx0aWYoIW0pXHJcblx0XHRcdFx0cmV0dXJuIHN0cjtcclxuXHJcblx0XHRcdHdoaWxlKG0ubGVuZ3RoKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSBtWzBdO1xyXG5cdFx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cigxLCBwYXRoLmxlbmd0aC0yKTtcclxuICAgICAgICAgICAgICAgIC8vcGF0aCA9IHBhdGguaW5kZXhPZigneycpID09PSAwID8gcGF0aC5zdWJzdHIoMSkgOiBwYXRoO1xyXG5cdFx0XHRcdC8vcGF0aCA9IHBhdGguaW5kZXhPZignfScpID09PSAtLXBhdGgubGVuZ3RoID8gcGF0aC5zdWJzdHIoMCwgcGF0aC5sZW5ndGgtMSkgOiBwYXRoO1xyXG5cclxuXHRcdFx0XHR2YXIgdmFsdWUgPSB0aGlzLmV2YWx1YXRlKG1vZGVscywgcGF0aCk7XHJcblxyXG5cdFx0XHRcdGlmKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0XHR2YWx1ZSA9IFwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuZ2V0Q29tcG9uZW50KHRoaXMpLlwiK3BhdGg7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzdHIgPSBzdHIucmVwbGFjZShtWzBdLCB2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRtID0gbS5zbGljZSgxKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHN0cjtcclxuXHRcdH1cclxuICAgIH1cclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImh0bWxwcm92aWRlclwiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNvbXBvbmVudHNwcm92aWRlclwiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInJlbmRlcmVyXCIvPlxyXG5cclxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZWdpc3RyeU9wdGlvbnMge1xyXG4gICAgICAgIGh0bWxQcm92aWRlcjogSHRtbFByb3ZpZGVyID0gbmV3IEh0bWxQcm92aWRlcigpO1xyXG4gICAgICAgIGNvbXBvbmVudFByb3ZpZGVyOiBDb21wb25lbnRQcm92aWRlciA9IG5ldyBDb21wb25lbnRQcm92aWRlcigpO1xyXG4gICAgICAgIHJlbmRlcmVyOiBSZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHQ/OiBhbnkpIHtcclxuICAgICAgICAgICAgaWYgKG9wdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHByb3BlcnRpZXMgPSBbJ2h0bWxQcm92aWRlcicsICdjb21wb25lbnRQcm92aWRlcicsICdyZW5kZXJlciddO1xyXG5cclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHQuaGFzT3duQXR0cmlidXRlKG5hbWUpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW25hbWVdID0gb3B0W25hbWVdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm9wdGlvbnNcIi8+XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5IHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBvcHRpb25zOiBSZWdpc3RyeU9wdGlvbnM7XHJcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRzOiBBcnJheTx0eXBlb2YgQ29tcG9uZW50PiA9IFtdO1xyXG4gICAgICAgIHByaXZhdGUgaHRtbE1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcclxuXHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gbmV3IFJlZ2lzdHJ5T3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRPcHRpb25zKG9wdGlvbnM/OiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gbmV3IFJlZ2lzdHJ5T3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyByZWdpc3RlcihjOiB0eXBlb2YgQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGMpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KENvbXBvbmVudC5nZXROYW1lKGMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBydW4oKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcG9uZW50cy5mb3JFYWNoKChjKT0+e1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q29tcG9uZW50KGMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0Q29tcG9uZW50KGNvbXBvbmVudDogdHlwZW9mIENvbXBvbmVudCwgZWxlbWVudDpIVE1MRWxlbWVudHxEb2N1bWVudD1kb2N1bWVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChDb21wb25lbnQuZ2V0TmFtZShjb21wb25lbnQpKSwgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdG5ldyBjb21wb25lbnQoZSkuX2luaXQoKTtcclxuXHRcdFx0fSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdEVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q29tcG9uZW50KGNvbXBvbmVudCwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQuZ2V0TmFtZShjb21wb25lbnQpID09PSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudChuYW1lKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEh0bWwobmFtZTogc3RyaW5nKTogUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gbmV3IFByb21pc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuaHRtbE1hcFtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwLnJlc29sdmUodGhpcy5odG1sTWFwW25hbWVdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmh0bWxQcm92aWRlci5nZXRIVE1MKG5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHAucmVzb2x2ZShodG1sKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnJlbmRlcmVyLnJlbmRlcihjb21wb25lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVnaXN0cnlcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cclxuaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGNvbXBvbmVudD86IENvbXBvbmVudDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElQcm9wcmV0eSB7XHJcbiAgICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcclxuICAgICAgICBkZWZhdWx0PzogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xyXG4gICAgICAgIGVsZW1lbnQ6IENvbXBvbmVudEVsZW1lbnQ7XHJcbiAgICAgICAgb3JpZ2luYWxfaW5uZXJIVE1MOiBzdHJpbmc7XHJcbiAgICAgICAgaHRtbDogc3RyaW5nO1xyXG4gICAgICAgIHByb3BlcnRpZXM6IEFycmF5PHN0cmluZ3xJUHJvcHJldHk+ID0gW107XHJcbiAgICAgICAgcHJvcGVydHk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XHJcbiAgICAgICAgcmVxdWlyZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgICAgICBjaGlsZHJlbjoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuXHJcbiAgICAgICAgc3RhdGljIHJlZ2lzdHJ5OiBSZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpO1xyXG4gICAgICAgIC8vc3RhdGljIG5hbWU6IHN0cmluZztcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8tLS0tLS0tIGluaXQgRWxlbWVuZXQgYW5kIEVsZW1lbnRzJyBvcmlnaW5hbCBpbm5lckhUTUxcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNvbXBvbmVudCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxfaW5uZXJIVE1MID0gZWxlbWVudC5pbm5lckhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UGFyZW50KCk6IENvbXBvbmVudCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQuZ2V0Q29tcG9uZW50KDxDb21wb25lbnRFbGVtZW50PnRoaXMuZWxlbWVudC5wYXJlbnROb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBfaW5pdCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLS0gaW5pdCBQcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vLS0tLS0tLSBjYWxsIGluaXQoKSAmIGxvYWRSZXF1aXJlbWVudHMoKSAtPiB0aGVuIHJlbmRlclxyXG4gICAgICAgICAgICBsZXQgcmVhZHkgPSBbdGhpcy5pbml0SFRNTCgpLCBQcm9taXNlLmNyZWF0ZSh0aGlzLmluaXQoKSksIHRoaXMubG9hZFJlcXVpcmVtZW50cygpXTtcclxuICAgICAgICAgICAgUHJvbWlzZS5hbGwocmVhZHkpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlbmRlcigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0KCk6IGFueSB7fVxyXG5cclxuICAgICAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge3JldHVybiB2b2lkIDA7fVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgXHRcdENvbXBvbmVudC5yZWdpc3RyeS5yZW5kZXIodGhpcyk7XHJcblxyXG5cdFx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIFx0XHR0aGlzLmluaXRDaGlsZHJlbigpO1xyXG5cclxuICAgIFx0XHRDb21wb25lbnQucmVnaXN0cnkuaW5pdEVsZW1lbnQodGhpcy5lbGVtZW50KTtcclxuICAgIFx0fTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiAgQXNzdXJlIHRoYXQgdGhpcyBpbnN0YW5jZSBoYXMgYW4gdmFsaWQgaHRtbCBhdHRyaWJ1dGUgYW5kIGlmIG5vdCBsb2FkIGl0LlxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0SFRNTCgpOiBQcm9taXNlIHtcclxuICAgICAgICAgICAgbGV0IHAgPSBuZXcgUHJvbWlzZSgpO1xyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5odG1sID09PSAnYm9vbGVhbicpXHJcbiAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICBwLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuaHRtbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gQ29tcG9uZW50LmdldE5hbWUodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBDb21wb25lbnQucmVnaXN0cnkuZ2V0SHRtbChuYW1lKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmh0bWwgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgICAgIHAucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChwLnJlamVjdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0UHJvcGVydGllcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHByb3AgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3AubmFtZV0gPSB0aGlzLmVsZW1lbnRbcHJvcC5uYW1lXSB8fCB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKHByb3AubmFtZSkgfHwgcHJvcC5kZWZhdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMucHJvcGVydGllc1twcm9wLm5hbWVdID09PSB1bmRlZmluZWQgJiYgcHJvcC5yZXF1aXJlZCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYFByb3BlcnR5ICR7cHJvcC5uYW1lfSBpcyByZXF1aXJlZCBidXQgbm90IHByb3ZpZGVkYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcGVydGllc1twcm9wXSA9IHRoaXMuZWxlbWVudFtwcm9wXSB8fCB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKHByb3ApO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0Q2hpbGRyZW4oKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnKicpO1xyXG4gICAgXHRcdGZvcihsZXQgYyA9IDA7IGMgPCBjaGlsZHMubGVuZ3RoOyBjKyspIHtcclxuICAgIFx0XHRcdGxldCBjaGlsZCA9IGNoaWxkc1tjXTtcclxuICAgIFx0XHRcdGlmKGNoaWxkLmlkKSB7XHJcbiAgICBcdFx0XHRcdHRoaXMuY2hpbGRyZW5bY2hpbGQuaWRdID0gY2hpbGQ7XHJcbiAgICBcdFx0XHR9XHJcbiAgICBcdFx0XHR0aGlzLmNoaWxkcmVuW2NoaWxkLnRhZ05hbWVdID0gdGhpcy5jaGlsZHJlbltjaGlsZC50YWdOYW1lXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgICg8RWxlbWVudFtdPnRoaXMuY2hpbGRyZW5bY2hpbGQudGFnTmFtZV0pLnB1c2goY2hpbGQpO1xyXG4gICAgXHRcdH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbG9hZFJlcXVpcmVtZW50cygpIHtcclxuICAgIFx0XHRsZXQgcHJvbWlzZXMgPSB0aGlzLnJlcXVpcmVzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICFDb21wb25lbnQucmVnaXN0cnkuaGFzQ29tcG9uZW50KHJlcSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5tYXAoKHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5yZWdpc3RyeS5sb2FkQ29tcG9uZW50KHJlcSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgIFx0fTtcclxuXHJcbiAgICAgICAgc3RhdGljIHJlZ2lzdGVyKGM6IHR5cGVvZiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdHJ5LnJlZ2lzdGVyKGMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIHJ1bihvcHQ/OiBhbnkpIHtcclxuICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdHJ5LnNldE9wdGlvbnMob3B0KTtcclxuICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdHJ5LnJ1bigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGdldENvbXBvbmVudChlbGVtZW50OiBDb21wb25lbnRFbGVtZW50KTogQ29tcG9uZW50IHtcclxuICAgICAgICAgICAgd2hpbGUoIWVsZW1lbnQuY29tcG9uZW50KVxyXG4gICAgXHRcdFx0ZWxlbWVudCA9IDxDb21wb25lbnRFbGVtZW50PmVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgIFx0XHRyZXR1cm4gZWxlbWVudC5jb21wb25lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgZ2V0TmFtZShjbGF6ejogdHlwZW9mIENvbXBvbmVudCB8IENvbXBvbmVudCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGlmKGNsYXp6IGluc3RhbmNlb2YgQ29tcG9uZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXp6LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBjbGF6ei50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==