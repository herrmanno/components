declare module ho.components {
    class Renderer {
        private r;
        private cache;
        render(component: Component): void;
        private parse(html, root?);
        private renderRepeat(root, models);
        private domToString(root, indent);
        private repl(str, models);
        private evaluate(models, path);
        private evaluateValue(models, path);
        private evaluateValueAndModel(models, path);
        private evaluateExpression(models, path);
        private evaluateFunction(models, path);
        private copyNode(node);
    }
}
