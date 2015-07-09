CFW.register({

	name: "TodoInput",

	requires: [],

	html: "<input id='todoinput' onkeyup='{toggleButton}(this.value);' placeholder='next todo?'/><button id='addbtn' onclick='{addTodo}();' disabled>Add</button>",

	properties: [],

	init: function() {
	},

	addTodo: function() {
		//var value = this.findOne('#todoinput').value;
		var value = this.children.todoinput.value;
		Store.todos.push({text: value, done: false});
		Store.update();
	},

	toggleButton: function(v) {
		//this.findOne('#addbtn').disabled = !v;
		this.children.addbtn.disabled = !v;
	},

});
