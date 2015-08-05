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

        public run(): Promise<any, any> {
            let initComponent: (c: typeof Component)=>Promise<any, any> = this.initComponent.bind(this);
            let promises: Array<Promise<any, any>> = this.components.map((c)=>{
                return initComponent(c);
            });

            return Promise.all(promises);
        }

        public initComponent(component: typeof Component, element:HTMLElement|Document=document): Promise<any, any> {
            let promises: Array<Promise<any, any>> = Array.prototype.map.call(
                element.querySelectorAll(Component.getName(component)),
                function(e): Promise<any, any> {
	                return new component(e)._init();
                }
			);

            return Promise.all(promises);
        }

        public initElement(element: HTMLElement): Promise<any, any> {
            let initComponent: (c: typeof Component, element: HTMLElement)=>Promise<any, any> = this.initComponent.bind(this);
            let promises: Array<Promise<any, any>> = Array.prototype.map.call(
                this.components,
                component => {
                    return initComponent(component, element);
                }
            );

            return Promise.all(promises);
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

            return this.getParentOfComponent(name)
            .then((parent) => {
                if(self.hasComponent(parent) || parent === 'ho.components.Component')
                    return true;
                else return self.loadComponent(parent);
            })
            .then((parentType) => {
                return ho.components.componentprovider.instance.getComponent(name)
            })
            .then((component) => {
                self.register(component);
                return component;
            });
            //return this.options.componentProvider.getComponent(name)
        }

        public loadAttribute(name: string): Promise<typeof Attribute, string> {
            let self = this;

            return this.getParentOfAttribute(name)
            .then((parent) => {
                if(self.hasAttribute(parent) || parent === 'ho.components.Attribute' || parent === 'ho.components.WatchAttribute')
                    return true;
                else return self.loadAttribute(parent);
            })
            .then((parentType) => {
                return ho.components.attributeprovider.instance.getAttribute(name)
            })
            .then((attribute) => {
                self.register(attribute);
                return attribute;
            });

            /*
            let self = this;
            return new Promise<typeof Attribute, string>((resolve, reject) => {
                ho.components.attributeprovider.instance.getAttribute(name)
                .then((attribute) => {
                    self.register(attribute);
                    resolve(attribute);
                });
            });
            */
        }

        protected getParentOfComponent(name: string): Promise<string, any> {
            return this.getParentOfClass(ho.components.componentprovider.instance.resolve(name));
        }

        protected getParentOfAttribute(name: string): Promise<string, any> {
            return this.getParentOfClass(ho.components.attributeprovider.instance.resolve(name));
        }

        protected getParentOfClass(path: string): Promise<string, any> {
            return new Promise((resolve, reject) => {

                let xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = () => {
                    if(xmlhttp.readyState == 4) {
                        let resp = xmlhttp.responseText;
                        if(xmlhttp.status == 200) {
                            let m = resp.match(/}\)\((.*)\);/);
                            if(m !== null) {
                                resolve(m[1]);
                            }
                            else {
                                resolve(null);
                            }
                        } else {
                            reject(resp);
                        }

                    }
                };

                xmlhttp.open('GET', path);
                xmlhttp.send();

            });
        }

    }

    export let instance = new Registry();
}
