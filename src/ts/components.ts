/// <reference path="./registry"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
import Promise = ho.promise.Promise;

module ho.components {

    export class Component {
        element: any;
        original_innerHTML: string = undefined;
        html: string;
        properties: Array<string> = [];
        requires: Array<string> = [];

        static registry: Registry;
        static name: string;

        constructor(element: HTMLElement) {
            //------- init Elemenet and Elements' originla innerHTML
            this.element = element;
            this.element.component = this;
            this.original_innerHTML = element.innerHTML;

            //-------- init Properties
            this.initProperties();

            //------- call init() & loadRequirements() -> then render
            let ready = [this.init(), this.loadRequirements()];
            Promise.all(ready)
            .then(() => {
                this.render();
            })
            .catch((err) => {
                throw err;
            });
        }

        public init(): Promise {return new Promise((resolve)=>{resolve();});}

        public update(): void {return void 0;}

        public render(): void {
    		Component.registry.render(this);

			this.update();

    		//this.initChildren();

    		Component.registry.initElement(this.element);
    	};


        private initProperties(): void {
            this.properties = this.properties.map((prop) => {
                return this.element[prop] || this.element.getAttribute(prop);
            });
        }

        private loadRequirements() {
    		let promises = this.requires
            .filter((req) => {
                return !Component.registry.hasComponent(req);
            })
            .map((req) => {
                return Component.registry.loadComponent(req);
            });

            return Promise.all(promises);
    	};

        static register(c: typeof Component): void {
            Component.registry.register(c);
        }

        static run(opt?: any) {
            Component.registry = new Registry(opt);
            Component.registry.run();
        }


    }
}
