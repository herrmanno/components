module ho.components {

    export class ComponentProvider {

        getComponent(name: string): Promise {
            return new Promise((resolve, reject) => {
                let src = `components/${name}.js`;
                let script = document.createElement('script');
                script.onload = function() {
                    Component.register(window[name]);
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
        }

    }

}
