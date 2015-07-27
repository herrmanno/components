/// <reference path="htmlprovider"/>
/// <reference path="componentsprovider"/>
/// <reference path="renderer"/>
var ho;
(function (ho) {
    var components;
    (function (components) {
        var RegistryOptions = (function () {
            function RegistryOptions(opt) {
                var _this = this;
                this.htmlProvider = new components.HtmlProvider();
                this.componentProvider = new components.ComponentProvider();
                this.renderer = new components.Renderer();
                if (opt) {
                    var properties = ['htmlProvider', 'componentProvider', 'renderer'];
                    properties.forEach(function (name) {
                        if (opt.hasOwnAttribute(name))
                            _this[name] = opt[name];
                    });
                }
            }
            return RegistryOptions;
        })();
        components.RegistryOptions = RegistryOptions;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3RzL29wdGlvbnMudHMiXSwibmFtZXMiOlsiaG8iLCJoby5jb21wb25lbnRzIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeU9wdGlvbnMiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5T3B0aW9ucy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEsb0NBQW9DO0FBQ3BDLDBDQUEwQztBQUMxQyxnQ0FBZ0M7QUFFaEMsSUFBTyxFQUFFLENBa0JSO0FBbEJELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQWtCbkJBO0lBbEJTQSxXQUFBQSxVQUFVQSxFQUFDQSxDQUFDQTtRQUVsQkM7WUFLSUMseUJBQVlBLEdBQVNBO2dCQUx6QkMsaUJBZUNBO2dCQWRHQSxpQkFBWUEsR0FBaUJBLElBQUlBLHVCQUFZQSxFQUFFQSxDQUFDQTtnQkFDaERBLHNCQUFpQkEsR0FBc0JBLElBQUlBLDRCQUFpQkEsRUFBRUEsQ0FBQ0E7Z0JBQy9EQSxhQUFRQSxHQUFhQSxJQUFJQSxtQkFBUUEsRUFBRUEsQ0FBQ0E7Z0JBR2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDTkEsSUFBSUEsVUFBVUEsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsbUJBQW1CQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtvQkFFbkVBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLFVBQUNBLElBQUlBO3dCQUNwQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQzFCQSxLQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDL0JBLENBQUNBLENBQUNBLENBQUNBO2dCQUNQQSxDQUFDQTtZQUNMQSxDQUFDQTtZQUNMRCxzQkFBQ0E7UUFBREEsQ0FBQ0EsQUFmREQsSUFlQ0E7UUFmWUEsMEJBQWVBLGtCQWUzQkEsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUFsQlNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBa0JuQkE7QUFBREEsQ0FBQ0EsRUFsQk0sRUFBRSxLQUFGLEVBQUUsUUFrQlIiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaHRtbHByb3ZpZGVyXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiY29tcG9uZW50c3Byb3ZpZGVyXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicmVuZGVyZXJcIi8+XHJcblxyXG5tb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5T3B0aW9ucyB7XHJcbiAgICAgICAgaHRtbFByb3ZpZGVyOiBIdG1sUHJvdmlkZXIgPSBuZXcgSHRtbFByb3ZpZGVyKCk7XHJcbiAgICAgICAgY29tcG9uZW50UHJvdmlkZXI6IENvbXBvbmVudFByb3ZpZGVyID0gbmV3IENvbXBvbmVudFByb3ZpZGVyKCk7XHJcbiAgICAgICAgcmVuZGVyZXI6IFJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9wdD86IGFueSkge1xyXG4gICAgICAgICAgICBpZiAob3B0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydGllcyA9IFsnaHRtbFByb3ZpZGVyJywgJ2NvbXBvbmVudFByb3ZpZGVyJywgJ3JlbmRlcmVyJ107XHJcblxyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdC5oYXNPd25BdHRyaWJ1dGUobmFtZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbbmFtZV0gPSBvcHRbbmFtZV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=