(function() {
	window.Component = function(c, e) {
		var self = this;
		c = Component.normalize(c);


		e.component = this;
		this.element = e;

		this.orig_innerHTML = e.innerHTML;

		for(var key in c) {
			if(c.hasOwnProperty(key)) {
				this[key] = c[key];
			}
		}

		this.properties.forEach(this.grabProperty.bind(this));

		if(this.init)
			this.init.call(this);

		Promise.all(this.requires.map(this.checkRequirement.bind(this)))
		.then(this.render.bind(this))
		.catch(function(err) {
			throw err;
		})
	};

	Component.prototype.findOne = function(selector) {
		return this.element.querySelector(selector);
	};

	Component.prototype.find = function(selector) {
		var elements = this.element.querySelectorAll(selector);
		var arr = [];
		while(elements.length) {
			arr.push(elements[0]);
			elements = elements.slice(1);
		}

		return arr;
	};

	Component.prototype.grabProperty = function(name) {
		this[name] = this.element[name] || this.element.getAttribute(name);
	};

	Component.prototype.render = function() {
		CFW.options.renderer.render(this);

		if(this.updated)
			this.updated();

		this.initChildren();

		CFW.initElement(this.element);
		/*
		this.renderHTML();
		this.renderRepeat();
		if(this.updated)
			this.updated();
		*/
	};

	Component.prototype.renderHTML = function() {
		var html = this.html;
		html = Component.repl(html, this);
		this.element.innerHTML = html;
	};

	Component.prototype.renderRepeat = function(el, model) {
		var root = el || this.element;
		var repeatEl = root.querySelector('[repeat]');

		var model = model || this;

		while(repeatEl) {
			var repeatStr = repeatEl.getAttribute('repeat');
			var r = repeatStr.match(/(\S+)\s+as\s+(\S+)/).slice(1);
			var name = r[1];
			try {
				with(model)
					model = eval(r[0]);
			} catch(e) {
				return;
			}

			var holder = document.createElement('div');
			model.forEach(function(value) {
				var model = {};
				model[name] = value;

				var node = repeatEl.cloneNode(true);
				node.removeAttribute('repeat');
				holder.appendChild(document.createComment(' ' + repeatStr + ' :: ' + name + ' = ' + JSON.stringify(value) + ' '));
				holder.appendChild(node);
				holder.innerHTML = Component.repl(holder.innerHTML, model);
				this.renderRepeat(holder, model);
			}.bind(this));
			var parent = repeatEl.parentNode;
			while(holder.hasChildNodes()) {
				var child = holder.firstChild;
				parent.insertBefore(child, repeatEl);
			}
			parent.removeChild(repeatEl);

			var repeatEl = root.querySelector('[repeat]');
		}

		CFW.initElement(root);
	};

	Component.repl = function(str, model) {
		var regex = /{([^{}|]+)}/;
		var regexG = /{([^{}|]+)}/g;

		var m = str.match(regexG)
		if(!m)
			return str;

		while(m.length) {
			var path = m[0];
			path = path.startsWith('{') ? path.substr(1) : path;
			path = path.endsWith('}') ? path.substr(0, path.length-1) : path;
			var value = undefined;
			try {
				with(model)
					value = eval(path);
			} catch(e) {}

			if(value !== undefined) {
				if(typeof value === 'function') {
					value = "Component.getComponent(this)."+path;
				}
				str = str.replace(m[0], value);
			}

			m = m.slice(1);
		}

		return str;
	};

	Component.prototype.checkRequirement = function(name) {
		var p = new Promise();

		if(CFW.hasComponent(name)) {
			p.resolve();
		}
		else {
			CFW.loadComponent(name)
			.then(p.resolve)
			.catch(p.reject)
		}

		return p;
	};

	Component.prototype.initChildren = function() {
		var childs = this.element.querySelectorAll('*');
		for(var c = 0; c < childs.length; c++) {
			var child = childs[c];
			if(child.id) {
				this.children[child.id] = child;
			}
			this.children[child.tagName] = this.children[child.tagName] || [];
			this.children[child.tagName].push(child);
		}
	};

	Component.prototype.getParent = function() {
		var el = this.element.parentNode;
		while(!el.component)
			el = el.parentNode;
		return el.component;
	}

	Component.getComponent = function(el) {
		while(!el.component)
			el = el.parentNode;
		return el.component;
	}

	Component.normalize = function(c) {
		if(!c.name) throw "Component needs a name";

		c.properties = c.properties || [];
		c.requires = c.requires || [];
		c.children = {};

		return c;
	};
})();
