var ho;
(function (ho) {
    var components;
    (function (components) {
        var ComponentProvider = (function () {
            function ComponentProvider() {
                this.useMin = false;
            }
            ComponentProvider.prototype.resolve = function (name) {
                return this.useMin ?
                    "components/" + name + ".min.js" :
                    "components/" + name + ".js";
            };
            ComponentProvider.prototype.getComponent = function (name) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    var src = _this.resolve(name);
                    var script = document.createElement('script');
                    script.onload = function () {
                        components.Component.register(window[name]);
                        resolve();
                    };
                    script.src = src;
                    document.getElementsByTagName('head')[0].appendChild(script);
                });
            };
            return ComponentProvider;
        })();
        components.ComponentProvider = ComponentProvider;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
