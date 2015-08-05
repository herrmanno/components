/// <reference path="../../dist/d.ts/attribute.d.ts"/>
/// <reference path="../../bower_components/ho-watch/dist/d.ts/watch.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Disable = (function (_super) {
    __extends(Disable, _super);
    function Disable() {
        _super.apply(this, arguments);
    }
    Disable.prototype.update = function () {
        var v = this.eval(this.value);
        this.element.hidden = !!v;
    };
    return Disable;
})(ho.components.WatchAttribute);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpc2FibGUudHMiXSwibmFtZXMiOlsiRGlzYWJsZSIsIkRpc2FibGUuY29uc3RydWN0b3IiLCJEaXNhYmxlLnVwZGF0ZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3RELDRFQUE0RTs7Ozs7O0FBRTVFO0lBQXNCQSwyQkFBNEJBO0lBQWxEQTtRQUFzQkMsOEJBQTRCQTtJQU1sREEsQ0FBQ0E7SUFKQUQsd0JBQU1BLEdBQU5BO1FBQ0NFLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFBQTtJQUMxQkEsQ0FBQ0E7SUFDRkYsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFORCxFQUFzQixFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFNakQiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9kLnRzL2F0dHJpYnV0ZS5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8td2F0Y2gvZGlzdC9kLnRzL3dhdGNoLmQudHNcIi8+XG5cbmNsYXNzIERpc2FibGUgZXh0ZW5kcyBoby5jb21wb25lbnRzLldhdGNoQXR0cmlidXRlIHtcblxuXHR1cGRhdGUoKSB7XG5cdFx0bGV0IHYgPSB0aGlzLmV2YWwodGhpcy52YWx1ZSk7XG5cdFx0dGhpcy5lbGVtZW50LmhpZGRlbiA9ICEhdlxuXHR9XG59XG4iXX0=