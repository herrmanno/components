/// <reference path="options"/>

module ho.components {

    export class Registry {

        private options: RegistryOptions;
        private components: Array<typeof Component> = [];


        constructor(options?: any) {
            this.options = new RegistryOptions(options);
        }

        public setOptions(options?: any) {
            this.options = new RegistryOptions(options);
        }

        public register(c: typeof Component): void {
            this.components.push(c);
            document.createElement(c.name);
        }

        public run(): void {
            this.components.forEach((c)=>{
                this.initComponent(c);
            });
        }

        public initComponent(component: typeof Component, element:HTMLElement|Document=document): void {
            Array.prototype.forEach.call(element.querySelectorAll(component.name), function(e) {
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
                    return component.name === name;
                }).length > 0;
        }

        public loadComponent(name: string): Promise {
            return this.options.componentProvider.getComponent(name)
        }

        public render(component: Component): void {
            this.options.renderer.render(component);
        }

    }
}
