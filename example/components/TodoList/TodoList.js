/// <reference path="../../../dist/components.d.ts"/>
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
        this.html = "TodoList.html";
        this.style = "li {\n\t\t\tcolor: red;\n\t\t\tmax-width: 100px;\n\t\t}";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0xpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUb2RvTGlzdC50cyJdLCJuYW1lcyI6WyJUb2RvTGlzdCIsIlRvZG9MaXN0LmNvbnN0cnVjdG9yIiwiVG9kb0xpc3QuaW5pdCIsIlRvZG9MaXN0LnRvZ2dsZURvbmUiLCJUb2RvTGlzdC5kZWxldGVUb2RvIl0sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7Ozs7OztBQUdyRDtJQUF1QkEsNEJBQXVCQTtJQUE5Q0E7UUFBdUJDLDhCQUF1QkE7UUFFN0NBLFVBQUtBLEdBQVVBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBO1FBRTNCQSxTQUFJQSxHQUFHQSxlQUFlQSxDQUFDQTtRQUN2QkEsVUFBS0EsR0FDSkEseURBR0VBLENBQUNBO0lBbUJMQSxDQUFDQTtJQWpCQUQsdUJBQUlBLEdBQUpBO1FBQ0NFLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBO1lBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRURGLDZCQUFVQSxHQUFWQSxVQUFXQSxLQUFhQTtRQUN2QkcsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVESCw2QkFBVUEsR0FBVkEsVUFBV0EsS0FBYUE7UUFDdkJJLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQzdCQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFRkosZUFBQ0E7QUFBREEsQ0FBQ0EsQUE1QkQsRUFBdUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBNEI3QyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9kaXN0L2NvbXBvbmVudHMuZC50c1wiLz5cblxuXG5jbGFzcyBUb2RvTGlzdCBleHRlbmRzIGhvLmNvbXBvbmVudHMuQ29tcG9uZW50IHtcblxuXHR0b2RvczogYW55W10gPSBTdG9yZS50b2RvcztcblxuXHRodG1sID0gXCJUb2RvTGlzdC5odG1sXCI7XG5cdHN0eWxlID1cblx0XHRgbGkge1xuXHRcdFx0Y29sb3I6IHJlZDtcblx0XHRcdG1heC13aWR0aDogMTAwcHg7XG5cdFx0fWA7XG5cblx0aW5pdCgpIHtcblx0XHRTdG9yZS5saXN0ZW5lcnMucHVzaChmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMudG9kb3MgPSBTdG9yZS50b2Rvcztcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdHRvZ2dsZURvbmUoaW5kZXg6IG51bWJlcik6IHZvaWQge1xuXHRcdFN0b3JlLnRvZG9zW2luZGV4XS5kb25lIF49IDE7XG5cdFx0U3RvcmUudXBkYXRlKCk7XG5cdH1cblxuXHRkZWxldGVUb2RvKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcblx0XHRTdG9yZS50b2Rvcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFN0b3JlLnVwZGF0ZSgpO1xuXHR9XG5cbn1cbiJdfQ==