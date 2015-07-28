var ho;
(function (ho) {
    var components;
    (function (components) {
        var ComponentProvider = (function () {
            function ComponentProvider() {
            }
            ComponentProvider.prototype.getComponent = function (name) {
                return new Promise(function (resolve, reject) {
                    var src = "components/" + name + ".js";
                    var script = document.createElement('script');
                    script.onload = function () {
                        components.Component.register(window[name]);
                        resolve();
                    };
                    script.src = src;
                    document.getElementsByTagName('head')[0].appendChild(script);
                });
                /*
                return new Promise((resolve, reject) => {
    
                    let url = `components/${name}.js`;
    
                    let xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        if(xmlhttp.readyState == 4) {
                            let resp = xmlhttp.responseText;
                            if(xmlhttp.status == 200) {
                                let func = resp + "\nreturn  " + name +  "\n//#sourceURL=" + location.origin + '/' + 'url;'
                                let component = new Function("", func)();
                                Component.register(component);
                                resolve(resp);
                            } else {
                                reject(resp);
                            }
                        }
                    };
    
                    xmlhttp.open('GET', url, true);
                    xmlhttp.send();
    
                });
            */
            };
            return ComponentProvider;
        })();
        components.ComponentProvider = ComponentProvider;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
