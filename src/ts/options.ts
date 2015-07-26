/// <reference path="htmlprovider"/>
/// <reference path="componentsprovider"/>
/// <reference path="renderer"/>

module ho.components {

    export class RegistryOptions {
        htmlProvider: HtmlProvider;
        componentProvider: ComponentProvider;
        renderer: Renderer;

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
