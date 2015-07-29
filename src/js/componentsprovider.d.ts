declare module ho.components {
    class ComponentProvider {
        useMin: boolean;
        resolve(name: string): string;
        getComponent(name: string): Promise;
    }
}
