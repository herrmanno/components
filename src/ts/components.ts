/// <reference path="./registry"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
import Promise = ho.promise.Promise;

module ho.components {

    export interface ComponentElement extends HTMLElement {
        component?: Component;
    }

    export interface IProprety {
        name: string;
        required?: boolean;
        default?: any;
    }

    export class Component {
        element: ComponentElement;
        original_innerHTML: string;
        html: string;
        properties: Array<string|IProprety> = [];
        property: {[key: string]: string} = {};
        requires: Array<string> = [];
        children: {[key: string]: any} = {};

        static registry: Registry = new Registry();
        //static name: string;

        constructor(element: HTMLElement) {
            //------- init Elemenet and Elements' original innerHTML
            this.element = element;
            this.element.component = this;
            this.original_innerHTML = element.innerHTML;
        }

        public get name(): string {
            return Component.getName(this);
        }

        public getParent(): Component {
            return Component.getComponent(<ComponentElement>this.element.parentNode);
        }

        public _init(): void {
            let render = this.render.bind(this);
            //-------- init Properties
            this.initProperties();

            //------- call init() & loadRequirements() -> then render
            let ready = [this.initHTML(), Promise.create(this.init()), this.loadRequirements()];
            Promise.all(ready)
            .then(() => {
                render();
            })
            .catch((err) => {
                throw err;
            });
        }

        public init(): any {}

        public update(): void {return void 0;}

        public render(): void {
    		Component.registry.render(this);

			this.update();

    		this.initChildren();

    		Component.registry.initElement(this.element);
    	};

        /**
        *  Assure that this instance has an valid html attribute and if not load it.
        */
        private initHTML(): Promise {
            let p = new Promise();
            let self = this;

            if(typeof this.html === 'boolean')
                p.resolve();
            if(typeof this.html === 'string')
                p.resolve();
            if(typeof this.html === 'undefined') {
                //let name = Component.getName(this);
                Component.registry.getHtml(this.name)
                .then((html) => {
                    self.html = html;
                    p.resolve();
                })
                .catch(p.reject);
            }

            return p;
        }

        private initProperties(): void {
            this.properties.forEach(function(prop) {
                if(typeof prop === 'object') {
                    this.properties[prop.name] = this.element[prop.name] || this.element.getAttribute(prop.name) || prop.default;
                    if(this.properties[prop.name] === undefined && prop.required === true)
                        throw `Property ${prop.name} is required but not provided`;
                }
                else if(typeof prop === 'string')
                    this.properties[prop] = this.element[prop] || this.element.getAttribute(prop);
            }.bind(this));
        }

        private initChildren(): void {
            let childs = this.element.querySelectorAll('*');
    		for(let c = 0; c < childs.length; c++) {
    			let child = childs[c];
    			if(child.id) {
    				this.children[child.id] = child;
    			}
    			this.children[child.tagName] = this.children[child.tagName] || [];
                (<Element[]>this.children[child.tagName]).push(child);
    		}
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
            Component.registry.setOptions(opt);
            Component.registry.run();
        }

        static getComponent(element: ComponentElement): Component {
            while(!element.component)
    			element = <ComponentElement>element.parentNode;
    		return element.component;
        }

        static getName(clazz: typeof Component | Component): string {
            if(clazz instanceof Component)
                return clazz.constructor.toString().match(/\w+/g)[1];
            else
                return clazz.toString().match(/\w+/g)[1];
        }


    }
}
