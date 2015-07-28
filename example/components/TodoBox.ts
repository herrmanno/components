/// <reference path="../../dist/d.ts/components.d.ts"/>

class TodoBox extends ho.components.Component {

	requires = ["TodoCount", "TodoInput", "TodoList"];

	html = "<TodoCount/><TodoInput/><TodoList/>";

}
