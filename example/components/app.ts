/// <reference path="../../dist/d.ts/components.d.ts"/>

class App extends ho.components.Component {

    static name = "App";

    properties = ["username"];

    html = "<h3>{properties.username}</h3>";

}
