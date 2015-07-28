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
        this.html = "<input id='todoinput' onkeyup='{toggleButton}(this.value);' placeholder='next todo?'/>\n\t\t<button id='addbtn' onclick='{#addTodo()};' disabled>Add</button>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0lucHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0lucHV0LnRzIl0sIm5hbWVzIjpbIlRvZG9JbnB1dCIsIlRvZG9JbnB1dC5jb25zdHJ1Y3RvciIsIlRvZG9JbnB1dC5pbml0IiwiVG9kb0lucHV0LmFkZFRvZG8iLCJUb2RvSW5wdXQudG9nZ2xlQnV0dG9uIl0sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7Ozs7OztBQUl2RDtJQUF3QkEsNkJBQXVCQTtJQUEvQ0E7UUFBd0JDLDhCQUF1QkE7UUFFOUNBLFNBQUlBLEdBQ0hBLCtKQUNrRUEsQ0FBQ0E7SUFlckVBLENBQUNBO0lBYkFELHdCQUFJQSxHQUFKQTtRQUNDRSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREYsMkJBQU9BLEdBQVBBO1FBQ0NHLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO1FBQzdDQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFFREgsZ0NBQVlBLEdBQVpBLFVBQWFBLENBQUNBO1FBQ2JJLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLFFBQVFBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUVGSixnQkFBQ0E7QUFBREEsQ0FBQ0EsQUFuQkQsRUFBd0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBbUI5QztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9kLnRzL2NvbXBvbmVudHMuZC50c1wiLz5cblxuZGVjbGFyZSB2YXIgU3RvcmU6IGFueTtcblxuY2xhc3MgVG9kb0lucHV0IGV4dGVuZHMgaG8uY29tcG9uZW50cy5Db21wb25lbnQge1xuXG5cdGh0bWwgPVxuXHRcdGA8aW5wdXQgaWQ9J3RvZG9pbnB1dCcgb25rZXl1cD0ne3RvZ2dsZUJ1dHRvbn0odGhpcy52YWx1ZSk7JyBwbGFjZWhvbGRlcj0nbmV4dCB0b2RvPycvPlxuXHRcdDxidXR0b24gaWQ9J2FkZGJ0bicgb25jbGljaz0neyNhZGRUb2RvKCl9OycgZGlzYWJsZWQ+QWRkPC9idXR0b24+YDtcblxuXHRpbml0KCkge1xuXHRcdFN0b3JlLmxpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xuXHR9XG5cblx0YWRkVG9kbygpIHtcblx0XHRsZXQgdmFsdWUgPSB0aGlzLmNoaWxkcmVuWyd0b2RvaW5wdXQnXS52YWx1ZTtcblx0XHRTdG9yZS5hZGRUb2RvKHt0ZXh0OiB2YWx1ZSwgZG9uZTogZmFsc2V9KTtcblx0fVxuXG5cdHRvZ2dsZUJ1dHRvbih2KSB7XG5cdFx0dGhpcy5jaGlsZHJlblsnYWRkYnRuJ10uZGlzYWJsZWQgPSAhdGhpcy5jaGlsZHJlblsndG9kb2lucHV0J10udmFsdWU7XG5cdH1cblxufTtcbiJdfQ==