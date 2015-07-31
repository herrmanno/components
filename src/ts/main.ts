/// <reference path="./registry.ts"/>

module ho.components {
	export function run(): ho.promise.Promise<any, any> {
		return ho.components.registry.instance.run();
	}

	export function register(c: typeof Component | typeof Attribute): void {
		ho.components.registry.instance.register(c);
	}
}
