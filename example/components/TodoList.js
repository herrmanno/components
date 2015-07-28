/// <reference path="../../dist/d.ts/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TodoList = (function (_super) {
    __extends(TodoList, _super);
    function TodoList() {
        _super.apply(this, arguments);
        this.todos = Store.todos;
    }
    TodoList.prototype.init = function () {
        Store.listeners.push(function () {
            this.todos = Store.todos;
            this.render();
        }.bind(this));
    };
    TodoList.prototype.toggleDone = function (index) {
        Store.todos[index].done ^= 1;
        Store.update();
    };
    TodoList.prototype.deleteTodo = function (index) {
        Store.todos.splice(index, 1);
        Store.update();
    };
    return TodoList;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0xpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUb2RvTGlzdC50cyJdLCJuYW1lcyI6WyJUb2RvTGlzdCIsIlRvZG9MaXN0LmNvbnN0cnVjdG9yIiwiVG9kb0xpc3QuaW5pdCIsIlRvZG9MaXN0LnRvZ2dsZURvbmUiLCJUb2RvTGlzdC5kZWxldGVUb2RvIl0sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7Ozs7OztBQUV2RDtJQUF1QkEsNEJBQXVCQTtJQUE5Q0E7UUFBdUJDLDhCQUF1QkE7UUFFN0NBLFVBQUtBLEdBQVVBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBO0lBb0I1QkEsQ0FBQ0E7SUFsQkFELHVCQUFJQSxHQUFKQTtRQUNDRSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQyxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVERiw2QkFBVUEsR0FBVkEsVUFBV0EsS0FBYUE7UUFDdkJHLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBO1FBQzdCQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFREgsNkJBQVVBLEdBQVZBLFVBQVdBLEtBQWFBO1FBQ3ZCSSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3QkEsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBR0ZKLGVBQUNBO0FBQURBLENBQUNBLEFBdEJELEVBQXVCLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQXNCN0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9kLnRzL2NvbXBvbmVudHMuZC50c1wiLz5cblxuY2xhc3MgVG9kb0xpc3QgZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XG5cblx0dG9kb3M6IGFueVtdID0gU3RvcmUudG9kb3M7XG5cblx0aW5pdCgpIHtcblx0XHRTdG9yZS5saXN0ZW5lcnMucHVzaChmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMudG9kb3MgPSBTdG9yZS50b2Rvcztcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdHRvZ2dsZURvbmUoaW5kZXg6IG51bWJlcik6IHZvaWQge1xuXHRcdFN0b3JlLnRvZG9zW2luZGV4XS5kb25lIF49IDE7XG5cdFx0U3RvcmUudXBkYXRlKCk7XG5cdH1cblxuXHRkZWxldGVUb2RvKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcblx0XHRTdG9yZS50b2Rvcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFN0b3JlLnVwZGF0ZSgpO1xuXHR9XG5cblxufVxuIl19