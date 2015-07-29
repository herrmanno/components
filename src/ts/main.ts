/// <reference path="./registry.ts"/>

module ho.components {
	export function run() {
		ho.components.registry.instance.run();
	}

	export function register(component: typeof Component): void {
		ho.components.registry.instance.register(component);
	}
}
