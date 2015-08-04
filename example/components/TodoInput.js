/// <reference path="../../dist/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TodoInput = (function (_super) {
    __extends(TodoInput, _super);
    function TodoInput() {
        _super.apply(this, arguments);
        this.attributes = ['Disable', 'Bind'];
        this.todo = {
            text: '',
            done: false
        };
        this.html = "<input id='todoinput' placeholder='next todo?' bind='todo.text'/>\n\t\t<button id='addbtn' onclick='{#addTodo()};' disable='!#children.todoinput.value#'>Add</button>";
    }
    TodoInput.prototype.init = function () {
        Store.listeners.push(this.render.bind(this));
    };
    TodoInput.prototype.addTodo = function () {
        Store.addTodo(this.todo);
    };
    return TodoInput;
})(ho.components.Component);
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0lucHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0lucHV0LnRzIl0sIm5hbWVzIjpbIlRvZG9JbnB1dCIsIlRvZG9JbnB1dC5jb25zdHJ1Y3RvciIsIlRvZG9JbnB1dC5pbml0IiwiVG9kb0lucHV0LmFkZFRvZG8iXSwibWFwcGluZ3MiOiJBQUFBLGtEQUFrRDs7Ozs7O0FBSWxEO0lBQXdCQSw2QkFBdUJBO0lBQS9DQTtRQUF3QkMsOEJBQXVCQTtRQUU5Q0EsZUFBVUEsR0FBR0EsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFekJBLFNBQUlBLEdBQWlDQTtZQUM1Q0EsSUFBSUEsRUFBRUEsRUFBRUE7WUFDUkEsSUFBSUEsRUFBRUEsS0FBS0E7U0FDWEEsQ0FBQUE7UUFFREEsU0FBSUEsR0FDSEEsdUtBQytGQSxDQUFDQTtJQXFCbEdBLENBQUNBO0lBZkFELHdCQUFJQSxHQUFKQTtRQUNDRSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREYsMkJBQU9BLEdBQVBBO1FBRUNHLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQzFCQSxDQUFDQTtJQVFGSCxnQkFBQ0E7QUFBREEsQ0FBQ0EsQUFoQ0QsRUFBd0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBZ0M5QztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9jb21wb25lbnRzLmQudHNcIi8+XG5cbmRlY2xhcmUgdmFyIFN0b3JlOiBhbnk7XG5cbmNsYXNzIFRvZG9JbnB1dCBleHRlbmRzIGhvLmNvbXBvbmVudHMuQ29tcG9uZW50IHtcblxuXHRhdHRyaWJ1dGVzID0gWydEaXNhYmxlJywgJ0JpbmQnXTtcblxuXHRwcml2YXRlIHRvZG86IHt0ZXh0OiBzdHJpbmcsIGRvbmU6Ym9vbGVhbn0gPSB7XG5cdFx0dGV4dDogJycsXG5cdFx0ZG9uZTogZmFsc2Vcblx0fVxuXG5cdGh0bWwgPVxuXHRcdGA8aW5wdXQgaWQ9J3RvZG9pbnB1dCcgcGxhY2Vob2xkZXI9J25leHQgdG9kbz8nIGJpbmQ9J3RvZG8udGV4dCcvPlxuXHRcdDxidXR0b24gaWQ9J2FkZGJ0bicgb25jbGljaz0neyNhZGRUb2RvKCl9OycgZGlzYWJsZT0nISNjaGlsZHJlbi50b2RvaW5wdXQudmFsdWUjJz5BZGQ8L2J1dHRvbj5gO1xuXHRcdC8qXG5cdFx0YDxpbnB1dCBpZD0ndG9kb2lucHV0JyBvbmtleXVwPSd7dG9nZ2xlQnV0dG9ufSh0aGlzLnZhbHVlKTsnIHBsYWNlaG9sZGVyPSduZXh0IHRvZG8/Jy8+XG5cdFx0PGJ1dHRvbiBpZD0nYWRkYnRuJyBvbmNsaWNrPSd7I2FkZFRvZG8oKX07JyBkaXNhYmxlZD5BZGQ8L2J1dHRvbj5gO1xuXHRcdCovXG5cblx0aW5pdCgpIHtcblx0XHRTdG9yZS5saXN0ZW5lcnMucHVzaCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdGFkZFRvZG8oKSB7XG5cdFx0Ly9sZXQgdmFsdWUgPSB0aGlzLmNoaWxkcmVuWyd0b2RvaW5wdXQnXS52YWx1ZTtcblx0XHRTdG9yZS5hZGRUb2RvKHRoaXMudG9kbyk7XG5cdH1cblxuXHQvKlxuXHR0b2dnbGVCdXR0b24odikge1xuXHRcdHRoaXMuY2hpbGRyZW5bJ2FkZGJ0biddLmRpc2FibGVkID0gIXRoaXMuY2hpbGRyZW5bJ3RvZG9pbnB1dCddLnZhbHVlO1xuXHR9XG5cdCovXG5cbn07XG4iXX0=