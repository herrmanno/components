/// <reference path="options"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Registry = (function () {
            function Registry(options) {
                this.components = [];
                this.options = new components.RegistryOptions(options);
            }
            Registry.prototype.setOptions = function (options) {
                this.options = new components.RegistryOptions(options);
            };
            Registry.prototype.register = function (c) {
                this.components.push(c);
                document.createElement(c.name);
            };
            Registry.prototype.run = function () {
                var _this = this;
                this.components.forEach(function (c) {
                    _this.initComponent(c);
                });
            };
            Registry.prototype.initComponent = function (component, element) {
                if (element === void 0) { element = document; }
                Array.prototype.forEach.call(element.querySelectorAll(component.name), function (e) {
                    new component(e)._init();
                });
            };
            Registry.prototype.initElement = function (element) {
                var _this = this;
                this.components.forEach(function (component) {
                    _this.initComponent(component, element);
                });
            };
            Registry.prototype.hasComponent = function (name) {
                return this.components
                    .filter(function (component) {
                    return component.name === name;
                }).length > 0;
            };
            Registry.prototype.loadComponent = function (name) {
                return this.options.componentProvider.getComponent(name);
            };
            Registry.prototype.render = function (component) {
                this.options.renderer.render(component);
            };
            return Registry;
        })();
        components.Registry = Registry;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90cy9yZWdpc3RyeS50cyJdLCJuYW1lcyI6WyJobyIsImhvLmNvbXBvbmVudHMiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5IiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeS5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkuc2V0T3B0aW9ucyIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkucmVnaXN0ZXIiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5LnJ1biIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkuaW5pdENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkuaW5pdEVsZW1lbnQiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5Lmhhc0NvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkubG9hZENvbXBvbmVudCIsImhvLmNvbXBvbmVudHMuUmVnaXN0cnkucmVuZGVyIl0sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFFL0IsSUFBTyxFQUFFLENBdURSO0FBdkRELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQXVEbkJBO0lBdkRTQSxXQUFBQSxVQUFVQSxFQUFDQSxDQUFDQTtRQUVsQkM7WUFNSUMsa0JBQVlBLE9BQWFBO2dCQUhqQkMsZUFBVUEsR0FBNEJBLEVBQUVBLENBQUNBO2dCQUk3Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsMEJBQWVBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ2hEQSxDQUFDQTtZQUVNRCw2QkFBVUEsR0FBakJBLFVBQWtCQSxPQUFhQTtnQkFDM0JFLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLDBCQUFlQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUNoREEsQ0FBQ0E7WUFFTUYsMkJBQVFBLEdBQWZBLFVBQWdCQSxDQUFtQkE7Z0JBQy9CRyxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDeEJBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ25DQSxDQUFDQTtZQUVNSCxzQkFBR0EsR0FBVkE7Z0JBQUFJLGlCQUlDQTtnQkFIR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsQ0FBQ0E7b0JBQ3RCQSxLQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ1BBLENBQUNBO1lBRU1KLGdDQUFhQSxHQUFwQkEsVUFBcUJBLFNBQTJCQSxFQUFFQSxPQUFxQ0E7Z0JBQXJDSyx1QkFBcUNBLEdBQXJDQSxrQkFBcUNBO2dCQUNuRkEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxVQUFTQSxDQUFDQTtvQkFDekYsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzFCLENBQUMsQ0FBQ0EsQ0FBQ0E7WUFDRUEsQ0FBQ0E7WUFFTUwsOEJBQVdBLEdBQWxCQSxVQUFtQkEsT0FBb0JBO2dCQUF2Q00saUJBSUNBO2dCQUhHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxTQUFTQTtvQkFDOUJBLEtBQUlBLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO2dCQUMzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDUEEsQ0FBQ0E7WUFFTU4sK0JBQVlBLEdBQW5CQSxVQUFvQkEsSUFBWUE7Z0JBQzVCTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQTtxQkFDakJBLE1BQU1BLENBQUNBLFVBQUNBLFNBQVNBO29CQUNkQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxDQUFDQTtnQkFDbkNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1lBQ3RCQSxDQUFDQTtZQUVNUCxnQ0FBYUEsR0FBcEJBLFVBQXFCQSxJQUFZQTtnQkFDN0JRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGlCQUFpQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQUE7WUFDNURBLENBQUNBO1lBRU1SLHlCQUFNQSxHQUFiQSxVQUFjQSxTQUFvQkE7Z0JBQzlCUyxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUM1Q0EsQ0FBQ0E7WUFFTFQsZUFBQ0E7UUFBREEsQ0FBQ0EsQUFwRERELElBb0RDQTtRQXBEWUEsbUJBQVFBLFdBb0RwQkEsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUF2RFNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBdURuQkE7QUFBREEsQ0FBQ0EsRUF2RE0sRUFBRSxLQUFGLEVBQUUsUUF1RFIiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwib3B0aW9uc1wiLz5cclxuXHJcbm1vZHVsZSBoby5jb21wb25lbnRzIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUmVnaXN0cnkge1xyXG5cclxuICAgICAgICBwcml2YXRlIG9wdGlvbnM6IFJlZ2lzdHJ5T3B0aW9ucztcclxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudHM6IEFycmF5PHR5cGVvZiBDb21wb25lbnQ+ID0gW107XHJcblxyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBSZWdpc3RyeU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0T3B0aW9ucyhvcHRpb25zPzogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBSZWdpc3RyeU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChjLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJ1bigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGMpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRDb21wb25lbnQoYyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluaXRDb21wb25lbnQoY29tcG9uZW50OiB0eXBlb2YgQ29tcG9uZW50LCBlbGVtZW50OkhUTUxFbGVtZW50fERvY3VtZW50PWRvY3VtZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGNvbXBvbmVudC5uYW1lKSwgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdG5ldyBjb21wb25lbnQoZSkuX2luaXQoKTtcclxuXHRcdFx0fSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdEVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q29tcG9uZW50KGNvbXBvbmVudCwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5uYW1lID09PSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmNvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudChuYW1lKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcihjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucmVuZGVyZXIucmVuZGVyKGNvbXBvbmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG4iXX0=