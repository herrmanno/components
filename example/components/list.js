/// <reference path="../../dist/d.ts/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var List = (function (_super) {
    __extends(List, _super);
    function List() {
        _super.apply(this, arguments);
        this.todos = ["test", "eins", "zwei"];
        this.html = "<ul><li repeat='todos as t'>{t}</li></ul>";
    }
    List.name = "List";
    return List;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QudHMiXSwibmFtZXMiOlsiTGlzdCIsIkxpc3QuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLHVEQUF1RDs7Ozs7O0FBRXZEO0lBQW1CQSx3QkFBdUJBO0lBQTFDQTtRQUFtQkMsOEJBQXVCQTtRQUl0Q0EsVUFBS0EsR0FBYUEsQ0FBQ0EsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFM0NBLFNBQUlBLEdBQUdBLDJDQUEyQ0EsQ0FBQ0E7SUFFdkRBLENBQUNBO0lBTlVELFNBQUlBLEdBQUdBLE1BQU1BLENBQUNBO0lBTXpCQSxXQUFDQTtBQUFEQSxDQUFDQSxBQVJELEVBQW1CLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQVF6QyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9kaXN0L2QudHMvY29tcG9uZW50cy5kLnRzXCIvPlxyXG5cclxuY2xhc3MgTGlzdCBleHRlbmRzIGhvLmNvbXBvbmVudHMuQ29tcG9uZW50IHtcclxuXHJcbiAgICBzdGF0aWMgbmFtZSA9IFwiTGlzdFwiO1xyXG5cclxuICAgIHRvZG9zOiBzdHJpbmdbXSA9IFtcInRlc3RcIiwgXCJlaW5zXCIsIFwiendlaVwiXTtcclxuXHJcbiAgICBodG1sID0gXCI8dWw+PGxpIHJlcGVhdD0ndG9kb3MgYXMgdCc+e3R9PC9saT48L3VsPlwiO1xyXG5cclxufVxyXG4iXX0=