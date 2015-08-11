module ho.components {

    import Promise = ho.promise.Promise;
    import HtmlProvider = ho.components.htmlprovider.instance;
    import Renderer = ho.components.renderer.instance;

    export interface ComponentElement extends HTMLElement {
        component?: Component;
    }

    export interface IProprety {
        name: string;
        required?: boolean;
        default?: any;
    }

    /**
        Baseclass for Components
        important: do initialization work in Component#init
    */
    export class Component {
        public element: ComponentElement;
        public original_innerHTML: string;
        public html: string = '';
        public style: string = '';
        public properties: Array<string|IProprety> = [];
        public attributes: Array<string> = [];
        public requires: Array<string> = [];
        public children: {[key: string]: any} = {};

        constructor(element: HTMLElement) {
            //------- init Elemenet and Elements' original innerHTML
            this.element = element;
            this.element.component = this;
            this.original_innerHTML = element.innerHTML;
        }

        public get name(): string {
            return Component.getName(this);
        }

        public getName(): string {
            return this.name;
        }

        public getParent(): Component {
            return Component.getComponent(<ComponentElement>this.element.parentNode);
        }

        public _init(): Promise<any, any> {
            let render = this.render.bind(this);
            //-------- init Properties
            this.initProperties();

            //------- call init() & loadRequirements() -> then render
            let ready = [this.initHTML(), Promise.create(this.init()), this.loadRequirements()];

            let p = new Promise<any, any>();

            Promise.all(ready)
            .then(() => {
                p.resolve();
                render();
            })
            .catch((err) => {
                p.reject(err);
                throw err;
            });

            return p;
        }

        /**
            Method that get called after initialization of a new instance.
            Do init-work here.
            May return a Promise.
        */
        public init(): any {}

        public update(): void {return void 0;}

        public render(): void {
    		Renderer.render(this);

    		ho.components.registry.instance.initElement(this.element)
            .then(function() {

                this.initChildren();

                this.initStyle();

                this.initAttributes();

    			this.update();

            }.bind(this));
    	};

        private initStyle(): void {
            if(typeof this.style === 'undefined')
                return;
            if(this.style === null)
                return;
            if(typeof this.style === 'string' && this.style.length === 0)
                return;

            styler.instance.applyStyle(this);
        }

        /**
        *  Assure that this instance has an valid html attribute and if not load and set it.
        */
        private initHTML(): Promise<any,any> {
            let p = new Promise();
            let self = this;

            if(typeof this.html === 'undefined') {
                this.html = '';
                p.resolve();
            }
            else {
                if(this.html.indexOf(".html", this.html.length - ".html".length) !== -1) {
                    HtmlProvider.getHTML(this.name)
                    .then((html) => {
                        self.html = html;
                        p.resolve();
                    })
                    .catch(p.reject);
                } else {
                    p.resolve();
                }
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
    			let child: Element = <Element>childs[c];
    			if(child.id) {
    				this.children[child.id] = child;
    			}
    			if(child.tagName)
                    this.children[child.tagName] = this.children[child.tagName] || [];
                (<Element[]>this.children[child.tagName]).push(child);
    		}
        }

        private initAttributes(): void {
            this.attributes
            .forEach((a) => {
                let attr = ho.components.registry.instance.getAttribute(a);
                Array.prototype.forEach.call(this.element.querySelectorAll(`*[${a}]`), (e: HTMLElement) => {
                    let val = e.hasOwnProperty(a) ? e[a] : e.getAttribute(a);
                    if(typeof val === 'string' && val === '')
                        val = void 0;
                    new attr(e, val).update();
                });
            });
        }

        private loadRequirements() {
    		let components: any[] = this.requires
            .filter((req) => {
                return !ho.components.registry.instance.hasComponent(req);
            })
            .map((req) => {
                return ho.components.registry.instance.loadComponent(req);
            });


            let attributes: any[] = this.attributes
            .filter((req) => {
                return !ho.components.registry.instance.hasAttribute(req);
            })
            .map((req) => {
                return ho.components.registry.instance.loadAttribute(req);
            });


            let promises = components.concat(attributes);

            return Promise.all(promises);
    	};

        /*
        static register(c: typeof Component): void {
            ho.components.registry.instance.register(c);
        }
        */

        /*
        static run(opt?: any) {
            ho.components.registry.instance.setOptions(opt);
            ho.components.registry.instance.run();
        }
        */

        static getComponent(element: ComponentElement): Component {
            while(!element.component)
    			element = <ComponentElement>element.parentNode;
    		return element.component;
        }

        static getName(clazz: typeof Component): string;
        static getName(clazz: Component): string;
        static getName(clazz: (typeof Component) | (Component)): string {
            if(clazz instanceof Component)
                return clazz.constructor.toString().match(/\w+/g)[1];
            else
                return clazz.toString().match(/\w+/g)[1];
        }


    }
}
