/// <reference path="../../dist/d.ts/components.d.ts"/>

class TodoCount extends ho.components.Component {

	attributes = ["Bordered"];

	html = "<h4 bordered>{done} / {undone}</h4>";

	done: number;
	undone: number;

	init() {
		Store.listeners.push(this.storeChanged.bind(this));
		this.initNumbers();
	}

	private initNumbers() {
		this.done = this.undone = 0;
		Store.todos.forEach(function(t) {
			t.done ? this.done++ : this.undone++;
		}.bind(this));
	}

	storeChanged() {
		this.initNumbers();
		this.render();
	}
}
