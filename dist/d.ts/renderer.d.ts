declare module ho.components {
    class Renderer {
        private tmpCount;
        private r;
        private cache;
        render(component: Component): void;
        private parse(html, root?);
        private renderRepeat(root, models);
        private domToString(root, indent);
        private evaluate(models, path);
        private evaluateValue(models, path);
        private evaluateExpression(models, path);
        private evaluateFunction(models, path);
        private copyNode(node);
        private repl(str, models);
    }
}
