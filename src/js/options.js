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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3RzL29wdGlvbnMudHMiXSwibmFtZXMiOlsiaG8iLCJoby5jb21wb25lbnRzIiwiaG8uY29tcG9uZW50cy5SZWdpc3RyeU9wdGlvbnMiLCJoby5jb21wb25lbnRzLlJlZ2lzdHJ5T3B0aW9ucy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEsb0NBQW9DO0FBQ3BDLDBDQUEwQztBQUMxQyxnQ0FBZ0M7QUFFaEMsSUFBTyxFQUFFLENBa0JSO0FBbEJELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxVQUFVQSxDQWtCbkJBO0lBbEJTQSxXQUFBQSxVQUFVQSxFQUFDQSxDQUFDQTtRQUVsQkM7WUFLSUMseUJBQVlBLEdBQVNBO2dCQUx6QkMsaUJBZUNBO2dCQVRPQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDTkEsSUFBSUEsVUFBVUEsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsbUJBQW1CQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtvQkFFbkVBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLFVBQUNBLElBQUlBO3dCQUNwQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQzFCQSxLQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDL0JBLENBQUNBLENBQUNBLENBQUNBO2dCQUNQQSxDQUFDQTtZQUNMQSxDQUFDQTtZQUNMRCxzQkFBQ0E7UUFBREEsQ0FBQ0EsQUFmREQsSUFlQ0E7UUFmWUEsMEJBQWVBLGtCQWUzQkEsQ0FBQUE7SUFDTEEsQ0FBQ0EsRUFsQlNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBa0JuQkE7QUFBREEsQ0FBQ0EsRUFsQk0sRUFBRSxLQUFGLEVBQUUsUUFrQlIiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaHRtbHByb3ZpZGVyXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNvbXBvbmVudHNwcm92aWRlclwiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJyZW5kZXJlclwiLz5cblxubW9kdWxlIGhvLmNvbXBvbmVudHMge1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5T3B0aW9ucyB7XG4gICAgICAgIGh0bWxQcm92aWRlcjogSHRtbFByb3ZpZGVyO1xuICAgICAgICBjb21wb25lbnRQcm92aWRlcjogQ29tcG9uZW50UHJvdmlkZXI7XG4gICAgICAgIHJlbmRlcmVyOiBSZW5kZXJlcjtcblxuICAgICAgICBjb25zdHJ1Y3RvcihvcHQ/OiBhbnkpIHtcbiAgICAgICAgICAgIGlmIChvcHQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydGllcyA9IFsnaHRtbFByb3ZpZGVyJywgJ2NvbXBvbmVudFByb3ZpZGVyJywgJ3JlbmRlcmVyJ107XG5cbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdC5oYXNPd25BdHRyaWJ1dGUobmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW25hbWVdID0gb3B0W25hbWVdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19