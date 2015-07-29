declare class Test<T extends any> {
    constrcutor(): void;
    getT(): T;
}
declare let t: Test<{}>;
declare let r1: string;
