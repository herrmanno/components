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
        this.attributes = ['Disable', 'Centered'];
        this.html = "<input id='todoinput' placeholder='next todo?' centered=\"30\"/>\n\t\t<button id='addbtn' onclick='{#addTodo()};' disable='!#children.todoinput.value#'>Add</button>";
    }
    TodoInput.prototype.init = function () {
        Store.listeners.push(this.render.bind(this));
    };
    TodoInput.prototype.addTodo = function () {
        var value = this.children['todoinput'].value;
        Store.addTodo({ text: value, done: false });
    };
    TodoInput.prototype.toggleButton = function (v) {
        this.children['addbtn'].disabled = !this.children['todoinput'].value;
    };
    return TodoInput;
})(ho.components.Component);
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0lucHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0lucHV0LnRzIl0sIm5hbWVzIjpbIlRvZG9JbnB1dCIsIlRvZG9JbnB1dC5jb25zdHJ1Y3RvciIsIlRvZG9JbnB1dC5pbml0IiwiVG9kb0lucHV0LmFkZFRvZG8iLCJUb2RvSW5wdXQudG9nZ2xlQnV0dG9uIl0sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7Ozs7OztBQUl2RDtJQUF3QkEsNkJBQXVCQTtJQUEvQ0E7UUFBd0JDLDhCQUF1QkE7UUFFOUNBLGVBQVVBLEdBQUdBLENBQUNBLFNBQVNBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBRXJDQSxTQUFJQSxHQUNIQSxzS0FDK0ZBLENBQUNBO0lBbUJsR0EsQ0FBQ0E7SUFiQUQsd0JBQUlBLEdBQUpBO1FBQ0NFLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQzlDQSxDQUFDQTtJQUVERiwyQkFBT0EsR0FBUEE7UUFDQ0csSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDN0NBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLEVBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUNBLENBQUNBLENBQUNBO0lBQzNDQSxDQUFDQTtJQUVESCxnQ0FBWUEsR0FBWkEsVUFBYUEsQ0FBQ0E7UUFDYkksSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBRUZKLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXpCRCxFQUF3QixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUF5QjlDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9kaXN0L2QudHMvY29tcG9uZW50cy5kLnRzXCIvPlxuXG5kZWNsYXJlIHZhciBTdG9yZTogYW55O1xuXG5jbGFzcyBUb2RvSW5wdXQgZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XG5cblx0YXR0cmlidXRlcyA9IFsnRGlzYWJsZScsICdDZW50ZXJlZCddO1xuXG5cdGh0bWwgPVxuXHRcdGA8aW5wdXQgaWQ9J3RvZG9pbnB1dCcgcGxhY2Vob2xkZXI9J25leHQgdG9kbz8nIGNlbnRlcmVkPVwiMzBcIi8+XG5cdFx0PGJ1dHRvbiBpZD0nYWRkYnRuJyBvbmNsaWNrPSd7I2FkZFRvZG8oKX07JyBkaXNhYmxlPSchI2NoaWxkcmVuLnRvZG9pbnB1dC52YWx1ZSMnPkFkZDwvYnV0dG9uPmA7XG5cdFx0Lypcblx0XHRgPGlucHV0IGlkPSd0b2RvaW5wdXQnIG9ua2V5dXA9J3t0b2dnbGVCdXR0b259KHRoaXMudmFsdWUpOycgcGxhY2Vob2xkZXI9J25leHQgdG9kbz8nLz5cblx0XHQ8YnV0dG9uIGlkPSdhZGRidG4nIG9uY2xpY2s9J3sjYWRkVG9kbygpfTsnIGRpc2FibGVkPkFkZDwvYnV0dG9uPmA7XG5cdFx0Ki9cblxuXHRpbml0KCkge1xuXHRcdFN0b3JlLmxpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xuXHR9XG5cblx0YWRkVG9kbygpIHtcblx0XHRsZXQgdmFsdWUgPSB0aGlzLmNoaWxkcmVuWyd0b2RvaW5wdXQnXS52YWx1ZTtcblx0XHRTdG9yZS5hZGRUb2RvKHt0ZXh0OiB2YWx1ZSwgZG9uZTogZmFsc2V9KTtcblx0fVxuXG5cdHRvZ2dsZUJ1dHRvbih2KSB7XG5cdFx0dGhpcy5jaGlsZHJlblsnYWRkYnRuJ10uZGlzYWJsZWQgPSAhdGhpcy5jaGlsZHJlblsndG9kb2lucHV0J10udmFsdWU7XG5cdH1cblxufTtcbiJdfQ==