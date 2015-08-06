/// <reference path="./attribute.ts"/>

module ho.components.attributeprovider {
    import Promise = ho.promise.Promise;

    export let mapping: {[name:string]:string} = {};

    export class AttributeProvider {

        useMin: boolean = false;


        resolve(name: string): string {
            if(!!mapping[name])
                return mapping[name];

            if(ho.components.dir) {
                name += '.' + name.split('.').pop();
            }

            name = name.split('.').join('/');

            return this.useMin ?
                `attributes/${name}.min.js` :
                `attributes/${name}.js`;
        }

        getAttribute(name: string): Promise<typeof Attribute, string> {
            return new Promise<typeof Attribute, any>((resolve, reject) => {
                let src = this.resolve(name);
                let script = document.createElement('script');
                script.onload = function() {
                    //Component.register(window[name]);
                    if(typeof window[name] === 'function')
                        resolve(window[name]);
                    else
                        reject(`Error while loading Attribute ${name}`)
                };
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

    }

    export let instance = new AttributeProvider();

}
