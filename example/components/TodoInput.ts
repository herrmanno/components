/// <reference path="../../dist/d.ts/components.d.ts"/>

declare var Store: any;

class TodoInput extends ho.components.Component {

	html =
		`<input id='todoinput' onkeyup='{toggleButton}(this.value);' placeholder='next todo?'/>
		<button id='addbtn' onclick='{#addTodo()};' disabled>Add</button>`;

	init() {
		Store.listeners.push(this.render.bind(this));
	}

	addTodo() {
		let value = this.children['todoinput'].value;
		Store.addTodo({text: value, done: false});
	}

	toggleButton(v) {
		this.children['addbtn'].disabled = !this.children['todoinput'].value;
	}

};
