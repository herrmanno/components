/// <reference path="../../dist/components.d.ts"/>

declare var Store: any;

class TodoInput extends ho.components.Component {

	attributes = ['Disable', 'Bind'];

	private todo: {text: string, done:boolean} = {
		text: '',
		done: false
	}

	html =
		`<input id='todoinput' placeholder='next todo?' bind='todo.text'/>
		<button id='addbtn' onclick='{#addTodo()};' disable='!#children.todoinput.value#'>Add</button>`;
		/*
		`<input id='todoinput' onkeyup='{toggleButton}(this.value);' placeholder='next todo?'/>
		<button id='addbtn' onclick='{#addTodo()};' disabled>Add</button>`;
		*/

	init() {
		Store.listeners.push(this.render.bind(this));
	}

	addTodo() {
		//let value = this.children['todoinput'].value;
		Store.addTodo(this.todo);
	}

	/*
	toggleButton(v) {
		this.children['addbtn'].disabled = !this.children['todoinput'].value;
	}
	*/

};
