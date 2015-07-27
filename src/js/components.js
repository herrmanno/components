/// <reference path="./registry"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var Promise = ho.promise.Promise;
var ho;
(function (ho) {
    var components;
    (function (components) {
        var Component = (function () {
            function Component(element) {
                this.properties = [];
                this.requires = [];
                //------- init Elemenet and Elements' original innerHTML
                this.element = element;
                this.element.component = this;
                this.original_innerHTML = element.innerHTML;
            }
            Component.prototype._init = function () {
                var _this = this;
                //-------- init Properties
                this.initProperties();
                //------- call init() & loadRequirements() -> then render
                var ready = [this.init(), this.loadRequirements()];
                Promise.all(ready)
                    .then(function () {
                    _this.render();
                })
                    .catch(function (err) {
                    throw err;
                });
            };
            Component.prototype.init = function () { return new Promise(function (resolve) { resolve(); }); };
            Component.prototype.update = function () { return void 0; };
            Component.prototype.render = function () {
                Component.registry.render(this);
                this.update();
                //this.initChildren();
                Component.registry.initElement(this.element);
            };
            ;
            Component.prototype.initProperties = function () {
                var _this = this;
                var tmp = this.properties;
                this.properties = {};
                tmp.forEach(function (prop) {
                    _this.properties[prop] = _this.element[prop] || _this.element.getAttribute(prop);
                });
            };
            Component.prototype.loadRequirements = function () {
                var promises = this.requires
                    .filter(function (req) {
                    return !Component.registry.hasComponent(req);
                })
                    .map(function (req) {
                    return Component.registry.loadComponent(req);
                });
                return Promise.all(promises);
            };
            ;
            Component.register = function (c) {
                Component.registry.register(c);
            };
            Component.run = function (opt) {
                Component.registry.setOptions(opt);
                Component.registry.run();
            };
            Component.registry = new components.Registry();
            return Component;
        })();
        components.Component = Component;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3RzL2NvbXBvbmVudHMudHMiXSwibmFtZXMiOlsiaG8iLCJoby5jb21wb25lbnRzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudC5jb25zdHJ1Y3RvciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50Ll9pbml0IiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQuaW5pdCIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LnVwZGF0ZSIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LnJlbmRlciIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LmluaXRQcm9wZXJ0aWVzIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQubG9hZFJlcXVpcmVtZW50cyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50LnJlZ2lzdGVyIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnQucnVuIl0sIm1hcHBpbmdzIjoiQUFFQSxBQUZBLGtDQUFrQztBQUNsQyxnRkFBZ0Y7QUFDaEYsSUFBTyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFFcEMsSUFBTyxFQUFFLENBZ0ZSO0FBaEZELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQWdGbkJBO0lBaEZTQSxXQUFBQSxVQUFVQSxFQUFDQSxDQUFDQTtRQUVsQkM7WUFVSUMsbUJBQVlBLE9BQW9CQTtnQkFOaENDLGVBQVVBLEdBQXNCQSxFQUFFQSxDQUFDQTtnQkFDbkNBLGFBQVFBLEdBQWtCQSxFQUFFQSxDQUFDQTtnQkFPekJBLEFBREFBLHdEQUF3REE7Z0JBQ3hEQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxPQUFPQSxDQUFDQTtnQkFDdkJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUM5QkEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxPQUFP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QUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO2dCQUNuQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDN0JBLENBQUNBO1lBbkVNVCxrQkFBUUEsR0FBYUEsSUFBSUEsbUJBQVFBLEVBQUVBLENBQUNBO1lBc0UvQ0EsZ0JBQUNBO1FBQURBLENBQUNBLEFBN0VERCxJQTZFQ0E7UUE3RVlBLG9CQUFTQSxZQTZFckJBLENBQUFBO0lBQ0xBLENBQUNBLEVBaEZTRCxVQUFVQSxHQUFWQSxhQUFVQSxLQUFWQSxhQUFVQSxRQWdGbkJBO0FBQURBLENBQUNBLEVBaEZNLEVBQUUsS0FBRixFQUFFLFFBZ0ZSIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVnaXN0cnlcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cclxuaW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XHJcbiAgICAgICAgZWxlbWVudDogYW55O1xyXG4gICAgICAgIG9yaWdpbmFsX2lubmVySFRNTDogc3RyaW5nO1xyXG4gICAgICAgIGh0bWw6IHN0cmluZztcclxuICAgICAgICBwcm9wZXJ0aWVzOiBBcnJheTxzdHJpbmc+fGFueSA9IFtdO1xyXG4gICAgICAgIHJlcXVpcmVzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgICAgIHN0YXRpYyByZWdpc3RyeTogUmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTtcclxuICAgICAgICBzdGF0aWMgbmFtZTogc3RyaW5nO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0gaW5pdCBFbGVtZW5ldCBhbmQgRWxlbWVudHMnIG9yaWdpbmFsIGlubmVySFRNTFxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY29tcG9uZW50ID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbF9pbm5lckhUTUwgPSBlbGVtZW50LmlubmVySFRNTDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBfaW5pdCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8tLS0tLS0tLSBpbml0IFByb3BlcnRpZXNcclxuICAgICAgICAgICAgdGhpcy5pbml0UHJvcGVydGllcygpO1xyXG5cclxuICAgICAgICAgICAgLy8tLS0tLS0tIGNhbGwgaW5pdCgpICYgbG9hZFJlcXVpcmVtZW50cygpIC0+IHRoZW4gcmVuZGVyXHJcbiAgICAgICAgICAgIGxldCByZWFkeSA9IFt0aGlzLmluaXQoKSwgdGhpcy5sb2FkUmVxdWlyZW1lbnRzKCldO1xyXG4gICAgICAgICAgICBQcm9taXNlLmFsbChyZWFkeSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW5pdCgpOiBQcm9taXNlIHtyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpPT57cmVzb2x2ZSgpO30pO31cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtyZXR1cm4gdm9pZCAwO31cclxuXHJcbiAgICAgICAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgIFx0XHRDb21wb25lbnQucmVnaXN0cnkucmVuZGVyKHRoaXMpO1xyXG5cclxuXHRcdFx0dGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICBcdFx0Ly90aGlzLmluaXRDaGlsZHJlbigpO1xyXG5cclxuICAgIFx0XHRDb21wb25lbnQucmVnaXN0cnkuaW5pdEVsZW1lbnQodGhpcy5lbGVtZW50KTtcclxuICAgIFx0fTtcclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgaW5pdFByb3BlcnRpZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCB0bXAgPSB0aGlzLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcGVydGllcyA9IHt9O1xyXG4gICAgICAgICAgICB0bXAuZm9yRWFjaCgocHJvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3BdID0gdGhpcy5lbGVtZW50W3Byb3BdIHx8IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUocHJvcCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBsb2FkUmVxdWlyZW1lbnRzKCkge1xyXG4gICAgXHRcdGxldCBwcm9taXNlcyA9IHRoaXMucmVxdWlyZXNcclxuICAgICAgICAgICAgLmZpbHRlcigocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIUNvbXBvbmVudC5yZWdpc3RyeS5oYXNDb21wb25lbnQocmVxKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm1hcCgocmVxKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50LnJlZ2lzdHJ5LmxvYWRDb21wb25lbnQocmVxKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgXHR9O1xyXG5cclxuICAgICAgICBzdGF0aWMgcmVnaXN0ZXIoYzogdHlwZW9mIENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBDb21wb25lbnQucmVnaXN0cnkucmVnaXN0ZXIoYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgcnVuKG9wdD86IGFueSkge1xyXG4gICAgICAgICAgICBDb21wb25lbnQucmVnaXN0cnkuc2V0T3B0aW9ucyhvcHQpO1xyXG4gICAgICAgICAgICBDb21wb25lbnQucmVnaXN0cnkucnVuKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn1cclxuIl19