/// <reference path="../../../dist/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TodoBox = (function (_super) {
    __extends(TodoBox, _super);
    function TodoBox() {
        _super.apply(this, arguments);
        this.attributes = ["Centered"];
        this.requires = ["TodoCount", "TodoInput", "TodoList"];
        this.html = "<TodoCount centered/>\n\t\t<TodoInput centered/>\n\t\t<TodoList centered/>";
        this.style = "this {\n\t\t\tborder: 2px solid;\n\t\t}";
    }
    return TodoBox;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0JveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRvZG9Cb3gudHMiXSwibmFtZXMiOlsiVG9kb0JveCIsIlRvZG9Cb3guY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDs7Ozs7O0FBRXJEO0lBQXNCQSwyQkFBdUJBO0lBQTdDQTtRQUFzQkMsOEJBQXVCQTtRQUU1Q0EsZUFBVUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFMUJBLGFBQVFBLEdBQUdBLENBQUNBLFdBQVdBLEVBQUVBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBRWxEQSxTQUFJQSxHQUNIQSw0RUFFcUJBLENBQUNBO1FBRXZCQSxVQUFLQSxHQUNKQSx5Q0FFRUEsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFBREQsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFmRCxFQUFzQixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFlNUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vZGlzdC9jb21wb25lbnRzLmQudHNcIi8+XG5cbmNsYXNzIFRvZG9Cb3ggZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XG5cblx0YXR0cmlidXRlcyA9IFtcIkNlbnRlcmVkXCJdO1xuXG5cdHJlcXVpcmVzID0gW1wiVG9kb0NvdW50XCIsIFwiVG9kb0lucHV0XCIsIFwiVG9kb0xpc3RcIl07XG5cblx0aHRtbCA9XG5cdFx0YDxUb2RvQ291bnQgY2VudGVyZWQvPlxuXHRcdDxUb2RvSW5wdXQgY2VudGVyZWQvPlxuXHRcdDxUb2RvTGlzdCBjZW50ZXJlZC8+YDtcblxuXHRzdHlsZSA9XG5cdFx0YHRoaXMge1xuXHRcdFx0Ym9yZGVyOiAycHggc29saWQ7XG5cdFx0fWA7XG59XG4iXX0=