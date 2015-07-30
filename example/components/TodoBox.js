/// <reference path="../../dist/d.ts/components.d.ts"/>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0JveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRvZG9Cb3gudHMiXSwibmFtZXMiOlsiVG9kb0JveCIsIlRvZG9Cb3guY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLHVEQUF1RDs7Ozs7O0FBRXZEO0lBQXNCQSwyQkFBdUJBO0lBQTdDQTtRQUFzQkMsOEJBQXVCQTtRQUU1Q0EsZUFBVUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQUE7UUFFekJBLGFBQVFBLEdBQUdBLENBQUNBLFdBQVdBLEVBQUVBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBRWxEQSxTQUFJQSxHQUNIQSxpRUFFWUEsQ0FBQ0E7SUFFZkEsQ0FBQ0E7SUFBREQsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFYRCxFQUFzQixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFXNUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9kLnRzL2NvbXBvbmVudHMuZC50c1wiLz5cblxuY2xhc3MgVG9kb0JveCBleHRlbmRzIGhvLmNvbXBvbmVudHMuQ29tcG9uZW50IHtcblxuXHRhdHRyaWJ1dGVzID0gWydDZW50ZXJlZCddXG5cblx0cmVxdWlyZXMgPSBbXCJUb2RvQ291bnRcIiwgXCJUb2RvSW5wdXRcIiwgXCJUb2RvTGlzdFwiXTtcblxuXHRodG1sID1cblx0XHRgPFRvZG9Db3VudC8+XG5cdFx0PFRvZG9JbnB1dCBjZW50ZXJlZD1cIjMwXCIvPlxuXHRcdDxUb2RvTGlzdC8+YDtcblxufVxuIl19