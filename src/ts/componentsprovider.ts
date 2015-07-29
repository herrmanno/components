module ho.components.componentprovider {
    import Promise = ho.promise.Promise;

    export class ComponentProvider {

        useMin: boolean = false;

        resolve(name: string): string {
            return this.useMin ?
                `components/${name}.min.js` :
                `components/${name}.js`;
        }

        getComponent(name: string): Promise<typeof Component, string> {
            return new Promise<typeof Component, any>((resolve, reject) => {
                let src = this.resolve(name);
                let script = document.createElement('script');
                script.onload = function() {
                    //Component.register(window[name]);
                    if(typeof window[name] === 'function')
                        resolve(window[name]);
                    else
                        reject(`Error while loading Component ${name}`)
                };
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

    }

    export let instance = new ComponentProvider();

}
