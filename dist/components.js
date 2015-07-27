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
                this.options = new components.RegistryOptions(options);
            }
            Registry.prototype.setOptions = function (options) {
                this.options = new components.RegistryOptions(options);
            };
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
                this.properties = [];
                this.requires = [];
                //------- init Elemenet and Elements' original innerHTML
                this.element = element;
                this.element.component = this;
                this.original_innerHTML = element.innerHTML;
            }
            Component.prototype._init = function () {
                var _this = this;
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
            };
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
                var tmp = this.properties;
                this.properties = {};
                tmp.forEach(function (prop) {
                    _this.properties[prop] = _this.element[prop] || _this.element.getAttribute(prop);
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
                Component.registry.setOptions(opt);
                Component.registry.run();
            };
            Component.registry = new components.Registry();
            return Component;
        })();
        components.Component = Component;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxwcm92aWRlci50cyIsImNvbXBvbmVudHNwcm92aWRlci50cyIsInJlbmRlcmVyLnRzIiwib3B0aW9ucy50cyIsInJlZ2lzdHJ5LnRzIiwiY29tcG9uZW50cy50cyJdLCJuYW1lcyI6WyJobyIsImhvLmNvbXBvbmVudHMiLCJoby5jb21wb25lbnRzLkh0bWxQcm92aWRlciIsImhvLmNvbXBvbmVudHMuSHRtbFByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5IdG1sUHJvdmlkZXIuZ2V0SFRNTCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50UHJvdmlkZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudFByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQiLCJoby5jb21wb25lbnRzLk5vZGUiLCJoby5jb21wb25lbnRzLk5vZGUuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIucmVuZGVyIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5wYXJzZSIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIucmVuZGVyUmVwZWF0IiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5kb21Ub1N0cmluZyIsImhvLmNvbXBvbmVudHMuUmVuZGVyZXIuZXZhbHVhdGUiLCJoby5jb21wb25lbnRzLlJlbmRlcmVyLmNvcHlOb2RlIiwiaG8uY29tcG9uZW50cy5SZW5kZXJlci5yZXBsIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeU9wdGlvbnMiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5T3B0aW9ucy5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5zZXRPcHRpb25zIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5yZWdpc3RlciIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkucnVuIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5pbml0Q29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5pbml0RWxlbWVudCIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkuaGFzQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5sb2FkQ29tcG9uZW50IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5yZW5kZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuX2luaXQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5pbml0IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQudXBkYXRlIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucmVuZGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdFByb3BlcnRpZXMiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5sb2FkUmVxdWlyZW1lbnRzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucmVnaXN0ZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5ydW4iXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sRUFBRSxDQTZCUjtBQTdCRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0E2Qm5CQTtJQTdCU0EsV0FBQUEsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFFbEJDO1lBQUFDO1lBeUJBQyxDQUFDQTtZQXZCR0QsOEJBQU9BLEdBQVBBLFVBQVFBLElBQVlBO2dCQUNoQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7b0JBRS9CQSxJQUFJQSxHQUFHQSxHQUFHQSxnQkFBY0EsSUFBSUEsVUFBT0EsQ0FBQ0E7b0JBRXBDQSxJQUFJQSxPQUFP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UUE3RVlBLG9CQUFTQSxZQTZFckJBLENBQUFBO0lBQ0xBLENBQUNBLEVBaEZTRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQWdGbkJBO0FBQURBLENBQUNBLEVBaEZNLEVBQUUsS0FBRixFQUFFLFFBZ0ZSIiwiZmlsZSI6ImNvbXBvbmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEh0bWxQcm92aWRlciB7XHJcblxyXG4gICAgICAgIGdldEhUTUwobmFtZTogc3RyaW5nKTogUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IGBjb21wb25lbnRzLyR7bmFtZX0uaHRtbGA7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIFx0XHRcdHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcdFx0XHRcdGlmKHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0KSB7XHJcbiAgICBcdFx0XHRcdFx0bGV0IHJlc3AgPSB4bWxodHRwLnJlc3BvbnNlVGV4dDtcclxuICAgIFx0XHRcdFx0XHRpZih4bWxodHRwLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcCk7XHJcbiAgICBcdFx0XHRcdFx0fSBlbHNlIHtcclxuICAgIFx0XHRcdFx0XHRcdHJlamVjdChyZXNwKTtcclxuICAgIFx0XHRcdFx0XHR9XHJcbiAgICBcdFx0XHRcdH1cclxuICAgIFx0XHRcdH07XHJcblxyXG4gICAgXHRcdFx0eG1saHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJtb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudFByb3ZpZGVyIHtcclxuXHJcbiAgICAgICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgY29tcG9uZW50cy8ke25hbWV9LmpzYDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIFx0XHRcdFx0aWYoeG1saHR0cC5yZWFkeVN0YXRlID09IDQpIHtcclxuICAgIFx0XHRcdFx0XHRsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xyXG4gICAgXHRcdFx0XHRcdGlmKHhtbGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gICAgXHRcdFx0XHRcdFx0bGV0IGZ1bmMgPSByZXNwICsgXCJcXG5yZXR1cm4gIFwiICsgbmFtZSArICBcIlxcbi8vI3NvdXJjZVVSTD1cIiArIGxvY2F0aW9uLm9yaWdpbiArICcvJyArICd1cmw7J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudCA9IG5ldyBGdW5jdGlvbihcIlwiLCBmdW5jKSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdGVyKGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3ApO1xyXG4gICAgXHRcdFx0XHRcdH0gZWxzZSB7XHJcbiAgICBcdFx0XHRcdFx0XHRyZWplY3QocmVzcCk7XHJcbiAgICBcdFx0XHRcdFx0fVxyXG4gICAgXHRcdFx0XHR9XHJcbiAgICBcdFx0XHR9O1xyXG5cclxuICAgIFx0XHRcdHhtbGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgIFx0XHRcdHhtbGh0dHAuc2VuZCgpO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn1cclxuIiwibW9kdWxlIGhvLmNvbXBvbmVudHMge1xyXG5cclxuICAgIGNsYXNzIE5vZGUge1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgICAgICBwYXJlbnQ6IE5vZGU7XHJcbiAgICAgICAgY2hpbGRyZW46IEFycmF5PE5vZGU+ID0gW107XHJcbiAgICAgICAgdHlwZTogc3RyaW5nO1xyXG4gICAgICAgIHNlbGZDbG9zaW5nOiBib29sZWFuO1xyXG4gICAgICAgIHJlcGVhdDogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVuZGVyZXIge1xyXG5cclxuICAgICAgICBwcml2YXRlIHI6IGFueSA9IHtcclxuXHRcdFx0dGFnOiAvPChbXj5dKj8oPzooPzooJ3xcIilbXidcIl0qP1xcMilbXj5dKj8pKik+LyxcclxuXHRcdFx0cmVwZWF0OiAvcmVwZWF0PVtcInwnXS4rW1wifCddLyxcclxuXHRcdFx0dHlwZTogL1tcXHN8L10qKC4qPylbXFxzfFxcL3w+XS8sXHJcblx0XHRcdHRleHQ6IC8oPzoufFtcXHJcXG5dKSo/W15cIidcXFxcXTwvbSxcclxuXHRcdH07XHJcblxyXG4gICAgICAgIC8vcHJpdmF0ZSBjYWNoZToge1trZXk6c3RyaW5nXTpJTm9kZX07XHJcblxyXG4gICAgICAgIHB1YmxpYyByZW5kZXIoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYodHlwZW9mIGNvbXBvbmVudC5odG1sID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCByb290ID0gdGhpcy5wYXJzZShjb21wb25lbnQuaHRtbCk7XHJcbiAgICAgICAgICAgIHJvb3QgPSB0aGlzLnJlbmRlclJlcGVhdChyb290LCBjb21wb25lbnQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGh0bWwgPSB0aGlzLmRvbVRvU3RyaW5nKHJvb3QsIC0xKTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5lbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblx0XHRwcml2YXRlIHBhcnNlKGh0bWw6IHN0cmluZywgcm9vdD0gbmV3IE5vZGUoKSkge1xyXG5cclxuXHRcdFx0dmFyIG07XHJcblx0XHRcdHdoaWxlKChtID0gdGhpcy5yLnRhZy5leGVjKGh0bWwpKSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdHZhciB0YWcsIHR5cGUsIGNsb3NpbmcsIHNlbGZDbG9zaW5nLCByZXBlYXQsIHVuQ2xvc2U7XHJcblx0XHRcdFx0Ly8tLS0tLS0tIGZvdW5kIHNvbWUgdGV4dCBiZWZvcmUgbmV4dCB0YWdcclxuXHRcdFx0XHRpZihtLmluZGV4ICE9PSAwKSB7XHJcblx0XHRcdFx0XHR0YWcgPSBodG1sLm1hdGNoKHRoaXMuci50ZXh0KVswXTtcclxuXHRcdFx0XHRcdHRhZyA9IHRhZy5zdWJzdHIoMCwgdGFnLmxlbmd0aC0xKTtcclxuXHRcdFx0XHRcdHR5cGUgPSAnVEVYVCc7XHJcblx0XHRcdFx0XHRzZWxmQ2xvc2luZyA9IHRydWU7XHJcblx0XHRcdFx0XHRyZXBlYXQgPSBmYWxzZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGFnID0gbVsxXS50cmltKCk7XHJcblx0XHRcdFx0XHR0eXBlID0gKHRhZysnPicpLm1hdGNoKHRoaXMuci50eXBlKVsxXTtcclxuXHRcdFx0XHRcdGNsb3NpbmcgPSB0YWdbMF0gPT09ICcvJztcclxuXHRcdFx0XHRcdHNlbGZDbG9zaW5nID0gdGFnW3RhZy5sZW5ndGgtMV0gPT09ICcvJztcclxuXHRcdFx0XHRcdHJlcGVhdCA9ICEhdGFnLm1hdGNoKHRoaXMuci5yZXBlYXQpO1xyXG5cclxuXHRcdFx0XHRcdGlmKHNlbGZDbG9zaW5nICYmIENvbXBvbmVudC5yZWdpc3RyeS5oYXNDb21wb25lbnQodHlwZSkpIHtcclxuXHRcdFx0XHRcdFx0c2VsZkNsb3NpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0dGFnID0gdGFnLnN1YnN0cigwLCB0YWcubGVuZ3RoLTEpICsgXCIgXCI7XHJcblxyXG5cdFx0XHRcdFx0XHR1bkNsb3NlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGh0bWwgPSBodG1sLnNsaWNlKHRhZy5sZW5ndGggKyAodHlwZSA9PT0gJ1RFWFQnID8gMCA6IDIpICk7XHJcblxyXG5cdFx0XHRcdGlmKGNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyb290LmNoaWxkcmVuLnB1c2goe3BhcmVudDogcm9vdCwgaHRtbDogdGFnLCB0eXBlOiB0eXBlLCBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsIHJlcGVhdDogcmVwZWF0LCBjaGlsZHJlbjogW119KTtcclxuXHJcblx0XHRcdFx0XHRpZighdW5DbG9zZSAmJiAhc2VsZkNsb3NpbmcpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2UoaHRtbCwgcm9vdC5jaGlsZHJlbltyb290LmNoaWxkcmVuLmxlbmd0aC0xXSk7XHJcblx0XHRcdFx0XHRcdGh0bWwgPSByZXN1bHQuaHRtbDtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wb3AoKTtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHJlc3VsdCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRtID0gaHRtbC5tYXRjaCh0aGlzLnIudGFnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHJvb3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSByZW5kZXJSZXBlYXQocm9vdCwgbW9kZWxzKSB7XHJcblx0XHRcdG1vZGVscyA9IFtdLmNvbmNhdChtb2RlbHMpO1xyXG5cclxuXHRcdFx0Zm9yKHZhciBjID0gMDsgYyA8IHJvb3QuY2hpbGRyZW4ubGVuZ3RoOyBjKyspIHtcclxuXHRcdFx0XHR2YXIgY2hpbGQgPSByb290LmNoaWxkcmVuW2NdO1xyXG5cdFx0XHRcdGlmKGNoaWxkLnJlcGVhdCkge1xyXG5cdFx0XHRcdFx0dmFyIHJlZ2V4ID0gL3JlcGVhdD1bXCJ8J11cXHMqKFxcUyspXFxzK2FzXFxzKyhcXFMrPylbXCJ8J10vO1xyXG5cdFx0XHRcdFx0dmFyIG0gPSBjaGlsZC5odG1sLm1hdGNoKHJlZ2V4KS5zbGljZSgxKTtcclxuXHRcdFx0XHRcdHZhciBuYW1lID0gbVsxXTtcclxuXHRcdFx0XHRcdHZhciBpbmRleE5hbWU7XHJcblx0XHRcdFx0XHRpZihuYW1lLmluZGV4T2YoJywnKSA+IC0xKSB7XHJcblx0XHRcdFx0XHRcdHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoJywnKTtcclxuXHRcdFx0XHRcdFx0bmFtZSA9IG5hbWVzWzBdLnRyaW0oKTtcclxuXHRcdFx0XHRcdFx0aW5kZXhOYW1lID0gbmFtZXNbMV0udHJpbSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHZhciBtb2RlbCA9IHRoaXMuZXZhbHVhdGUobW9kZWxzLCBtWzBdKTtcclxuXHJcblx0XHRcdFx0XHR2YXIgaG9sZGVyID0gW107XHJcblx0XHRcdFx0XHRtb2RlbC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbW9kZWwyID0ge307XHJcblx0XHRcdFx0XHRcdG1vZGVsMltuYW1lXSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRtb2RlbDJbaW5kZXhOYW1lXSA9IGluZGV4O1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIG1vZGVsczIgPSBbXS5jb25jYXQobW9kZWxzKTtcclxuXHRcdFx0XHRcdFx0bW9kZWxzMi51bnNoaWZ0KG1vZGVsMik7XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgbm9kZSA9IHRoaXMuY29weU5vZGUoY2hpbGQpO1xyXG5cdFx0XHRcdFx0XHRub2RlLnJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRub2RlLmh0bWwgPSBub2RlLmh0bWwucmVwbGFjZSh0aGlzLnIucmVwZWF0LCAnJyk7XHJcblx0XHRcdFx0XHRcdG5vZGUuaHRtbCA9IHRoaXMucmVwbChub2RlLmh0bWwsIG1vZGVsczIpO1xyXG5cclxuXHRcdFx0XHRcdFx0bm9kZSA9IHRoaXMucmVuZGVyUmVwZWF0KG5vZGUsIG1vZGVsczIpO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9yb290LmNoaWxkcmVuLnNwbGljZShyb290LmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAwLCBub2RlKTtcclxuXHRcdFx0XHRcdFx0aG9sZGVyLnB1c2gobm9kZSk7XHJcblx0XHRcdFx0XHR9LmJpbmQodGhpcykpO1xyXG5cclxuXHRcdFx0XHRcdGhvbGRlci5mb3JFYWNoKGZ1bmN0aW9uKG4pIHtcclxuXHRcdFx0XHRcdFx0cm9vdC5jaGlsZHJlbi5zcGxpY2Uocm9vdC5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMCwgbik7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdHJvb3QuY2hpbGRyZW4uc3BsaWNlKHJvb3QuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDEpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjaGlsZC5odG1sID0gdGhpcy5yZXBsKGNoaWxkLmh0bWwsIG1vZGVscyk7XHJcblx0XHRcdFx0XHRjaGlsZCA9IHRoaXMucmVuZGVyUmVwZWF0KGNoaWxkLCBtb2RlbHMpO1xyXG5cdFx0XHRcdFx0cm9vdC5jaGlsZHJlbltjXSA9IGNoaWxkO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHJvb3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBkb21Ub1N0cmluZyhyb290LCBpbmRlbnQpIHtcclxuXHRcdFx0aW5kZW50ID0gaW5kZW50IHx8IDA7XHJcblx0XHRcdHZhciBodG1sID0gJyc7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhYjogYW55ID0gJ1xcdCc7XHJcblxyXG5cdFx0XHRpZihyb290Lmh0bWwpIHtcclxuXHRcdFx0XHRodG1sICs9IHRhYi5yZXBlYXQoaW5kZW50KTtcclxuXHRcdFx0XHRpZihyb290LnR5cGUgIT09ICdURVhUJylcclxuXHRcdFx0XHRcdGh0bWwgKz0gJzwnICsgcm9vdC5odG1sICsgJz4nO1xyXG5cdFx0XHRcdGVsc2UgaHRtbCArPSByb290Lmh0bWw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGh0bWwpXHJcblx0XHRcdFx0aHRtbCArPSAnXFxuJztcclxuXHJcblx0XHRcdGlmKHJvb3QuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcblx0XHRcdFx0aHRtbCArPSByb290LmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb21Ub1N0cmluZyhjLCBpbmRlbnQrKHJvb3QudHlwZSA/IDEgOiAyKSk7XHJcblx0XHRcdFx0fS5iaW5kKHRoaXMpKS5qb2luKCdcXG4nKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYocm9vdC50eXBlICYmIHJvb3QudHlwZSAhPT0gJ1RFWFQnICYmICFyb290LnNlbGZDbG9zaW5nKSB7XHJcblx0XHRcdFx0aHRtbCArPSB0YWIucmVwZWF0KGluZGVudCk7XHJcblx0XHRcdFx0aHRtbCArPSAnPC8nK3Jvb3QudHlwZSsnPlxcbic7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBodG1sO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZXZhbHVhdGUobW9kZWxzLCBwYXRoKSB7XHJcblx0XHRcdHZhciBtaSA9IDA7XHJcblx0XHRcdHZhciBtb2RlbCA9IHZvaWQgMDtcclxuXHRcdFx0d2hpbGUobWkgPCBtb2RlbHMubGVuZ3RoICYmIG1vZGVsID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtb2RlbCA9IG1vZGVsc1ttaV07XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdG1vZGVsID0gbmV3IEZ1bmN0aW9uKFwibW9kZWxcIiwgXCJyZXR1cm4gbW9kZWwuXCIrcGF0aCkobW9kZWwpO1xyXG5cdFx0XHRcdH0gY2F0Y2goZSkge1xyXG5cdFx0XHRcdFx0bW9kZWwgPSB2b2lkIDA7XHJcblx0XHRcdFx0XHRtaSsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1vZGVsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgY29weU5vZGUobm9kZSkge1xyXG5cdFx0XHR2YXIgY29weU5vZGUgPSB0aGlzLmNvcHlOb2RlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB2YXIgbiA9IHtcclxuXHRcdFx0XHRwYXJlbnQ6IG5vZGUucGFyZW50LFxyXG5cdFx0XHRcdGh0bWw6IG5vZGUuaHRtbCxcclxuXHRcdFx0XHR0eXBlOiBub2RlLnR5cGUsXHJcblx0XHRcdFx0c2VsZkNsb3Npbmc6IG5vZGUuc2VsZkNsb3NpbmcsXHJcblx0XHRcdFx0cmVwZWF0OiBub2RlLnJlcGVhdCxcclxuXHRcdFx0XHRjaGlsZHJlbjogbm9kZS5jaGlsZHJlbi5tYXAoY29weU5vZGUpXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRyZXR1cm4gbjtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIHJlcGwoc3RyLCBtb2RlbHMpIHtcclxuXHRcdFx0dmFyIHJlZ2V4ID0gL3soW157fXxdKyl9LztcclxuXHRcdFx0dmFyIHJlZ2V4RyA9IC97KFtee318XSspfS9nO1xyXG5cclxuXHRcdFx0dmFyIG0gPSBzdHIubWF0Y2gocmVnZXhHKTtcclxuXHRcdFx0aWYoIW0pXHJcblx0XHRcdFx0cmV0dXJuIHN0cjtcclxuXHJcblx0XHRcdHdoaWxlKG0ubGVuZ3RoKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSBtWzBdO1xyXG5cdFx0XHRcdHBhdGggPSBwYXRoLnN0YXJ0c1dpdGgoJ3snKSA/IHBhdGguc3Vic3RyKDEpIDogcGF0aDtcclxuXHRcdFx0XHRwYXRoID0gcGF0aC5lbmRzV2l0aCgnfScpID8gcGF0aC5zdWJzdHIoMCwgcGF0aC5sZW5ndGgtMSkgOiBwYXRoO1xyXG5cdFx0XHRcdHZhciB2YWx1ZSA9IHRoaXMuZXZhbHVhdGUobW9kZWxzLCBwYXRoKTtcclxuXHRcdFx0XHQvKlxyXG5cdFx0XHRcdHZhciB2YWx1ZSA9IHVuZGVmaW5lZDtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0d2l0aChtb2RlbClcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBldmFsKHBhdGgpO1xyXG5cdFx0XHRcdH0gY2F0Y2goZSkge31cclxuXHRcdFx0XHQqL1xyXG5cclxuXHRcdFx0XHRpZih2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRpZih0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdFx0dmFsdWUgPSBcIkNvbXBvbmVudC5nZXRDb21wb25lbnQodGhpcykuXCIrcGF0aDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKG1bMF0sIHZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG0gPSBtLnNsaWNlKDEpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gc3RyO1xyXG5cdFx0fVxyXG4gICAgfVxyXG5cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaHRtbHByb3ZpZGVyXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiY29tcG9uZW50c3Byb3ZpZGVyXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicmVuZGVyZXJcIi8+XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5T3B0aW9ucyB7XHJcbiAgICAgICAgaHRtbFByb3ZpZGVyOiBIdG1sUHJvdmlkZXIgPSBuZXcgSHRtbFByb3ZpZGVyKCk7XHJcbiAgICAgICAgY29tcG9uZW50UHJvdmlkZXI6IENvbXBvbmVudFByb3ZpZGVyID0gbmV3IENvbXBvbmVudFByb3ZpZGVyKCk7XHJcbiAgICAgICAgcmVuZGVyZXI6IFJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdD86IGFueSkge1xyXG4gICAgICAgICAgICBpZiAob3B0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydGllcyA9IFsnaHRtbFByb3ZpZGVyJywgJ2NvbXBvbmVudFByb3ZpZGVyJywgJ3JlbmRlcmVyJ107XHJcblxyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdC5oYXNPd25BdHRyaWJ1dGUobmFtZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbbmFtZV0gPSBvcHRbbmFtZV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwib3B0aW9uc1wiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVnaXN0cnkge1xyXG5cclxuICAgICAgICBwcml2YXRlIG9wdGlvbnM6IFJlZ2lzdHJ5T3B0aW9ucztcclxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudHM6IEFycmF5PHR5cGVvZiBDb21wb25lbnQ+ID0gW107XHJcblxyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBSZWdpc3RyeU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0T3B0aW9ucyhvcHRpb25zPzogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBSZWdpc3RyeU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChjLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJ1bigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGMpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRDb21wb25lbnQoYyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluaXRDb21wb25lbnQoY29tcG9uZW50OiB0eXBlb2YgQ29tcG9uZW50LCBlbGVtZW50OkhUTUxFbGVtZW50fERvY3VtZW50PWRvY3VtZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGNvbXBvbmVudC5uYW1lKSwgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdG5ldyBjb21wb25lbnQoZSkuX2luaXQoKTtcclxuXHRcdFx0fSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdEVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q29tcG9uZW50KGNvbXBvbmVudCwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5uYW1lID09PSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudChuYW1lKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcihjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucmVuZGVyZXIucmVuZGVyKGNvbXBvbmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWdpc3RyeVwiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L2QudHMvcHJvbWlzZS5kLnRzXCIvPlxyXG5pbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcclxuICAgICAgICBlbGVtZW50OiBhbnk7XHJcbiAgICAgICAgb3JpZ2luYWxfaW5uZXJIVE1MOiBzdHJpbmc7XHJcbiAgICAgICAgaHRtbDogc3RyaW5nO1xyXG4gICAgICAgIHByb3BlcnRpZXM6IEFycmF5PHN0cmluZz58YW55ID0gW107XHJcbiAgICAgICAgcmVxdWlyZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgc3RhdGljIHJlZ2lzdHJ5OiBSZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpO1xyXG4gICAgICAgIHN0YXRpYyBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLSBpbml0IEVsZW1lbmV0IGFuZCBFbGVtZW50cycgb3JpZ2luYWwgaW5uZXJIVE1MXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jb21wb25lbnQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsX2lubmVySFRNTCA9IGVsZW1lbnQuaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIF9pbml0KCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0tIGluaXQgUHJvcGVydGllc1xyXG4gICAgICAgICAgICB0aGlzLmluaXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICAvLy0tLS0tLS0gY2FsbCBpbml0KCkgJiBsb2FkUmVxdWlyZW1lbnRzKCkgLT4gdGhlbiByZW5kZXJcclxuICAgICAgICAgICAgbGV0IHJlYWR5ID0gW3RoaXMuaW5pdCgpLCB0aGlzLmxvYWRSZXF1aXJlbWVudHMoKV07XHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHJlYWR5KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbml0KCk6IFByb21pc2Uge3JldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSk9PntyZXNvbHZlKCk7fSk7fVxyXG5cclxuICAgICAgICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge3JldHVybiB2b2lkIDA7fVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgXHRcdENvbXBvbmVudC5yZWdpc3RyeS5yZW5kZXIodGhpcyk7XHJcblxyXG5cdFx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIFx0XHQvL3RoaXMuaW5pdENoaWxkcmVuKCk7XHJcblxyXG4gICAgXHRcdENvbXBvbmVudC5yZWdpc3RyeS5pbml0RWxlbWVudCh0aGlzLmVsZW1lbnQpO1xyXG4gICAgXHR9O1xyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0UHJvcGVydGllcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHRtcCA9IHRoaXMucHJvcGVydGllcztcclxuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0ge307XHJcbiAgICAgICAgICAgIHRtcC5mb3JFYWNoKChwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BlcnRpZXNbcHJvcF0gPSB0aGlzLmVsZW1lbnRbcHJvcF0gfHwgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShwcm9wKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGxvYWRSZXF1aXJlbWVudHMoKSB7XHJcbiAgICBcdFx0bGV0IHByb21pc2VzID0gdGhpcy5yZXF1aXJlc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhQ29tcG9uZW50LnJlZ2lzdHJ5Lmhhc0NvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAubWFwKChyZXEpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQucmVnaXN0cnkubG9hZENvbXBvbmVudChyZXEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICBcdH07XHJcblxyXG4gICAgICAgIHN0YXRpYyByZWdpc3RlcihjOiB0eXBlb2YgQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3RyeS5yZWdpc3RlcihjKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBydW4ob3B0PzogYW55KSB7XHJcbiAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3RyeS5zZXRPcHRpb25zKG9wdCk7XHJcbiAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3RyeS5ydW4oKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=