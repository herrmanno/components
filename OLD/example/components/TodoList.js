CFW.register({

	name: "TodoList",

	requires: [],

	properties: [],

	init: function() {
		this.todos = Store.todos;
		Store.listeners.push(this.update.bind(this));
	},

	update: function() {
		this.todos = Store.todos;
		this.render();
	},

	toggleDone: function(index) {
		Store.todos[index].done ^= true;
		Store.update();
	},

});
