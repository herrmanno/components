module ho.components.componentprovider {
    import Promise = ho.promise.Promise;

    export let mapping: {[name:string]:string} = {};

    export class ComponentProvider {

        useMin: boolean = false;

        resolve(name: string): string {
            name = name.split('.').join('/');
            return this.useMin ?
                `components/${name}.min.js` :
                `components/${name}.js`;
        }

        getComponent(name: string): Promise<typeof Component, string> {
            return new Promise<typeof Component, any>((resolve, reject) => {
                let src = mapping[name] || this.resolve(name);
                let script = document.createElement('script');
                script.onload = function() {
                    //Component.register(window[name]);
                    if(typeof this.get(name) === 'function')
                        resolve(this.get(name));
                    else
                        reject(`Error while loading Component ${name}`)
                }.bind(this);
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

        private get(name: string): typeof Component {
            let c: any = window;
            name.split('.').forEach((part) => {
                c = c[part];
            });
            return <typeof Component>c;
        }

    }

    export let instance = new ComponentProvider();

}
