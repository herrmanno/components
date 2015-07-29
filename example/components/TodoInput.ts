/// <reference path="../../dist/d.ts/components.d.ts"/>

declare var Store: any;

class TodoInput extends ho.components.Component {

	attributes = ['Disable', 'Centered'];

	html =
		`<input id='todoinput' placeholder='next todo?' centered="30"/>
		<button id='addbtn' onclick='{#addTodo()};' disable='!#children.todoinput.value#'>Add</button>`;
		/*
		`<input id='todoinput' onkeyup='{toggleButton}(this.value);' placeholder='next todo?'/>
		<button id='addbtn' onclick='{#addTodo()};' disabled>Add</button>`;
		*/

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
