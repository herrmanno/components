/// <reference path="../../dist/d.ts/components.d.ts"/>

class TodoBox extends ho.components.Component {

	attributes = ['Centered']

	requires = ["TodoCount", "TodoInput", "TodoList"];

	html =
		`<TodoCount/>
		<TodoInput centered="30"/>
		<TodoList/>`;

}
