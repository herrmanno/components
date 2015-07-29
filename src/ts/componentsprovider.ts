module ho.components {

    export class ComponentProvider {

        useMin: boolean = false;

        resolve(name: string): string {
            return this.useMin ?
                `components/${name}.min.js` :
                `components/${name}.js`;
        }

        getComponent(name: string): Promise {
            return new Promise((resolve, reject) => {
                let src = this.resolve(name);
                let script = document.createElement('script');
                script.onload = function() {
                    Component.register(window[name]);
                    resolve();
                };
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

    }

}
