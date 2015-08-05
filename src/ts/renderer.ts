/// <reference path="./registry.ts"/>
/// <reference path="./temp"/>

module ho.components.renderer {
    import Registry = ho.components.registry.instance;

    interface NodeHtml {
        root: Node;
        html: string;
    }

    class Node {
        html: string;
        parent: Node;
        children: Array<Node> = [];
        type: string;
        selfClosing: boolean;
        isVoid: boolean;
        repeat: boolean;
    }

    export class Renderer {

        private r: any = {
			tag: /<([^>]*?(?:(?:('|")[^'"]*?\2)[^>]*?)*)>/,
			repeat: /repeat=["|'].+["|']/,
			type: /[\s|/]*(.*?)[\s|\/|>]/,
			text: /(?:.|[\r\n])*?[^"'\\]</m,
		};

        private voids = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];

        private cache: {[key:string]:Node} = {};

        public render(component: Component): void {
            if(typeof component.html === 'boolean' && !component.html)
                return;

            let name = component.name;
            let root = this.cache[name] = this.cache[name] || this.parse(component.html).root;
            root = this.renderRepeat(this.copyNode(root), component);

            let html = this.domToString(root, -1);

            component.element.innerHTML = html;

        }


		private parse(html: string, root= new Node()): NodeHtml {

			var m;
			while((m = this.r.tag.exec(html)) !== null) {
				var tag, type, closing, isVoid, selfClosing, repeat, unClose;
				//------- found some text before next tag
				if(m.index !== 0) {
					tag = html.match(this.r.text)[0];
					tag = tag.substr(0, tag.length-1);
					type = 'TEXT';
                    isVoid = false;
					selfClosing = true;
					repeat = false;
				} else {
					tag = m[1].trim();
					type = (tag+'>').match(this.r.type)[1];
					closing = tag[0] === '/';
                    isVoid = this.isVoid(type);
					selfClosing = isVoid || tag[tag.length-1] === '/';
					repeat = !!tag.match(this.r.repeat);

					if(selfClosing && Registry.hasComponent(type)) {
						selfClosing = false;
						tag = tag.substr(0, tag.length-1) + " ";

						unClose = true;
					}
				}

				html = html.slice(tag.length + (type === 'TEXT' ? 0 : 2) );

				if(closing) {
					break;
				} else {
					root.children.push({parent: root, html: tag, type: type, isVoid: isVoid, selfClosing: selfClosing, repeat: repeat, children: []});

					if(!unClose && !selfClosing) {
						var result = this.parse(html, root.children[root.children.length-1]);
						html = result.html;
						root.children.pop();
						root.children.push(result.root);
					}
				}

				m = html.match(this.r.tag);
			}

			return {root: root, html: html};
		}

		private renderRepeat(root, models): Node {
			models = [].concat(models);

			for(var c = 0; c < root.children.length; c++) {
				var child = root.children[c];
				if(child.repeat) {
					var regex = /repeat=["|']\s*(\S+)\s+as\s+(\S+?)["|']/;
					var m = child.html.match(regex).slice(1);
					var name = m[1];
					var indexName;
					if(name.indexOf(',') > -1) {
						var names = name.split(',');
						name = names[0].trim();
						indexName = names[1].trim();
					}

					var model = this.evaluate(models, m[0]);

					var holder = [];
					model.forEach(function(value, index) {
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

					holder.forEach(function(n) {
						root.children.splice(root.children.indexOf(child), 0, n);
					});
					root.children.splice(root.children.indexOf(child), 1);
				} else {
					child.html = this.repl(child.html, models);
					child = this.renderRepeat(child, models);
					root.children[c] = child;
				}
			}

			return root;
		}

		private domToString(root: Node, indent: number): string {
			indent = indent || 0;
			var html = '';
            const tab: any = '\t';

			if(root.html) {
				html += new Array(indent).join(tab); //tab.repeat(indent);;
				if(root.type !== 'TEXT') {
					//if(root.selfClosing && !root.isVoid)
                    //    html += '<' + root.html + '/>';
                    //else
                        html += '<' + root.html + '>';
                }
				else html += root.html;
			}

			if(html)
				html += '\n';

			if(root.children.length) {
				html += root.children.map(function(c) {
					return this.domToString(c, indent+(root.type ? 1 : 2));
				}.bind(this)).join('\n');
			}

			if(root.type && root.type !== 'TEXT' && !root.selfClosing) {
				html += new Array(indent).join(tab); //tab.repeat(indent);
				html += '</'+root.type+'>\n';
			}

			return html;
		}

        private repl(str: string, models: any[]): string {
            var regexG = /{(.+?)}}?/g;

            var m = str.match(regexG);
            if(!m)
                return str;

            while(m.length) {
                var path = m[0];
                path = path.substr(1, path.length-2);

                var value = this.evaluate(models, path);

                if(value !== undefined) {
                    if(typeof value === 'function') {
                        value = "ho.components.Component.getComponent(this)."+path;
                    }
                    str = str.replace(m[0], value);
                }

                m = m.slice(1);
            }

            return str;
        }

        private evaluate(models: any[], path: string): any {
            if(path[0] === '{' && path[--path.length] === '}')
                return this.evaluateExpression(models, path.substr(1, path.length-2))
            else if(path[0] === '#')
                return this.evaluateFunction(models, path.substr(1));
            else
                return this.evaluateValue(models, path);
        }

        private evaluateValue(models: any[], path: string): any {
            return this.evaluateValueAndModel(models, path).value;
        }

		private evaluateValueAndModel(models: any[], path: string): {value: any, model: any} {
			if(models.indexOf(window) == -1)
                models.push(window);

            var mi = 0;
			var model = void 0;
			while(mi < models.length && model === undefined) {
				model = models[mi];
				try {
					model = new Function("model", "return model['" + path.split(".").join("']['") + "']")(model);
				} catch(e) {
					model = void 0;
				} finally {
                    mi++;
                }
			}

			return {"value": model, "model": models[--mi]};
		}

        private evaluateExpression(models: any[], path: string): any {
			if(models.indexOf(window) == -1)
                models.push(window);

            var mi = 0;
			var model = void 0;
			while(mi < models.length && model === undefined) {
				model = models[mi];
				try {
                    //with(model) model = eval(path);
                    model = new Function(Object.keys(model).toString(), "return " + path)
                        .apply(null, Object.keys(model).map((k) => {return model[k]}) );
				} catch(e) {
					model = void 0;
				} finally {
                    mi++;
                }
			}

			return model;
		}

        private evaluateFunction(models: any[], path: string): any {
            let exp = this.evaluateExpression.bind(this, models);
			var [name, args] = path.split('(');
            args = args.substr(0, --args.length);

            let {value, model} = this.evaluateValueAndModel(models, name);
            let func: Function = value;
            let argArr: string[] = args.split('.').map((arg) => {
                return arg.indexOf('#') === 0 ?
                    arg.substr(1) :
                    exp(arg);
            });

            func = func.bind(model, ...argArr);

            let index = ho.components.temp.set(func);

            var str = `ho.components.temp.call(${index})`;
            return str;
		}

		private copyNode(node: Node): Node {
			var copyNode = this.copyNode.bind(this);

            var n = <Node>{
				parent: node.parent,
				html: node.html,
				type: node.type,
				selfClosing: node.selfClosing,
				repeat: node.repeat,
				children: node.children.map(copyNode)
			};

			return n;
		}

        private isVoid(name: string): boolean {
            return this.voids.indexOf(name.toLowerCase()) !== -1;
        }

    }

    export let instance = new Renderer();

}
