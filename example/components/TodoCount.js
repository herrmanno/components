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
        this.html = "<h4>{done} / {undone}</h4>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9kb0NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9kb0NvdW50LnRzIl0sIm5hbWVzIjpbIlRvZG9Db3VudCIsIlRvZG9Db3VudC5jb25zdHJ1Y3RvciIsIlRvZG9Db3VudC5pbml0IiwiVG9kb0NvdW50LmluaXROdW1iZXJzIiwiVG9kb0NvdW50LnN0b3JlQ2hhbmdlZCJdLCJtYXBwaW5ncyI6IkFBQUEsdURBQXVEOzs7Ozs7QUFFdkQ7SUFBd0JBLDZCQUF1QkE7SUFBL0NBO1FBQXdCQyw4QkFBdUJBO1FBRTlDQSxTQUFJQSxHQUFHQSw0QkFBNEJBLENBQUNBO0lBcUJyQ0EsQ0FBQ0E7SUFoQkFELHdCQUFJQSxHQUFKQTtRQUNDRSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuREEsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBRU9GLCtCQUFXQSxHQUFuQkE7UUFDQ0csSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLFVBQVNBLENBQUNBO1lBQzdCLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRURILGdDQUFZQSxHQUFaQTtRQUNDSSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUNuQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFDRkosZ0JBQUNBO0FBQURBLENBQUNBLEFBdkJELEVBQXdCLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQXVCOUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9kLnRzL2NvbXBvbmVudHMuZC50c1wiLz5cblxuY2xhc3MgVG9kb0NvdW50IGV4dGVuZHMgaG8uY29tcG9uZW50cy5Db21wb25lbnQge1xuXG5cdGh0bWwgPSBcIjxoND57ZG9uZX0gLyB7dW5kb25lfTwvaDQ+XCI7XG5cblx0ZG9uZTogbnVtYmVyO1xuXHR1bmRvbmU6IG51bWJlcjtcblxuXHRpbml0KCkge1xuXHRcdFN0b3JlLmxpc3RlbmVycy5wdXNoKHRoaXMuc3RvcmVDaGFuZ2VkLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuaW5pdE51bWJlcnMoKTtcblx0fVxuXG5cdHByaXZhdGUgaW5pdE51bWJlcnMoKSB7XG5cdFx0dGhpcy5kb25lID0gdGhpcy51bmRvbmUgPSAwO1xuXHRcdFN0b3JlLnRvZG9zLmZvckVhY2goZnVuY3Rpb24odCkge1xuXHRcdFx0dC5kb25lID8gdGhpcy5kb25lKysgOiB0aGlzLnVuZG9uZSsrO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH1cblxuXHRzdG9yZUNoYW5nZWQoKSB7XG5cdFx0dGhpcy5pbml0TnVtYmVycygpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cbn1cbiJdfQ==