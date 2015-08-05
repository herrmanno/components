declare module ho.components.styler {
    interface IStyler {
        applyStyle(component: Component, css?: string): void;
    }
    let instance: IStyler;
}
