/// <reference path="../../../dist/components.d.ts"/>

class TodoBox extends ho.components.Component {

	attributes = ["Centered"];

	requires = ["TodoCount", "TodoInput", "TodoList"];

	html =
		`<TodoCount centered/>
		<TodoInput centered/>
		<TodoList centered/>`;

	style =
		`this {
			border: 2px solid;
		}`;
}
