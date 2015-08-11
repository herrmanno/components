module ho.components.htmlprovider {
    import Promise = ho.promise.Promise;

    export class HtmlProvider {

        private cache: {[kay:string]:string} = {};

        resolve(name: string): string {
            if(ho.components.registry.useDir) {
                name += '.' + name.split('.').pop();
            }

            name = name.split('.').join('/');

            return `components/${name}.html`;
        }

        getHTML(name: string): Promise<string, string> {
            return new Promise((resolve, reject) => {

                if(typeof this.cache[name] === 'string')
                    return resolve(this.cache[name]);

                let url = this.resolve(name);

                let xmlhttp = new XMLHttpRequest();
    			xmlhttp.onreadystatechange = function() {
    				if(xmlhttp.readyState == 4) {
    					let resp = xmlhttp.responseText;
    					if(xmlhttp.status == 200) {
                            resolve(resp);
    					} else {
    						reject(`Error while loading html for Component ${name}`);
    					}
    				}
    			};

    			xmlhttp.open('GET', url, true);
    			xmlhttp.send();

            });
        }
    }

    export let instance = new HtmlProvider();

}
