	CFWRenderer = function Renderer() {

		var r = {
			tag: /<([^>]*?(?:(?:('|")[^'"]*?\2)[^>]*?)*)>/,
			repeat: /repeat=["|'].+["|']/,
			type: /[\s|/]*(.*?)[\s|\/|>]/,
			text: /(?:.|[\r\n])*?[^"'\\]</m,

		};

		function parse(html, root) {
			root = root || {html: null, parent: null, children: []};

			var m;
			while((m = r.tag.exec(html)) !== null) {
				var tag, type, closing, selfClosing, repeat, unClose;
				//------- found some text before next tag
				if(m.index !== 0) {
					tag = html.match(r.text)[0];
					tag = tag.substr(0, tag.length-1);
					type = 'TEXT';
					selfClosing = true;
					repeat = false;
				} else {
					tag = m[1].trim();
					type = (tag+'>').match(r.type)[1];
					closing = tag[0] === '/';
					selfClosing = tag[tag.length-1] === '/';
					repeat = !!tag.match(r.repeat);

					if(selfClosing && CFW.hasComponent(type)) {
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
						var result = parse(html, root.children[root.children.length-1]);
						html = result.html;
						root.children.pop();
						root.children.push(result.root);
					}
				}

				m = html.match(r.tag);
			}

			return {html: html, root: root};
		}

		function renderRepeat(root, models) {
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

					var model = evaluate(models, m[0]);

					var holder = [];
					model.forEach(function(value, index) {
						var model2 = {};
						model2[name] = value;
						model2[indexName] = index;

						var models2 = [].concat(models);
						models2.unshift(model2);

						var node = copyNode(child);
						node.repeat = false;
						node.html = node.html.replace(r.repeat, '');
						node.html = repl(node.html, models2);

						node = renderRepeat(node, models2);

						//root.children.splice(root.children.indexOf(child), 0, node);
						holder.push(node);
					});

					holder.forEach(function(n) {
						root.children.splice(root.children.indexOf(child), 0, n);
					});
					root.children.splice(root.children.indexOf(child), 1);
				} else {
					child.html = repl(child.html, models);
					child = renderRepeat(child, models);
					root.children[c] = child;
				}
			}

			return root;
		}

		function domToString(root, indent) {
			indent = indent || 0;
			var html = '';

			if(root.html) {
				html += '\t'.repeat(indent);
				if(root.type !== 'TEXT')
					html += '<' + root.html + '>';
				else html += root.html;
			}

			if(html)
				html += '\n';

			if(root.children.length) {
				html += root.children.map(function(c) {
					return domToString(c, indent+(root.type ? 1 : 2));
				}).join('\n');
			}

			if(root.type && root.type !== 'TEXT' && !root.selfClosing) {
				html += '\t'.repeat(indent);
				html += '</'+root.type+'>\n';
			}

			return html;
		}

		function evaluate(models, path) {
			var mi = 0;
			var model = void 0;
			while(mi < models.length && model === undefined) {
				model = models[mi];
				try {
					with(model)
						model = eval(path);
				} catch(e) {
					model = void 0;
					mi++;
				}
			}

			return model;
		}

		function copyNode(node) {
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

		function repl(str, models) {
			var regex = /{([^{}|]+)}/;
			var regexG = /{([^{}|]+)}/g;

			var m = str.match(regexG);
			if(!m)
				return str;

			while(m.length) {
				var path = m[0];
				path = path.startsWith('{') ? path.substr(1) : path;
				path = path.endsWith('}') ? path.substr(0, path.length-1) : path;
				var value = evaluate(models, path);
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

		return {
			'render': function(component) {
				if(typeof component.html === 'boolean' && !component.html)
					return;

				var html = component.html;

				var root = parse(html).root;
				root = renderRepeat(root, component);

				html = domToString(root, -1);

				component.element.innerHTML = html;
			}
		};
	};
