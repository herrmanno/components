/// <reference path="./componentsprovider.ts"/>
/// <reference path="./attributeprovider.ts"/>

module ho.components.registry {
    import Promise = ho.promise.Promise;

    export class Registry {

        private components: Array<typeof Component> = [];
        private attributes: Array<typeof Attribute> = [];


        public register(ca: typeof Component | typeof Attribute): void {
            if(ca.prototype instanceof Component) {
                this.components.push(<typeof Component>ca);
                document.createElement(Component.getName(<typeof Component>ca));
            }
            else if(ca.prototype instanceof Attribute) {
                this.attributes.push(<typeof Attribute>ca);
            }
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
                    self.register(attribute);
                    resolve(attribute);
                });
            });
        }

    }

    export let instance = new Registry();
}
