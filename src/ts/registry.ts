/// <reference path="options"/>

module ho.components {

    export class Registry {

        private options: RegistryOptions;
        private components: Array<typeof Component> = [];
        private htmlMap: {[key: string]: string} = {};


        constructor(options?: any) {
            this.options = new RegistryOptions(options);
        }

        public setOptions(options?: any) {
            this.options = new RegistryOptions(options);
        }

        public register(c: typeof Component): void {
            this.components.push(c);
            document.createElement(Component.getName(c));
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

        public loadComponent(name: string): Promise {
            return this.options.componentProvider.getComponent(name)
        }

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

    }

    export var registry = new Registry();
}
