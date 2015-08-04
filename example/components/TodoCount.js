/// <reference path="../../dist/components.d.ts"/>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0NvdW50LnRzIl0sIm5hbWVzIjpbIlRvZG9Db3VudCIsIlRvZG9Db3VudC5jb25zdHJ1Y3RvciIsIlRvZG9Db3VudC5pbml0IiwiVG9kb0NvdW50LmluaXROdW1iZXJzIiwiVG9kb0NvdW50LnN0b3JlQ2hhbmdlZCJdLCJtYXBwaW5ncyI6IkFBQUEsa0RBQWtEOzs7Ozs7QUFFbEQ7SUFBd0JBLDZCQUF1QkE7SUFBL0NBO1FBQXdCQyw4QkFBdUJBO1FBRTlDQSxlQUFVQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUUxQkEsU0FBSUEsR0FBR0EscUNBQXFDQSxDQUFDQTtJQXFCOUNBLENBQUNBO0lBaEJBRCx3QkFBSUEsR0FBSkE7UUFDQ0UsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUVPRiwrQkFBV0EsR0FBbkJBO1FBQ0NHLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBQzVCQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFTQSxDQUFDQTtZQUM3QixDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEMsQ0FBQyxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVESCxnQ0FBWUEsR0FBWkE7UUFDQ0ksSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQ2ZBLENBQUNBO0lBQ0ZKLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXpCRCxFQUF3QixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUF5QjlDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Rpc3QvY29tcG9uZW50cy5kLnRzXCIvPlxuXG5jbGFzcyBUb2RvQ291bnQgZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XG5cblx0YXR0cmlidXRlcyA9IFtcIkJvcmRlcmVkXCJdO1xuXG5cdGh0bWwgPSBcIjxoNCBib3JkZXJlZD57ZG9uZX0gLyB7dW5kb25lfTwvaDQ+XCI7XG5cblx0ZG9uZTogbnVtYmVyO1xuXHR1bmRvbmU6IG51bWJlcjtcblxuXHRpbml0KCkge1xuXHRcdFN0b3JlLmxpc3RlbmVycy5wdXNoKHRoaXMuc3RvcmVDaGFuZ2VkLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuaW5pdE51bWJlcnMoKTtcblx0fVxuXG5cdHByaXZhdGUgaW5pdE51bWJlcnMoKSB7XG5cdFx0dGhpcy5kb25lID0gdGhpcy51bmRvbmUgPSAwO1xuXHRcdFN0b3JlLnRvZG9zLmZvckVhY2goZnVuY3Rpb24odCkge1xuXHRcdFx0dC5kb25lID8gdGhpcy5kb25lKysgOiB0aGlzLnVuZG9uZSsrO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH1cblxuXHRzdG9yZUNoYW5nZWQoKSB7XG5cdFx0dGhpcy5pbml0TnVtYmVycygpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cbn1cbiJdfQ==