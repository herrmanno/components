window.Store = {
	listeners: [],

	todos: localStorage.todos ? JSON.parse(localStorage['todos']) : [],

	update: function() {
		localStorage['todos'] = JSON.stringify(this.todos);
		this.listeners.forEach(function(l) {
			l.call();
		});
	},
};
