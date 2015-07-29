/// <reference path="../../dist/d.ts/components.d.ts"/>

class TodoBox extends ho.components.Component {

	requires = ["TodoCount", "TodoInput", "TodoList"];

	html =
		`<style>
			todobox {
				border: 1px dashed red;
			}
		</style>
		<TodoCount/><TodoInput/><TodoList/>`;

}
