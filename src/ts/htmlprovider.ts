module ho.components {

    export class HtmlProvider {

        getHTML(name: string): Promise {
            return new Promise((resolve, reject) => {

                let url = `components/${name}.html`;

                let xmlhttp = new XMLHttpRequest();
    			xmlhttp.onreadystatechange = function() {
    				if(xmlhttp.readyState == 4) {
    					let resp = xmlhttp.responseText;
    					if(xmlhttp.status == 200) {
                            resolve(resp);
    					} else {
    						reject(resp);
    					}
    				}
    			};

    			xmlhttp.open('GET', url, true);
    			xmlhttp.send();

            });
        }

    }

}
