/// <reference path="../../../dist/components.d.ts"/>


class TodoList extends ho.components.Component {

	todos: any[] = Store.todos;

	html = "TodoList.html";
	style =
		`li {
			color: red;
			max-width: 180px;
		}`;

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
