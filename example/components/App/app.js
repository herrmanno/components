/// <reference path="../../../dist/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        _super.apply(this, arguments);
        this.attributes = ['Centered'];
        this.requires = ["Todo.MyTodoBox"];
        this.html = "<MyTodoBox centered='40'/>";
    }
    return App;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbIkFwcCIsIkFwcC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEscURBQXFEOzs7Ozs7QUFFckQ7SUFBa0JBLHVCQUF1QkE7SUFBekNBO1FBQWtCQyw4QkFBdUJBO1FBRXJDQSxlQUFVQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFBQTtRQUV6QkEsYUFBUUEsR0FBR0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQTtRQUU5QkEsU0FBSUEsR0FBR0EsNEJBQTRCQSxDQUFDQTtJQUV4Q0EsQ0FBQ0E7SUFBREQsVUFBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxFQUFrQixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFReEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vZGlzdC9jb21wb25lbnRzLmQudHNcIi8+XHJcblxyXG5jbGFzcyBBcHAgZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XHJcblxyXG4gICAgYXR0cmlidXRlcyA9IFsnQ2VudGVyZWQnXVxyXG5cclxuICAgIHJlcXVpcmVzID0gW1wiVG9kby5NeVRvZG9Cb3hcIl07XHJcblxyXG4gICAgaHRtbCA9IFwiPE15VG9kb0JveCBjZW50ZXJlZD0nNDAnLz5cIjtcclxuXHJcbn1cclxuIl19