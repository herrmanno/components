declare module ho.components {
    class Renderer {
        private r;
        render(component: Component): void;
        private parse(html, root?);
        private renderRepeat(root, models);
        private domToString(root, indent);
        private evaluate(models, path);
        private copyNode(node);
        private repl(str, models);
    }
}
