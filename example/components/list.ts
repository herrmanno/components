/// <reference path="../../dist/d.ts/components.d.ts"/>

class List extends ho.components.Component {

    static name = "List";

    todos: string[] = ["test", "eins", "zwei"];

    html = "<ul><li repeat='todos as t'>{t}</li></ul>";

}
