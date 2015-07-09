CFW.register({

	name: "InnerHTML",

	requires: [],

	html: false,

	properties: ["selector"],

	init: function() {
		this.selector = this.selector || '*';
	},

	updated: function() {
		this.element.InnerHTML = null;

		var parent = this.getParent();

		var temp = document.createElement('div');
		temp.innerHTML = parent.orig_innerHTML;

		var el = temp.querySelectorAll(this.selector);
		for(var e = 0; e < el.length; e++) {
			this.element.appendChild(el[e]);
		}
	},


});
