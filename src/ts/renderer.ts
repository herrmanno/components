module ho.components {

    class Node {
        html: string;
        parent: Node;
        children: Array<Node> = [];
        type: string;
        selfClosing: boolean;
        repeat: boolean;
    }

    export class Renderer {

        private r: any = {
			tag: /<([^>]*?(?:(?:('|")[^'"]*?\2)[^>]*?)*)>/,
			repeat: /repeat=["|'].+["|']/,
			type: /[\s|/]*(.*?)[\s|\/|>]/,
			text: /(?:.|[\r\n])*?[^"'\\]</m,
		};

        //private cache: {[key:string]:INode};

        public render(component: Component): void {
            if(typeof component.html === 'undefined')
                return;

            let root = this.parse(component.html);
            root = this.renderRepeat(root, component);

            let html = this.domToString(root, -1);

            component.element.innerHTML = html;
        }


		private parse(html: string, root= new Node()) {

			var m;
			while((m = this.r.tag.exec(html)) !== null) {
				var tag, type, closing, selfClosing, repeat, unClose;
				//------- found some text before next tag
				if(m.index !== 0) {
					tag = html.match(this.r.text)[0];
					tag = tag.substr(0, tag.length-1);
					type = 'TEXT';
					selfClosing = true;
					repeat = false;
				} else {
					tag = m[1].trim();
					type = (tag+'>').match(this.r.type)[1];
					closing = tag[0] === '/';
					selfClosing = tag[tag.length-1] === '/';
					repeat = !!tag.match(this.r.repeat);

					if(selfClosing && Component.registry.hasComponent(type)) {
						selfClosing = false;
						tag = tag.substr(0, tag.length-1) + " ";

						unClose = true;
					}
				}

				html = html.slice(tag.length + (type === 'TEXT' ? 0 : 2) );

				if(closing) {
					break;
				} else {
					root.children.push({parent: root, html: tag, type: type, selfClosing: selfClosing, repeat: repeat, children: []});

					if(!unClose && !selfClosing) {
						var result = this.parse(html, root.children[root.children.length-1]);
						html = result.html;
						root.children.pop();
						root.children.push(result);
					}
				}

				m = html.match(this.r.tag);
			}

			return root;
		}

		private renderRepeat(root, models) {
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

		private domToString(root, indent) {
			indent = indent || 0;
			var html = '';
            const tab: any = '\t';

			if(root.html) {
				html += tab.repeat(indent);
				if(root.type !== 'TEXT')
					html += '<' + root.html + '>';
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
				html += tab.repeat(indent);
				html += '</'+root.type+'>\n';
			}

			return html;
		}

		private evaluate(models, path) {
			var mi = 0;
			var model = void 0;
			while(mi < models.length && model === undefined) {
				model = models[mi];
				try {
					model = new Function("model", "return model."+path)(model);
				} catch(e) {
					model = void 0;
					mi++;
				}
			}

			return model;
		}

		private copyNode(node) {
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
		}

		private repl(str, models) {
			var regex = /{([^{}|]+)}/;
			var regexG = /{([^{}|]+)}/g;

			var m = str.match(regexG);
			if(!m)
				return str;

			while(m.length) {
				var path = m[0];
				path = path.startsWith('{') ? path.substr(1) : path;
				path = path.endsWith('}') ? path.substr(0, path.length-1) : path;
				var value = this.evaluate(models, path);
				/*
				var value = undefined;
				try {
					with(model)
						value = eval(path);
				} catch(e) {}
				*/

				if(value !== undefined) {
					if(typeof value === 'function') {
						value = "Component.getComponent(this)."+path;
					}
					str = str.replace(m[0], value);
				}

				m = m.slice(1);
			}

			return str;
		}
    }

}
