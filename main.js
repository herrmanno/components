(function() {
	window.CFW = {

		components: [],

		loadingComponents: {},

		options: null,

		register: function(c) {
			var p = new Promise();
			p.then(function(html) {
				c.html = html;
				this.components.push(c);
				document.createElement(c.name);

				if(this.loadingComponents[c.name])
					this.loadingComponents[c.name].resolve();

			}.bind(this));

			if(c.html) {
				p.resolve(c.html);
			} else {
				if(typeof c.html === 'boolean' && !c.html) {
					p.resolve(false);
				} else {
					this.options.htmlProvider(c.name)
					.then(p.resolve)
					.catch(function(err) {
						throw 'No html template file found for Component '+c.name;
					});
				}
			}

		},

		run: function(opt) {
			this.options = new CFWOptions(opt);
			this.components.forEach(function(c) {
				this.initComponent(c);
			}.bind(this));
		},

		initElement : function(el) {
			this.components.forEach(function(c) {
				this.initComponent(c, el);
			}.bind(this));
			/*
			this.components.forEach(function(c) {
				Array.prototype.forEach.call(el.querySelectorAll(c.name), function(e) {
					new Component(c, e);
				});
			});
			*/
		},

		initComponent: function(c, el) {
			el = el || document;
			Array.prototype.forEach.call(el.querySelectorAll(c.name), function(e) {
				new Component(c, e);
			});
		},

		hasComponent: function(name) {
			var c = this.components.filter(function(c) {
				return c.name === name;
			});

			return !!c.length;
		},

		loadComponent: function(name) {
			return this.options.componentProvider(name)
		},
	};
})();
