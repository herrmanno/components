/// <reference path="htmlprovider"/>
/// <reference path="componentsprovider"/>
/// <reference path="renderer"/>

module ho.components {

    export class RegistryOptions {
        htmlProvider: HtmlProvider = new HtmlProvider();
        componentProvider: ComponentProvider = new ComponentProvider();
        renderer: Renderer = new Renderer();

        constructor(opt?: any) {
            if (opt) {
                let properties = ['htmlProvider', 'componentProvider', 'renderer'];

                properties.forEach((name) => {
                    if (opt.hasOwnAttribute(name))
                        this[name] = opt[name];
                });
            }
        }
    }
}
