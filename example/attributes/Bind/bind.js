/// <reference path="../../dist/d.ts/attribute.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Bind = (function (_super) {
    __extends(Bind, _super);
    function Bind() {
        _super.apply(this, arguments);
    }
    Bind.prototype.init = function () {
        switch (this.element.tagName) {
            case 'INPUT':
                this.bindInput();
                break;
            default: throw "Bind: unsupported element " + this.element.tagName;
        }
    };
    Bind.prototype.bindInput = function () {
        var _this = this;
        this.element.onkeyup = function (e) {
            _this.eval(_this.value + " = '" + _this.element.value + "'");
        };
    };
    return Bind;
})(ho.components.WatchAttribute);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJpbmQudHMiXSwibmFtZXMiOlsiQmluZCIsIkJpbmQuY29uc3RydWN0b3IiLCJCaW5kLmluaXQiLCJCaW5kLmJpbmRJbnB1dCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEOzs7Ozs7QUFFdEQ7SUFBbUJBLHdCQUE0QkE7SUFBL0NBO1FBQW1CQyw4QkFBNEJBO0lBaUIvQ0EsQ0FBQ0E7SUFmQUQsbUJBQUlBLEdBQUpBO1FBQ0NFLE1BQU1BLENBQUFBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxLQUFLQSxPQUFPQTtnQkFDWEEsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7Z0JBQ2pCQSxLQUFLQSxDQUFDQTtZQUNQQSxTQUFTQSxNQUFNQSwrQkFBNkJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQVNBLENBQUNBO1FBQ3BFQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVPRix3QkFBU0EsR0FBakJBO1FBQUFHLGlCQUlDQTtRQUhBQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxHQUFHQSxVQUFDQSxDQUFDQTtZQUN4QkEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBSUEsS0FBSUEsQ0FBQ0EsS0FBS0EsWUFBMEJBLEtBQUlBLENBQUNBLE9BQVFBLENBQUNBLEtBQUtBLE1BQUdBLENBQUNBLENBQUNBO1FBQzFFQSxDQUFDQSxDQUFBQTtJQUNGQSxDQUFDQTtJQUVGSCxXQUFDQTtBQUFEQSxDQUFDQSxBQWpCRCxFQUFtQixFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFpQjlDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Rpc3QvZC50cy9hdHRyaWJ1dGUuZC50c1wiLz5cblxuY2xhc3MgQmluZCBleHRlbmRzIGhvLmNvbXBvbmVudHMuV2F0Y2hBdHRyaWJ1dGUge1xuXG5cdGluaXQoKSB7XG5cdFx0c3dpdGNoKHRoaXMuZWxlbWVudC50YWdOYW1lKSB7XG5cdFx0XHRjYXNlICdJTlBVVCc6XG5cdFx0XHRcdHRoaXMuYmluZElucHV0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhyb3cgYEJpbmQ6IHVuc3VwcG9ydGVkIGVsZW1lbnQgJHt0aGlzLmVsZW1lbnQudGFnTmFtZX1gO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYmluZElucHV0KCkge1xuXHRcdHRoaXMuZWxlbWVudC5vbmtleXVwID0gKGUpID0+IHtcblx0XHRcdHRoaXMuZXZhbChgJHt0aGlzLnZhbHVlfSA9ICckeyg8SFRNTElucHV0RWxlbWVudD50aGlzLmVsZW1lbnQpLnZhbHVlfSdgKTtcblx0XHR9XG5cdH1cblxufVxuIl19