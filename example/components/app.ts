/// <reference path="../../dist/d.ts/components.d.ts"/>

class App extends ho.components.Component {

    static name: string = "App";

    properties: string[] = ["name"]

    html: string = "<h3>${this.properties.username}</h3>";

}
