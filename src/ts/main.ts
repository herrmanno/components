/// <reference path="./registry.ts"/>

module ho.components {
	export function run() {
		ho.components.registry.instance.run();
	}

	export function register(c: typeof Component | typeof Attribute): void {
		ho.components.registry.instance.register(c);
	}
}
