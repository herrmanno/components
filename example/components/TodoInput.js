/// <reference path="../../dist/d.ts/components.d.ts"/>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0lucHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0lucHV0LnRzIl0sIm5hbWVzIjpbIlRvZG9JbnB1dCIsIlRvZG9JbnB1dC5jb25zdHJ1Y3RvciIsIlRvZG9JbnB1dC5pbml0IiwiVG9kb0lucHV0LmFkZFRvZG8iXSwibWFwcGluZ3MiOiJBQUFBLHVEQUF1RDs7Ozs7O0FBSXZEO0lBQXdCQSw2QkFBdUJBO0lBQS9DQTtRQUF3QkMsOEJBQXVCQTtRQUU5Q0EsZUFBVUEsR0FBR0EsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFekJBLFNBQUlBLEdBQWlDQTtZQUM1Q0EsSUFBSUEsRUFBRUEsRUFBRUE7WUFDUkEsSUFBSUEsRUFBRUEsS0FBS0E7U0FDWEEsQ0FBQUE7UUFFREEsU0FBSUEsR0FDSEEsdUtBQytGQSxDQUFDQTtJQXFCbEdBLENBQUNBO0lBZkFELHdCQUFJQSxHQUFKQTtRQUNDRSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREYsMkJBQU9BLEdBQVBBO1FBRUNHLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQzFCQSxDQUFDQTtJQVFGSCxnQkFBQ0E7QUFBREEsQ0FBQ0EsQUFoQ0QsRUFBd0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBZ0M5QztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9kLnRzL2NvbXBvbmVudHMuZC50c1wiLz5cblxuZGVjbGFyZSB2YXIgU3RvcmU6IGFueTtcblxuY2xhc3MgVG9kb0lucHV0IGV4dGVuZHMgaG8uY29tcG9uZW50cy5Db21wb25lbnQge1xuXG5cdGF0dHJpYnV0ZXMgPSBbJ0Rpc2FibGUnLCAnQmluZCddO1xuXG5cdHByaXZhdGUgdG9kbzoge3RleHQ6IHN0cmluZywgZG9uZTpib29sZWFufSA9IHtcblx0XHR0ZXh0OiAnJyxcblx0XHRkb25lOiBmYWxzZVxuXHR9XG5cblx0aHRtbCA9XG5cdFx0YDxpbnB1dCBpZD0ndG9kb2lucHV0JyBwbGFjZWhvbGRlcj0nbmV4dCB0b2RvPycgYmluZD0ndG9kby50ZXh0Jy8+XG5cdFx0PGJ1dHRvbiBpZD0nYWRkYnRuJyBvbmNsaWNrPSd7I2FkZFRvZG8oKX07JyBkaXNhYmxlPSchI2NoaWxkcmVuLnRvZG9pbnB1dC52YWx1ZSMnPkFkZDwvYnV0dG9uPmA7XG5cdFx0Lypcblx0XHRgPGlucHV0IGlkPSd0b2RvaW5wdXQnIG9ua2V5dXA9J3t0b2dnbGVCdXR0b259KHRoaXMudmFsdWUpOycgcGxhY2Vob2xkZXI9J25leHQgdG9kbz8nLz5cblx0XHQ8YnV0dG9uIGlkPSdhZGRidG4nIG9uY2xpY2s9J3sjYWRkVG9kbygpfTsnIGRpc2FibGVkPkFkZDwvYnV0dG9uPmA7XG5cdFx0Ki9cblxuXHRpbml0KCkge1xuXHRcdFN0b3JlLmxpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xuXHR9XG5cblx0YWRkVG9kbygpIHtcblx0XHQvL2xldCB2YWx1ZSA9IHRoaXMuY2hpbGRyZW5bJ3RvZG9pbnB1dCddLnZhbHVlO1xuXHRcdFN0b3JlLmFkZFRvZG8odGhpcy50b2RvKTtcblx0fVxuXG5cdC8qXG5cdHRvZ2dsZUJ1dHRvbih2KSB7XG5cdFx0dGhpcy5jaGlsZHJlblsnYWRkYnRuJ10uZGlzYWJsZWQgPSAhdGhpcy5jaGlsZHJlblsndG9kb2lucHV0J10udmFsdWU7XG5cdH1cblx0Ki9cblxufTtcbiJdfQ==