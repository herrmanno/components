/// <reference path="../../../dist/components.d.ts"/>
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
        this.element.style.display = 'block';
        this.element.style.margin = 'auto';
        this.element.style.width = this.value + "%";
    };
    return Centered;
})(ho.components.Attribute);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VudGVyZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjZW50ZXJlZC50cyJdLCJuYW1lcyI6WyJDZW50ZXJlZCIsIkNlbnRlcmVkLmNvbnN0cnVjdG9yIiwiQ2VudGVyZWQudXBkYXRlIl0sIm1hcHBpbmdzIjoiQUFBQSxxREFBcUQ7Ozs7OztBQUVyRDtJQUF1QkEsNEJBQXVCQTtJQUk3Q0Esa0JBQVlBLE9BQU9BLEVBQUVBLEtBQVlBO1FBQVpDLHFCQUFZQSxHQUFaQSxZQUFZQTtRQUNoQ0Esa0JBQU1BLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREQseUJBQU1BLEdBQU5BO1FBQ0NFLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNuQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBTUEsSUFBSUEsQ0FBQ0EsS0FBS0EsTUFBR0EsQ0FBQ0E7SUFDN0NBLENBQUNBO0lBQ0ZGLGVBQUNBO0FBQURBLENBQUNBLEFBZEQsRUFBdUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBYzdDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Rpc3QvY29tcG9uZW50cy5kLnRzXCIvPlxuXG5jbGFzcyBDZW50ZXJlZCBleHRlbmRzIGhvLmNvbXBvbmVudHMuQXR0cmlidXRlIHtcblxuXHRwcml2YXRlIG1hcmdpbjogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGVsZW1lbnQsIHZhbHVlID0gXCI1MFwiKSB7XG5cdFx0c3VwZXIoZWxlbWVudCwgdmFsdWUpO1xuXHRcdHRoaXMubWFyZ2luID0gKDEwMCAtIE51bWJlcih0aGlzLnZhbHVlKSkgLyAyO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHR0aGlzLmVsZW1lbnQuc3R5bGUubWFyZ2luID0gJ2F1dG8nO1xuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3RoaXMudmFsdWV9JWA7XG5cdH1cbn1cbiJdfQ==