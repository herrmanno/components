/// <reference path="../../../dist/components.d.ts"/>

class App extends ho.components.Component {

    attributes = ['Centered']

    requires = ["MyTodoBox"];

    html = "<MyTodoBox centered='40'/>";

}
