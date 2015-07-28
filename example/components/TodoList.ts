/// <reference path="../../dist/d.ts/components.d.ts"/>

class TodoList extends ho.components.Component {

	todos: any[] = Store.todos;

	init() {
		Store.listeners.push(function() {
			this.todos = Store.todos;
			this.render();
		}.bind(this));
	}

	toggleDone(index: number): void {
		Store.todos[index].done ^= 1;
		Store.update();
	}

	deleteTodo(index: number): void {
		Store.todos.splice(index, 1);
		Store.update();
	}


}
