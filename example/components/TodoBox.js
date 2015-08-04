/// <reference path="../../dist/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TodoBox = (function (_super) {
    __extends(TodoBox, _super);
    function TodoBox() {
        _super.apply(this, arguments);
        this.attributes = ['Centered'];
        this.requires = ["TodoCount", "TodoInput", "TodoList"];
        this.html = "<TodoCount/>\n\t\t<TodoInput centered=\"30\"/>\n\t\t<TodoList/>";
    }
    return TodoBox;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0JveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRvZG9Cb3gudHMiXSwibmFtZXMiOlsiVG9kb0JveCIsIlRvZG9Cb3guY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLGtEQUFrRDs7Ozs7O0FBRWxEO0lBQXNCQSwyQkFBdUJBO0lBQTdDQTtRQUFzQkMsOEJBQXVCQTtRQUU1Q0EsZUFBVUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQUE7UUFFekJBLGFBQVFBLEdBQUdBLENBQUNBLFdBQVdBLEVBQUVBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBRWxEQSxTQUFJQSxHQUNIQSxpRUFFWUEsQ0FBQ0E7SUFFZkEsQ0FBQ0E7SUFBREQsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFYRCxFQUFzQixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFXNUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9jb21wb25lbnRzLmQudHNcIi8+XG5cbmNsYXNzIFRvZG9Cb3ggZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XG5cblx0YXR0cmlidXRlcyA9IFsnQ2VudGVyZWQnXVxuXG5cdHJlcXVpcmVzID0gW1wiVG9kb0NvdW50XCIsIFwiVG9kb0lucHV0XCIsIFwiVG9kb0xpc3RcIl07XG5cblx0aHRtbCA9XG5cdFx0YDxUb2RvQ291bnQvPlxuXHRcdDxUb2RvSW5wdXQgY2VudGVyZWQ9XCIzMFwiLz5cblx0XHQ8VG9kb0xpc3QvPmA7XG5cbn1cbiJdfQ==