/// <reference path="./componentsprovider.ts"/>
/// <reference path="./attributeprovider.ts"/>

module ho.components.registry {
    import Promise = ho.promise.Promise;

    export class Registry {

        private components: Array<typeof Component> = [];
        private attributes: Array<typeof Attribute> = [];
        //private options: RegistryOptions;
        //private htmlMap: {[key: string]: string} = {};

        /*
        constructor(options?: any) {
            this.options = new RegistryOptions(options);
        }

        public setOptions(options?: any) {
            this.options = new RegistryOptions(options);
        }
        */

        public register(c: typeof Component): void {
            this.components.push(c);
            document.createElement(Component.getName(c));
        }

        public registerAttribute(a: typeof Attribute): void {
            this.attributes.push(a);
        }

        public run(): void {
            this.components.forEach((c)=>{
                this.initComponent(c);
            });
        }

        public initComponent(component: typeof Component, element:HTMLElement|Document=document): void {
            Array.prototype.forEach.call(element.querySelectorAll(Component.getName(component)), function(e) {
				new component(e)._init();
			});
        }

        public initElement(element: HTMLElement): void {
            this.components.forEach((component) => {
                this.initComponent(component, element);
            });
        }

        public hasComponent(name: string): boolean {
            return this.components
                .filter((component) => {
                    return Component.getName(component) === name;
                }).length > 0;
        }

        public hasAttribute(name: string): boolean {
            return this.attributes
                .filter((attribute) => {
                    return Attribute.getName(attribute) === name;
                }).length > 0;
        }

        public getAttribute(name: string): typeof Attribute {
            return this.attributes
            .filter((attribute) => {
                return Attribute.getName(attribute) === name;
            })[0];
        }

        public loadComponent(name: string): Promise<typeof Component, string> {
            let self = this;
            return new Promise<typeof Component, string>((resolve, reject) => {
                ho.components.componentprovider.instance.getComponent(name)
                .then((component) => {
                    self.register(component);
                    resolve(component);
                });
            });
            //return this.options.componentProvider.getComponent(name)
        }

        public loadAttribute(name: string): Promise<typeof Attribute, string> {
            let self = this;
            return new Promise<typeof Attribute, string>((resolve, reject) => {
                ho.components.attributeprovider.instance.getAttribute(name)
                .then((attribute) => {
                    self.registerAttribute(attribute);
                    resolve(attribute);
                });
            });
            //return this.options.componentProvider.getComponent(name)
        }

        /*
        public getHtml(name: string): Promise {
            let p = new Promise();

            if(this.htmlMap[name] !== undefined) {
                p.resolve(this.htmlMap[name])
            }
            else {
                this.options.htmlProvider.getHTML(name)
                .then((html) => {
                    p.resolve(html);
                });
            }

            return p;
        }

        public render(component: Component): void {
            this.options.renderer.render(component);
        }

        */

    }

    export let instance = new Registry();
}
