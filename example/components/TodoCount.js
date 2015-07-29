/// <reference path="../../dist/d.ts/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TodoCount = (function (_super) {
    __extends(TodoCount, _super);
    function TodoCount() {
        _super.apply(this, arguments);
        this.attributes = ["Bordered"];
        this.html = "<h4 bordered>{done} / {undone}</h4>";
    }
    TodoCount.prototype.init = function () {
        Store.listeners.push(this.storeChanged.bind(this));
        this.initNumbers();
    };
    TodoCount.prototype.initNumbers = function () {
        this.done = this.undone = 0;
        Store.todos.forEach(function (t) {
            t.done ? this.done++ : this.undone++;
        }.bind(this));
    };
    TodoCount.prototype.storeChanged = function () {
        this.initNumbers();
        this.render();
    };
    return TodoCount;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0NvdW50LnRzIl0sIm5hbWVzIjpbIlRvZG9Db3VudCIsIlRvZG9Db3VudC5jb25zdHJ1Y3RvciIsIlRvZG9Db3VudC5pbml0IiwiVG9kb0NvdW50LmluaXROdW1iZXJzIiwiVG9kb0NvdW50LnN0b3JlQ2hhbmdlZCJdLCJtYXBwaW5ncyI6IkFBQUEsdURBQXVEOzs7Ozs7QUFFdkQ7SUFBd0JBLDZCQUF1QkE7SUFBL0NBO1FBQXdCQyw4QkFBdUJBO1FBRTlDQSxlQUFVQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUUxQkEsU0FBSUEsR0FBR0EscUNBQXFDQSxDQUFDQTtJQXFCOUNBLENBQUNBO0lBaEJBRCx3QkFBSUEsR0FBSkE7UUFDQ0UsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUVPRiwrQkFBV0EsR0FBbkJBO1FBQ0NHLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBQzVCQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFTQSxDQUFDQTtZQUM3QixDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEMsQ0FBQyxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVESCxnQ0FBWUEsR0FBWkE7UUFDQ0ksSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQ2ZBLENBQUNBO0lBQ0ZKLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXpCRCxFQUF3QixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUF5QjlDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Rpc3QvZC50cy9jb21wb25lbnRzLmQudHNcIi8+XG5cbmNsYXNzIFRvZG9Db3VudCBleHRlbmRzIGhvLmNvbXBvbmVudHMuQ29tcG9uZW50IHtcblxuXHRhdHRyaWJ1dGVzID0gW1wiQm9yZGVyZWRcIl07XG5cblx0aHRtbCA9IFwiPGg0IGJvcmRlcmVkPntkb25lfSAvIHt1bmRvbmV9PC9oND5cIjtcblxuXHRkb25lOiBudW1iZXI7XG5cdHVuZG9uZTogbnVtYmVyO1xuXG5cdGluaXQoKSB7XG5cdFx0U3RvcmUubGlzdGVuZXJzLnB1c2godGhpcy5zdG9yZUNoYW5nZWQuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5pbml0TnVtYmVycygpO1xuXHR9XG5cblx0cHJpdmF0ZSBpbml0TnVtYmVycygpIHtcblx0XHR0aGlzLmRvbmUgPSB0aGlzLnVuZG9uZSA9IDA7XG5cdFx0U3RvcmUudG9kb3MuZm9yRWFjaChmdW5jdGlvbih0KSB7XG5cdFx0XHR0LmRvbmUgPyB0aGlzLmRvbmUrKyA6IHRoaXMudW5kb25lKys7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdHN0b3JlQ2hhbmdlZCgpIHtcblx0XHR0aGlzLmluaXROdW1iZXJzKCk7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxufVxuIl19