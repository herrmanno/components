/// <reference path="../../dist/d.ts/attribute.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Centered = (function (_super) {
    __extends(Centered, _super);
    function Centered(element, value) {
        if (value === void 0) { value = "50"; }
        _super.call(this, element, value);
        this.margin = (100 - Number(this.value)) / 2;
    }
    Centered.prototype.update = function () {
        this.element.style.position = 'relative';
        this.element.style.left = this.margin + "%";
        this.element.style.width = this.value + "%";
    };
    return Centered;
})(ho.components.Attribute);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VudGVyZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjZW50ZXJlZC50cyJdLCJuYW1lcyI6WyJDZW50ZXJlZCIsIkNlbnRlcmVkLmNvbnN0cnVjdG9yIiwiQ2VudGVyZWQudXBkYXRlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7Ozs7OztBQUV0RDtJQUF1QkEsNEJBQXVCQTtJQUk3Q0Esa0JBQVlBLE9BQU9BLEVBQUVBLEtBQVlBO1FBQVpDLHFCQUFZQSxHQUFaQSxZQUFZQTtRQUNoQ0Esa0JBQU1BLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREQseUJBQU1BLEdBQU5BO1FBQ0NFLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLEdBQUdBLFVBQVVBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFNQSxJQUFJQSxDQUFDQSxNQUFNQSxNQUFHQSxDQUFDQTtRQUM1Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBTUEsSUFBSUEsQ0FBQ0EsS0FBS0EsTUFBR0EsQ0FBQ0E7SUFDN0NBLENBQUNBO0lBQ0ZGLGVBQUNBO0FBQURBLENBQUNBLEFBZEQsRUFBdUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBYzdDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Rpc3QvZC50cy9hdHRyaWJ1dGUuZC50c1wiLz5cblxuY2xhc3MgQ2VudGVyZWQgZXh0ZW5kcyBoby5jb21wb25lbnRzLkF0dHJpYnV0ZSB7XG5cblx0cHJpdmF0ZSBtYXJnaW46IG51bWJlcjtcblxuXHRjb25zdHJ1Y3RvcihlbGVtZW50LCB2YWx1ZSA9IFwiNTBcIikge1xuXHRcdHN1cGVyKGVsZW1lbnQsIHZhbHVlKTtcblx0XHR0aGlzLm1hcmdpbiA9ICgxMDAgLSBOdW1iZXIodGhpcy52YWx1ZSkpIC8gMjtcblx0fVxuXG5cdHVwZGF0ZSgpIHtcblx0XHR0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7dGhpcy5tYXJnaW59JWA7XG5cdFx0dGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gYCR7dGhpcy52YWx1ZX0lYDtcblx0fVxufVxuIl19